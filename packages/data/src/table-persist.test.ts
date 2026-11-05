import { createRoot } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import type { ConfigStorage } from './config-store'
import {
  createTablePersist,
  type TablePersist,
  type TablePersistOptions,
} from './table-persist'
import type { UrlStateAdapter } from './url-state'

/** A Map-backed storage that records what was written. */
function memoryStorage(): ConfigStorage & { map: Map<string, string> } {
  const map = new Map<string, string>()
  return {
    map,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
    keys: () => [...map.keys()],
  }
}

function adapter(
  search = '',
): UrlStateAdapter & { last: () => URLSearchParams } {
  let last = new URLSearchParams(search)
  return {
    search: () => search,
    replace: vi.fn((params: URLSearchParams) => {
      last = params
    }),
    last: () => last,
  }
}

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

function setup(
  options: Omit<TablePersistOptions, 'id'> & { id?: string } = {},
) {
  let dispose!: () => void
  let persist!: TablePersist
  createRoot((d) => {
    dispose = d
    persist = createTablePersist({ id: 'orders', ...options })
  })
  return { persist, dispose }
}

const layout = {
  visibility: { date: true, amount: false },
  order: ['date', 'amount'],
  sizing: { date: 140 },
  pinning: { left: ['date'], right: [] },
}

