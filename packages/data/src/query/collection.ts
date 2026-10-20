import {
  createMutation,
  createQuery,
  type QueryKey,
  useQueryClient,
} from '@tanstack/solid-query'
import type { Accessor } from 'solid-js'
import type { NewRecord, Repository } from './repository'

/**
 * A list and the four things a page does to it.
 *
 * `createCollection` is the kit's answer to "how does a page hold its records":
 * one query for the list, and mutations that are **optimistic and reversible** —
 * a patch lands on screen immediately, and a failed request puts the previous
 * list back. The page renders `isPending` / `error` and never touches the cache.
 *
 * The list is keyed by `key`, so two panes reading the same collection share one
 * request and one update. The repository stays the only place that knows where
 * the records come from.
 */

export interface ListQuery<T> {
  /** The records; `[]` while the first request is in flight. */
  rows: Accessor<T[]>
  /** The first request has not settled. */
  isPending: Accessor<boolean>
  /** A request is in flight, first or refetch. */
  isFetching: Accessor<boolean>
  /** The last request failed; `error` says why. */
  isError: Accessor<boolean>
  error: Accessor<Error | undefined>
  /** Re-run the list request (the "Try again" button). */
  refetch: () => Promise<unknown>
}

export interface CollectionMutation<Input, Result> {
  mutate: (input: Input) => void
  /** Resolves when the mutation *and* the list refresh have settled. */
  mutateAsync: (input: Input) => Promise<Result>
  isPending: Accessor<boolean>
  error: Accessor<Error | undefined>
}

export interface Collection<T extends { id: string }, New = NewRecord<T>> {
  query: ListQuery<T>
  create: CollectionMutation<New, T>
  update: CollectionMutation<{ id: string; patch: Partial<T> }, T>
  /** Patch many at once — the bulk action. */
  updateMany: CollectionMutation<{ ids: string[]; patch: Partial<T> }, T[]>
  remove: CollectionMutation<{ ids: string[] }, void>
}

export interface CollectionOptions<
  T extends { id: string },
  New = NewRecord<T>,
> {
  /** The cache identity. Same key = same collection. */
  key: QueryKey
  repository: Repository<T, New>
  /** The list's freshness. Defaults to the client's. */
  staleTime?: number
  /** Retries after the first failure. Defaults to the client's. */
  retry?: number | false
  /** Every mutation reports here first, so a page can word one notice. */
  onError?: (error: Error) => void
}

function asError(value: unknown): Error | undefined {
  if (value === null || value === undefined) return undefined
  return value instanceof Error ? value : new Error(String(value))
}

export function createListQuery<T extends { id: string }>(
  options: () => CollectionOptions<T, never>,
): ListQuery<T> {
  const query = createQuery(() => ({
    queryKey: options().key,
    queryFn: ({ signal }) => options().repository.list({ signal }),
    staleTime: options().staleTime,
    retry: options().retry,
    throwOnError: false,
  }))
  return {
    rows: () => query.data ?? [],
    isPending: () => query.isPending,
    isFetching: () => query.isFetching,
    isError: () => query.isError,
    error: () => asError(query.error),
    refetch: () => query.refetch(),
  }
}

export function createCollection<T extends { id: string }, New = NewRecord<T>>(
  options: () => CollectionOptions<T, New>,
): Collection<T, New> {
  const queryClient = useQueryClient()
  const key = () => options().key
  const fail = (error: unknown) => {
    const normalised = asError(error)
    if (normalised) options().onError?.(normalised)
    return normalised
  }
  const previous = () => queryClient.getQueryData<T[]>(key())
  const restore = (snapshot: T[] | undefined) => {
    if (snapshot) queryClient.setQueryData(key(), snapshot)
  }
  const patchRows = (ids: string[], patch: Partial<T>) => {
    const wanted = new Set(ids)
    queryClient.setQueryData<T[]>(key(), (rows = []) =>
      rows.map((row) => (wanted.has(row.id) ? { ...row, ...patch } : row)),
    )
  }

  const query = createListQuery(options)

  const create = createMutation(() => ({
    mutationFn: (input: New) => options().repository.create(input),
    // Not optimistic: a new record's id and defaults are the repository's to
    // decide, so guessing them would show a row that then changes identity.
    onError: (error) => void fail(error),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key() }),
  }))

  const update = createMutation(() => ({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<T> }) =>
      options().repository.update(id, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: key() })
      const snapshot = previous()
      patchRows([id], patch)
      return { snapshot }
    },
    onError: (error, _input, context) => {
      restore(context?.snapshot)
      void fail(error)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key() }),
  }))

  const updateMany = createMutation(() => ({
    mutationFn: async ({ ids, patch }: { ids: string[]; patch: Partial<T> }) =>
      Promise.all(ids.map((id) => options().repository.update(id, patch))),
    onMutate: async ({ ids, patch }) => {
      await queryClient.cancelQueries({ queryKey: key() })
      const snapshot = previous()
      patchRows(ids, patch)
      return { snapshot }
    },
    onError: (error, _input, context) => {
      restore(context?.snapshot)
      void fail(error)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key() }),
  }))

  const remove = createMutation(() => ({
    mutationFn: ({ ids }: { ids: string[] }) =>
      options().repository.remove(ids),
    onMutate: async ({ ids }) => {
      await queryClient.cancelQueries({ queryKey: key() })
      const snapshot = previous()
      const wanted = new Set(ids)
      queryClient.setQueryData<T[]>(key(), (rows = []) =>
        rows.filter((row) => !wanted.has(row.id)),
      )
      return { snapshot }
    },
    onError: (error, _input, context) => {
      restore(context?.snapshot)
      void fail(error)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key() }),
  }))

  const wrap = <Input, Result>(
    mutation: ReturnType<typeof createMutation<Result, Error, Input>>,
  ): CollectionMutation<Input, Result> => ({
    mutate: (input: Input) => mutation.mutate(input),
    mutateAsync: (input: Input) => mutation.mutateAsync(input),
    isPending: () => mutation.isPending,
    error: () => asError(mutation.error),
  })

  return {
    query,
    create: wrap(create),
    update: wrap(update),
    updateMany: wrap(updateMany),
    remove: wrap(remove),
  }
}
