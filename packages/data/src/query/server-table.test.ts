import { createRoot } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import type { UrlStateAdapter } from '../url-state'
import { createServerTableState, type ServerTableState } from './server-table'

function setup(...args: Parameters<typeof createServerTableState>): {
  state: ServerTableState
  dispose: () => void
} {
  let dispose!: () => void
  let state!: ServerTableState
  createRoot((d) => {
    dispose = d
    state = createServerTableState(...args)
  })
  return { state, dispose }
}

interface FakeAdapter extends UrlStateAdapter {
  last(): URLSearchParams
}

function adapter(search = ''): FakeAdapter {
  let last = new URLSearchParams(search)
  const replace = vi.fn((params: URLSearchParams) => {
    last = params
  })
  return {
    search: () => search,
    replace,
    last: () => last,
  }
}

describe('createServerTableState', () => {
  it('starts from the defaults or the initial slices', () => {
    const { state, dispose } = setup({
      initial: {
        sorting: [{ id: 'name', desc: false }],
        pagination: { pageSize: 25 },
      },
    })
    expect(state.sorting()).toEqual([{ id: 'name', desc: false }])
    expect(state.columnFilters()).toEqual([])
    expect(state.globalFilter()).toBe('')
    expect(state.pagination()).toEqual({ pageIndex: 0, pageSize: 25 })
    dispose()
  })

  it('a sort change returns the result to page 0', () => {
    const { state, dispose } = setup()
    state.setPageIndex(4)
    expect(state.pagination().pageIndex).toBe(4)
    state.setSorting([{ id: 'amount', desc: true }])
    expect(state.sorting()).toEqual([{ id: 'amount', desc: true }])
    expect(state.pagination().pageIndex).toBe(0)
    dispose()
  })

  it('a filter change returns the result to page 0', () => {
    const { state, dispose } = setup()
    state.setPageIndex(2)
    state.setColumnFilters([{ id: 'status', value: 'open' }])
    expect(state.columnFilters()).toEqual([{ id: 'status', value: 'open' }])
    expect(state.pagination().pageIndex).toBe(0)
    state.setGlobalFilter('beta')
    state.setPageIndex(7)
    state.setGlobalFilter('gamma')
    expect(state.pagination().pageIndex).toBe(0)
    dispose()
  })

  it('paging moves without touching the other slices', () => {
    const { state, dispose } = setup()
    state.setSorting([{ id: 'name', desc: true }])
    state.setPageIndex(3)
    expect(state.pagination()).toEqual({ pageIndex: 3, pageSize: 10 })
    expect(state.sorting()).toEqual([{ id: 'name', desc: true }])
    dispose()
  })

  it('resizing the page keeps the top row', () => {
    const { state, dispose } = setup()
    state.setPageIndex(2) // rows 20..29 at pageSize 10
    state.setPageSize(20)
    expect(state.pagination()).toEqual({ pageIndex: 1, pageSize: 20 })
    dispose()
  })

  it('the query key carries every slice over the base', () => {
    const { state, dispose } = setup()
    state.setSorting([{ id: 'name', desc: false }])
    state.setGlobalFilter('acme')
    state.setPageIndex(2)
    expect(state.key(['tasks'])).toEqual([
      'tasks',
      {
        sorting: [{ id: 'name', desc: false }],
        columnFilters: [],
        globalFilter: 'acme',
        pagination: { pageIndex: 2, pageSize: 10 },
      },
    ])
    dispose()
  })

  it('writes the slices to the URL under the namespace', async () => {
    const url = adapter()
    const { state, dispose } = setup({
      sync: { adapter: url, namespace: 'tasks' },
    })
    state.setSorting([{ id: 'name', desc: true }])
    // One coalesced `replace` per tick, so the write lands on the next microtask.
    await Promise.resolve()
    const written = url.last().get('tasks.sorting')
    expect(JSON.parse(written ?? '')).toEqual([{ id: 'name', desc: true }])
    expect(url.last().get('tasks.pagination')).toContain('"pageIndex":0')
    dispose()
  })

  it('the URL seeds the store on creation', () => {
    const url = adapter(
      `?tasks.sorting=${encodeURIComponent(
        JSON.stringify([{ id: 'amount', desc: true }]),
      )}&tasks.pagination=${encodeURIComponent(
        JSON.stringify({ pageIndex: 3, pageSize: 10 }),
      )}`,
    )
    const { state, dispose } = setup({
      sync: { adapter: url, namespace: 'tasks' },
    })
    expect(state.sorting()).toEqual([{ id: 'amount', desc: true }])
    expect(state.pagination()).toEqual({ pageIndex: 3, pageSize: 10 })
    dispose()
  })
})