describe('createTablePersist', () => {
  it('round-trips the whole state through the document', () => {
    const storage = memoryStorage()
    const { persist: first, dispose } = setup({ storage })

    first.commit({
      columns: layout,
      sorting: [{ id: 'date', desc: true }],
      columnFilters: [{ id: 'region', value: 'EMEA' }],
      density: 'compact',
      pageSize: 25,
    })

    const { persist: second } = setup({ storage })
    expect(second.hydrate(['date', 'amount'])).toEqual({
      columns: layout,
      sorting: [{ id: 'date', desc: true }],
      columnFilters: [{ id: 'region', value: 'EMEA' }],
      density: 'compact',
      pageSize: 25,
      dropped: [],
    })

    // The document is a versioned envelope with the table-view type.
    const raw = JSON.parse(
      storage.map.get('newui.tables:orders') ?? '',
    ) as Record<string, unknown>
    expect(raw['v']).toBe(1)
    expect(raw['type']).toBe('table-view')
    dispose()
  })

  it('commits keep fields the table did not mention', () => {
    const storage = memoryStorage()
    const { persist, dispose } = setup({ storage })
    persist.commit({ density: 'compact', pageSize: 25 })
    persist.commit({ sorting: [{ id: 'amount', desc: false }] })

    const { persist: reloaded } = setup({ storage })
    const state = reloaded.hydrate([])
    expect(state.density).toBe('compact')
    expect(state.pageSize).toBe(25)
    expect(state.sorting).toEqual([{ id: 'amount', desc: false }])
    dispose()
  })

  it('drops persisted columns that no longer exist', () => {
    const storage = memoryStorage()
    const { persist, dispose } = setup({ storage })
    persist.commit({
      columns: {
        visibility: { date: true, ghost: false, amount: true },
        order: ['date', 'ghost', 'amount'],
        sizing: { ghost: 100 },
        pinning: { left: ['ghost'], right: [] },
      },
    })

    const { persist: reloaded } = setup({ storage })
    const state = reloaded.hydrate(['date', 'amount', 'new'])
    expect(state.dropped).toEqual(['ghost'])
    expect(state.columns).toEqual({
      visibility: { date: true, amount: true },
      order: ['date', 'amount', 'new'],
      sizing: {},
      pinning: { left: [], right: [] },
    })
    dispose()
  })

  it('migrates a document that predates the versioned shape', () => {
    const storage = memoryStorage()
    // What an older release wrote: visible ids in `columns`, `sort` not `sorting`.
    storage.setItem(
      'newui.tables:legacy',
      JSON.stringify({
        v: 1,
        name: 'legacy',
        updatedAt: '2026-01-01T00:00:00.000Z',
        doc: {
          columns: ['date', 'amount'],
          sort: [{ id: 'date', desc: true }],
        },
      }),
    )
    const { persist, dispose } = setup({ storage, id: 'legacy' })
    const state = persist.hydrate(['date', 'amount'])
    expect(state.sorting).toEqual([{ id: 'date', desc: true }])
    expect(state.columns).toEqual({
      visibility: { date: true, amount: true },
      order: ['date', 'amount'],
      sizing: {},
      pinning: { left: [], right: [] },
    })
    dispose()
  })

  it('writes the view half to the URL and reads it back', async () => {
    const bridge = adapter()
    const storage = memoryStorage()
    const { persist, dispose } = setup({
      storage,
      url: { adapter: bridge },
    })

    persist.commit({
      sorting: [{ id: 'amount', desc: true }],
      columnFilters: [{ id: 'region', value: 'EMEA' }],
      density: 'compact',
      pageSize: 50,
      columns: layout,
    })
    await flushMicrotasks()

    const params = bridge.last()
    expect(JSON.parse(params.get('orders.sort') ?? '')).toEqual([
      { id: 'amount', desc: true },
    ])
    expect(params.get('orders.pageSize')).toBe('50')
    expect(params.get('orders.density')).toBe('compact')
    // The column layout is a preference, not a link — never in the URL.
    expect([...params.keys()].some((key) => key.includes('columns'))).toBe(
      false,
    )

    const deep = adapter(new URLSearchParams(params).toString())
    const { persist: reloaded } = setup({ storage, url: { adapter: deep } })
    const state = reloaded.hydrate(['date', 'amount'])
    expect(state.sorting).toEqual([{ id: 'amount', desc: true }])
    expect(state.columnFilters).toEqual([{ id: 'region', value: 'EMEA' }])
    expect(state.density).toBe('compact')
    expect(state.pageSize).toBe(50)
    expect(state.columns).toEqual(layout)
    dispose()
  })

  it('lets the URL win over the document', () => {
    const storage = memoryStorage()
    const { persist, dispose } = setup({ storage })
    persist.commit({ sorting: [{ id: 'date', desc: true }], pageSize: 10 })

    const deep = adapter(
      '?orders.sort=%5B%7B%22id%22%3A%22amount%22%2C%22desc%22%3Afalse%7D%5D',
    )
    const { persist: reloaded } = setup({ storage, url: { adapter: deep } })
    expect(reloaded.hydrate([]).sorting).toEqual([
      { id: 'amount', desc: false },
    ])
    dispose()
  })

  it('reports a storage backend that rejects the write', () => {
    const rejecting: ConfigStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota')
      },
      removeItem: () => {},
      keys: () => [],
    }
    const onPersistError = vi.fn()
    const { persist, dispose } = setup({ storage: rejecting, onPersistError })
    persist.commit({ pageSize: 25 })
    expect(onPersistError).toHaveBeenCalledTimes(1)
    expect(onPersistError.mock.calls[0]?.[0]?.message).toContain('orders')
    dispose()
  })

  it('reports a stored document that no longer parses', () => {
    const storage = memoryStorage()
    storage.setItem('newui.tables:orders', '{not json')
    const onPersistError = vi.fn()
    const { persist, dispose } = setup({ storage, onPersistError })
    expect(persist.hydrate(['date'])).toEqual({ dropped: [] })
    expect(onPersistError).toHaveBeenCalledTimes(1)
    dispose()
  })

  it('forgets everything on reset', async () => {
    const bridge = adapter()
    const storage = memoryStorage()
    const { persist, dispose } = setup({ storage, url: { adapter: bridge } })
    persist.commit({
      columns: layout,
      sorting: [{ id: 'date', desc: true }],
      pageSize: 25,
    })
    await flushMicrotasks()

    persist.reset()
    await flushMicrotasks()

    expect(storage.map.has('newui.tables:orders')).toBe(false)
    expect([...bridge.last()].length).toBe(0)
    const { persist: reloaded } = setup({ storage })
    expect(reloaded.hydrate(['date', 'amount'])).toEqual({ dropped: [] })
    dispose()
  })
})
