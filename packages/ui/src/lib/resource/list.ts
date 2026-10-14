import { type Accessor, createSignal } from 'solid-js'
import {
  isAbortError,
  normalizeError,
  type RequestError,
  request,
} from './client'
import type { ResourceFetcher } from './resource'

/** A Frappe filter map (`{ status: 'Open', name: ['like', '%x%'] }`). */
export type ListFilters = Record<string, unknown>

/** Options for {@link createListResource}. */
export interface ListResourceOptions<TRow = Record<string, unknown>> {
  doctype: string
  /** Fields to select. */
  fields?: string[]
  /** Filters, or an accessor for reactive filters. */
  filters?: ListFilters | (() => ListFilters)
  /** OR-filters (`or_filters`). */
  orFilters?: ListFilters | (() => ListFilters)
  /** `order_by` clause, e.g. `modified desc`. */
  orderBy?: string
  /** Initial page offset. Defaults to `0`. */
  start?: number
  /** Rows per page. Defaults to `20`. */
  pageLength?: number
  groupBy?: string
  parent?: string
  debug?: boolean | number
  /** Overrides the default list endpoint. */
  url?: string
  /** Fetch on creation. Defaults to `false`. */
  auto?: boolean
  /** Map the raw rows. */
  transform?: (rows: TRow[]) => TRow[]
  onSuccess?: (rows: TRow[]) => void
  onError?: (error: RequestError) => void
  fetcher?: ResourceFetcher
}

/** A paginated, filterable list resource. */
export interface ListResource<TRow = Record<string, unknown>> {
  data: Accessor<TRow[] | null>
  loading: Accessor<boolean>
  error: Accessor<RequestError | null>
  fetched: Accessor<boolean>
  filters: Accessor<ListFilters | null>
  /** Current page offset (the `start` of the window). */
  start: Accessor<number>
  pageLength: Accessor<number>
  hasNextPage: Accessor<boolean>
  hasPreviousPage: Accessor<boolean>
  /** Refetch the window from the start. */
  reload: () => Promise<TRow[] | null>
  /** Alias of {@link ListResource.reload}. */
  fetch: () => Promise<TRow[] | null>
  /** Advance one page and refetch. */
  next: () => Promise<TRow[] | null>
  /** Go back one page and refetch. */
  previous: () => Promise<TRow[] | null>
  /** Replace the filters, reset to the first page, and refetch. */
  setFilters: (filters: ListFilters) => Promise<TRow[] | null>
  /** Replace `data` without a request. */
  setData: (rows: TRow[]) => void
  reset: () => void
}

const DEFAULT_LIST_URL = 'frappe.client.get_list'

function resolveFilters(
  value: ListFilters | (() => ListFilters) | undefined,
): ListFilters | undefined {
  return typeof value === 'function' ? value() : value
}

/**
 * The signal-based replacement for frappe-ui's `createListResource`.
 *
 * Pagination is a sliding window: `reload` always fetches from `start = 0` with
 * a limit of `start + pageLength`, so `data` holds every row up to the current
 * page. `next`/`previous` move the window and refetch; `hasNextPage` is true
 * when the server returned a full window.
 */
export function createListResource<TRow = Record<string, unknown>>(
  options: ListResourceOptions<TRow>,
): ListResource<TRow> {
  const fetcher: ResourceFetcher = options.fetcher ?? request

  const [data, setDataSignal] = createSignal<TRow[] | null>(null)
  const [loading, setLoading] = createSignal(false)
  const [error, setError] = createSignal<RequestError | null>(null)
  const [fetched, setFetched] = createSignal(false)
  const [start, setStart] = createSignal(options.start ?? 0)
  const [pageLength] = createSignal(options.pageLength ?? 20)
  const [hasNextPage, setHasNextPage] = createSignal(true)
  const hasPreviousPage = (): boolean => start() > 0

  // `setFilters` wins over the option; both may be an accessor.
  const [filtersOverride, setFiltersOverride] =
    createSignal<ListFilters | null>(null)
  const filters = (): ListFilters | null => {
    const override = filtersOverride()
    if (override) return override
    const value = options.filters
    if (typeof value === 'function') return value()
    return value ?? null
  }

  let controller: AbortController | null = null
  let sequence = 0

  function makeParams(limit: number): Record<string, unknown> {
    return {
      doctype: options.doctype,
      fields: options.fields,
      filters: filters(),
      or_filters: resolveFilters(options.orFilters),
      order_by: options.orderBy,
      start: 0,
      limit,
      limit_start: 0,
      limit_page_length: limit,
      group_by: options.groupBy,
      parent: options.parent,
      debug: options.debug,
    }
  }

  function transform(rows: TRow[]): TRow[] {
    if (options.transform) {
      const result = options.transform(rows)
      if (Array.isArray(result)) return result
    }
    return rows
  }

  function reload(): Promise<TRow[] | null> {
    const current = ++sequence
    controller?.abort()
    controller = new AbortController()
    setLoading(true)
    setError(null)

    const limit = start() + pageLength()
    const result = fetcher<TRow[]>({
      url: options.url ?? DEFAULT_LIST_URL,
      method: 'POST',
      params: makeParams(limit),
      signal: controller.signal,
    })
      .then((rows) => {
        if (current !== sequence) return data()
        const list = Array.isArray(rows) ? rows : []
        setHasNextPage(list.length >= limit)
        const transformed = transform(list)
        setDataSignal(() => transformed)
        setFetched(true)
        options.onSuccess?.(transformed)
        return transformed
      })
      .catch((caught: unknown) => {
        if (current !== sequence || isAbortError(caught)) return data()
        const normalized = normalizeError(caught)
        setError(normalized)
        options.onError?.(normalized)
        return data()
      })
      .finally(() => {
        if (current === sequence) setLoading(false)
      })

    return result
  }

  function next(): Promise<TRow[] | null> {
    setStart(start() + pageLength())
    return reload()
  }

  function previous(): Promise<TRow[] | null> {
    setStart(Math.max(0, start() - pageLength()))
    return reload()
  }

  function setFilters(next: ListFilters): Promise<TRow[] | null> {
    setFiltersOverride(() => next)
    setStart(0)
    return reload()
  }

  function setData(rows: TRow[]): void {
    setDataSignal(() => transform(rows))
  }

  function reset(): void {
    controller?.abort()
    sequence++
    setDataSignal(() => null)
    setLoading(false)
    setError(null)
    setFetched(false)
    setStart(options.start ?? 0)
    setHasNextPage(true)
  }

  // Auto-fetch on creation. `reload` is a plain action, not a signal — the
  // reactivity rule cannot tell the difference, so it is silenced here.
  // eslint-disable-next-line solid/reactivity
  if (options.auto) void reload()

  return {
    data,
    loading,
    error,
    fetched,
    filters,
    start,
    pageLength,
    hasNextPage,
    hasPreviousPage,
    reload,
    fetch: reload,
    next,
    previous,
    setFilters,
    setData,
    reset,
  }
}
