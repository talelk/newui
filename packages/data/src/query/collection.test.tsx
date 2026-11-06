import { render, screen, waitFor } from '@solidjs/testing-library'
import type { QueryKey } from '@tanstack/solid-query'
import { createSignal, For, type JSX, untrack } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { DataProvider } from './client'
import {
  type Collection,
  createCollection,
  createListQuery,
} from './collection'
import type { Repository } from './repository'

interface Row {
  id: string
  title: string
}

interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (error: unknown) => void
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((ok, fail) => {
    resolve = ok
    reject = fail
  })
  return { promise, resolve, reject }
}

function makeRepository(initial: Row[]) {
  let rows = [...initial]
  const repository: Repository<Row, { title: string }> = {
    list: async () => [...rows],
    create: async (input) => {
      const row = { id: `R-${rows.length + 1}`, title: input.title }
      rows = [row, ...rows]
      return row
    },
    update: vi.fn(async (id, patch) => {
      rows = rows.map((row) => (row.id === id ? { ...row, ...patch } : row))
      return rows.find((row) => row.id === id) as Row
    }),
    remove: async (ids) => {
      const gone = new Set(ids)
      rows = rows.filter((row) => !gone.has(row.id))
    },
  }
  return { repository, rows: () => rows }
}

function Harness(props: {
  repository: Repository<Row, { title: string }>
  ready: (collection: Collection<Row, { title: string }>) => void
  interval?: number | false
}): JSX.Element {
  const collection = createCollection(() => ({
    key: ['rows'],
    repository: props.repository,
    retry: false,
    ...(props.interval !== undefined
      ? { refetchInterval: props.interval }
      : {}),
  }))
  untrack(() => props.ready(collection))
  return (
    <ul>
      <For each={collection.query.rows()}>{(row) => <li>{row.title}</li>}</For>
    </ul>
  )
}

function mount(
  repository: Repository<Row, { title: string }>,
  interval?: number | false,
) {
  let collection!: Collection<Row, { title: string }>
  render(() => (
    <DataProvider>
      <Harness
        repository={repository}
        interval={interval}
        ready={(value) => (collection = value)}
      />
    </DataProvider>
  ))
  return () => collection
}

describe('createCollection', () => {
  it('loads the list and reports its pending and error states', async () => {
    const failing = deferred<Row[]>()
    const { repository } = makeRepository([{ id: '1', title: 'One' }])
    const broken: Repository<Row, { title: string }> = {
      ...repository,
      list: () => failing.promise,
    }
    const collection = mount(broken)
    expect(collection().query.isPending()).toBe(true)

    failing.reject(new Error('The service is down'))
    await waitFor(() => expect(collection().query.isError()).toBe(true))
    expect(collection().query.error()?.message).toBe('The service is down')
  })

  it('patches optimistically and restores the list when the request fails', async () => {
    const gate = deferred<Row>()
    const { repository } = makeRepository([
      { id: '1', title: 'One' },
      { id: '2', title: 'Two' },
    ])
    const gated: Repository<Row, { title: string }> = {
      ...repository,
      update: (id, patch) => {
        gate.promise.then(
          () => repository.update(id, patch),
          () => {},
        )
        return gate.promise
      },
    }
    const collection = mount(gated)
    await waitFor(() => expect(screen.getByText('One')).toBeTruthy())

    collection().update.mutate({ id: '1', patch: { title: 'Changed' } })
    // On screen before the request settles — that is the point of optimistic.
    await waitFor(() => expect(screen.getByText('Changed')).toBeTruthy())

    gate.reject(new Error('nope'))
    await waitFor(() => expect(screen.getByText('One')).toBeTruthy())
    expect(screen.queryByText('Changed')).toBeNull()
  })

  it('creates through the repository and refreshes the list', async () => {
    const { repository, rows } = makeRepository([{ id: '1', title: 'One' }])
    const collection = mount(repository)
    await waitFor(() => expect(screen.getByText('One')).toBeTruthy())

    await collection().create.mutateAsync({ title: 'New' })
    expect(rows()[0]?.title).toBe('New')
    await waitFor(() => expect(screen.getByText('New')).toBeTruthy())
  })

  it('completes many at once and removes through the same seam', async () => {
    const { repository } = makeRepository([
      { id: '1', title: 'One' },
      { id: '2', title: 'Two' },
    ])
    const collection = mount(repository)
    await waitFor(() => expect(screen.getByText('One')).toBeTruthy())

    await collection().updateMany.mutateAsync({
      ids: ['1', '2'],
      patch: { title: 'Done' },
    })
    await waitFor(() => expect(screen.getAllByText('Done')).toHaveLength(2))

    await collection().remove.mutateAsync({ ids: ['1', '2'] })
    await waitFor(() => expect(screen.queryByText('Done')).toBeNull())
  })

  it('polls the list on the interval it is given', async () => {
    const { repository } = makeRepository([{ id: '1', title: 'One' }])
    const list = vi.fn(repository.list)
    const polled: Repository<Row, { title: string }> = { ...repository, list }
    mount(polled, 30)
    await waitFor(() => expect(list).toHaveBeenCalledTimes(1))

    // The explicit dial: focus-refetch stays off, the interval does the work.
    await waitFor(
      () => expect(list.mock.calls.length).toBeGreaterThanOrEqual(3),
      {
        timeout: 2000,
      },
    )
  })

  it('never polls when refetchInterval is false', async () => {
    const { repository } = makeRepository([{ id: '1', title: 'One' }])
    const list = vi.fn(repository.list)
    const quiet: Repository<Row, { title: string }> = { ...repository, list }
    mount(quiet, false)
    await waitFor(() => expect(list).toHaveBeenCalledTimes(1))

    await new Promise((resolve) => setTimeout(resolve, 120))
    expect(list).toHaveBeenCalledTimes(1)
  })
})

