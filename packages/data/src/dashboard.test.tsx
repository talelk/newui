import { render, screen } from '@solidjs/testing-library'
import { createRoot, type JSX } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import {
  createDashboardState,
  DashboardProvider,
  type DashboardState,
  type DashboardStateOptions,
  useDashboardState,
} from './dashboard'
import type { UrlStateAdapter } from './url-state'

/** A fixed clock: Sunday 15 March 2026, 14:30 local — Q1, a leap year. */
const NOW = new Date(2026, 2, 15, 14, 30)

function setup(options: DashboardStateOptions = {}) {
  let dispose!: () => void
  let state!: DashboardState
  createRoot((d) => {
    dispose = d
    state = createDashboardState({ now: () => NOW, ...options })
  })
  return { state, dispose }
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

/** Let queued microtasks (the per-tick `replace`) run. */
async function flushMicrotasks(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

const endOfToday = new Date(2026, 2, 15, 23, 59, 59, 999)

describe('createDashboardState — time range', () => {
  it('defaults to the current 7 days, ending at today', () => {
    const { state, dispose } = setup()
    const range = state.timeRange()
    expect(range.preset).toBe('7d')
    expect(range.from).toEqual(new Date(2026, 2, 9))
    expect(range.to).toEqual(endOfToday)
    dispose()
  })

  it('computes 30d, qtd and ytd from the same clock', () => {
    const { state, dispose } = setup()

    state.setTimeRange('30d')
    expect(state.timeRange()).toEqual({
      preset: '30d',
      from: new Date(2026, 1, 14),
      to: endOfToday,
    })

    state.setTimeRange('qtd')
    expect(state.timeRange()).toEqual({
      preset: 'qtd',
      from: new Date(2026, 0, 1),
      to: endOfToday,
    })

    state.setTimeRange('ytd')
    expect(state.timeRange()).toEqual({
      preset: 'ytd',
      from: new Date(2026, 0, 1),
      to: endOfToday,
    })
    dispose()
  })

  it('floors qtd to the quarter, not the year', () => {
    let dispose!: () => void
    let state!: DashboardState
    createRoot((d) => {
      dispose = d
      state = createDashboardState({
        now: () => new Date(2026, 6, 11, 9, 0),
      })
    })
    state.setTimeRange('qtd')
    expect(state.timeRange().from).toEqual(new Date(2026, 6, 1))
    dispose()
  })

  it('marks set dates as custom, and a preset as not', () => {
    const { state, dispose } = setup()
    state.setTimeRange({
      from: new Date(2026, 4, 1),
      to: new Date(2026, 4, 8),
    })
    expect(state.timeRange()).toEqual({
      preset: 'custom',
      from: new Date(2026, 4, 1),
      to: new Date(2026, 4, 8),
    })

    state.setTimeRange('30d')
    expect(state.timeRange().preset).toBe('30d')
    dispose()
  })

  it('keeps the other bound when a custom range sets only one', () => {
    const { state, dispose } = setup()
    const to = state.timeRange().to
    state.setTimeRange({ from: new Date(2026, 1, 1) })
    expect(state.timeRange()).toEqual({
      preset: 'custom',
      from: new Date(2026, 1, 1),
      to,
    })
    dispose()
  })

  it('ignores an unknown preset', () => {
    const { state, dispose } = setup()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    state.setTimeRange('fortnight' as '7d')
    expect(state.timeRange().preset).toBe('7d')
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
    dispose()
  })
})

describe('createDashboardState — cross filter', () => {
  it('holds one slot: a new value replaces, the same value clears', () => {
    const { state, dispose } = setup()
    expect(state.cross()).toBeNull()

    state.setCross({ column: 'region', value: 'EMEA' })
    expect(state.cross()).toEqual({ column: 'region', value: 'EMEA' })

    state.setCross({ column: 'region', value: 'APAC' })
    expect(state.cross()).toEqual({ column: 'region', value: 'APAC' })

    // The same click twice is a toggle, not a second filter.
    state.setCross({ column: 'region', value: 'APAC' })
    expect(state.cross()).toBeNull()

    state.setCross({ column: 'stage', value: 2 })
    state.setCross(null)
    expect(state.cross()).toBeNull()
    dispose()
  })
})

describe('createDashboardState — filters', () => {
  it('reads declared filters, keeps defaults, and takes ad hoc keys', () => {
    const { state, dispose } = setup({
      filters: { region: 'EMEA', period: undefined },
    })
    expect(state.filters()).toEqual({ region: 'EMEA', period: undefined })

    state.setFilter('period', 30)
    expect(state.filters()['period']).toBe(30)

    // An undeclared key still works and still serializes.
    state.setFilter('source', 'web')
    expect(state.filters()['source']).toBe('web')
    expect(state.params().get('f:source')).toBe('web')

    // `undefined` returns a declared key to its default, not to nothing.
    state.setFilter('region', undefined)
    expect(state.filters()['region']).toBe('EMEA')
    dispose()
  })

  it('applies setFilters as a merge', () => {
    const { state, dispose } = setup({ filters: { region: 'EMEA' } })
    state.setFilters({ region: 'APAC', stage: 'won' })
    expect(state.filters()).toEqual({ region: 'APAC', stage: 'won' })
    dispose()
  })
})

describe('createDashboardState — URL sync', () => {
  it('deep-links: the URL seeds the state on creation', () => {
    const { state, dispose } = setup({
      adapter: adapter(
        '?range=30d&f:region=EMEA&cross=%7B%22column%22%3A%22region%22%2C%22value%22%3A%22EMEA%22%7D',
      ),
      filters: { region: '' },
    })
    expect(state.timeRange().preset).toBe('30d')
    expect(state.filters()['region']).toBe('EMEA')
    expect(state.cross()).toEqual({ column: 'region', value: 'EMEA' })
    dispose()
  })

  it('writes state back and prunes what is only the default', async () => {
    const bridge = adapter()
    const { state, dispose } = setup({
      adapter: bridge,
      filters: { region: '' },
    })

    state.setTimeRange('30d')
    state.setFilter('region', 'EMEA')
    state.setCross({ column: 'stage', value: 'won' })
    await flushMicrotasks()

    const params = bridge.last()
    expect(params.get('range')).toBe('30d')
    expect(params.get('f:region')).toBe('EMEA')
    expect(JSON.parse(params.get('cross') ?? '')).toEqual({
      column: 'stage',
      value: 'won',
    })

    // Back to the default preset: the param goes away rather than say nothing.
    state.setTimeRange('7d')
    await flushMicrotasks()
    expect(bridge.last().get('range')).toBeNull()
    dispose()
  })

  it('clears the custom dates when a preset returns', async () => {
    const bridge = adapter()
    const { state, dispose } = setup({ adapter: bridge })

    state.setTimeRange({ from: new Date(2026, 3, 1), to: new Date(2026, 3, 5) })
    await flushMicrotasks()
    expect(bridge.last().get('from')).toBe(new Date(2026, 3, 1).toISOString())

    state.setTimeRange('qtd')
    await flushMicrotasks()
    expect(bridge.last().get('from')).toBeNull()
    expect(bridge.last().get('to')).toBeNull()
    dispose()
  })

  it('touches no URL when sync is off, but still serializes params', async () => {
    const bridge = adapter()
    const { state, dispose } = setup({ adapter: bridge, sync: false })
    state.setTimeRange('30d')
    await flushMicrotasks()
    expect(bridge.replace).not.toHaveBeenCalled()
    expect(state.params().get('range')).toBe('30d')
    dispose()
  })

  it('treats a custom range whose dates no longer parse as a reset', () => {
    const { state, dispose } = setup({
      adapter: adapter('?range=custom&from=not-a-date&to=also-no'),
    })
    expect(state.timeRange().preset).toBe('custom')
    expect(state.timeRange().from).toEqual(new Date(2026, 2, 9))
    dispose()
  })
})

describe('useDashboardState', () => {
  function Widget(): JSX.Element {
    const dashboard = useDashboardState()
    return <p>{dashboard.timeRange().preset}</p>
  }

  it('reads the state published by the provider', () => {
    const { state, dispose } = setup()
    state.setTimeRange('ytd')
    render(() => (
      <DashboardProvider state={state}>
        <Widget />
      </DashboardProvider>
    ))
    expect(screen.getByText('ytd')).toBeTruthy()
    dispose()
  })

  it('names the provider when used outside one', () => {
    expect(() => render(() => <Widget />)).toThrow(/DashboardProvider/)
  })
})