describe('createListQuery keepPreviousData', () => {
  /** One deferred response per key tag, so a key change gates on demand. */
  function keyedRepository(tag: () => string) {
    const pending = new Map<string, Deferred<Row[]>>()
    const repository: Repository<Row, never> = {
      list: () => {
        const gate = deferred<Row[]>()
        pending.set(tag(), gate)
        return gate.promise
      },
      create: async () => {
        throw new Error('not used')
      },
      update: async () => {
        throw new Error('not used')
      },
      remove: async () => {},
    }
    return { repository, pending }
  }

  function ListHarness(props: {
    queryKey: () => QueryKey
    repository: Repository<Row, never>
    keepPreviousData?: boolean
  }): JSX.Element {
    const list = createListQuery(() => ({
      key: props.queryKey(),
      repository: props.repository,
      retry: false,
      ...(props.keepPreviousData ? { keepPreviousData: true } : {}),
    }))
    return (
      <ul>
        <For each={list.rows()}>{(row) => <li>{row.title}</li>}</For>
      </ul>
    )
  }

  function mountList(keepPreviousData?: boolean) {
    const [key, setKey] = createSignal<QueryKey>(['list', 'a'])
    const { repository, pending } = keyedRepository(() =>
      String(untrack(key)[1]),
    )
    render(() => (
      <DataProvider>
        <ListHarness
          queryKey={key}
          repository={repository}
          keepPreviousData={keepPreviousData}
        />
      </DataProvider>
    ))
    return {
      setKey: (tag: string) => setKey(['list', tag]),
      pending,
    }
  }

  it('holds the old page while the new key is in flight', async () => {
    const { setKey, pending } = mountList(true)
    await waitFor(() => {
      pending.get('a')?.resolve([{ id: '1', title: 'One' }])
      expect(screen.getByText('One')).toBeTruthy()
    })

    setKey('b')
    // The request is in flight; the table must not blank.
    await waitFor(() => expect(screen.getByText('One')).toBeTruthy())
    pending.get('b')?.resolve([{ id: '2', title: 'Two' }])
    await waitFor(() => expect(screen.getByText('Two')).toBeTruthy())
    expect(screen.queryByText('One')).toBeNull()
  })

  it('without it the rows clear while the new key loads', async () => {
    const { setKey, pending } = mountList(false)
    await waitFor(() => {
      pending.get('a')?.resolve([{ id: '1', title: 'One' }])
      expect(screen.getByText('One')).toBeTruthy()
    })
    setKey('b')
    await waitFor(() => expect(screen.queryByText('One')).toBeNull())
    pending.get('b')?.resolve([{ id: '2', title: 'Two' }])
    await waitFor(() => expect(screen.getByText('Two')).toBeTruthy())
  })
})
