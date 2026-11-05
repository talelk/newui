import { createRoot } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import {
  createUrlState,
  type UrlState,
  type UrlStateAdapter,
  type UrlStateOptions,
  type UrlStateValue,
} from './url-state'

function setup<T extends Record<string, UrlStateValue>>(
  initial: T,
  options?: UrlStateOptions,
) {
  let dispose!: () => void
  let state!: UrlState<T>
  createRoot((d) => {
    dispose = d
    state = createUrlState(initial, options)
  })
  return { state, dispose }
}

interface FakeAdapter extends UrlStateAdapter {
  /** The params handed to the last `replace`. */
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

/** Let queued microtasks (the per-tick `replace`) run. */
async function flushMicrotasks(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

describe('createUrlState', () => {
  it('behaves as a plain signal without an adapter, touching no URL', async () => {
    const before = window.location.search
    const { state, dispose } = setup({ view: 'list' })
    expect(state.view()).toBe('list')

    state.set('view', 'board')
    await flushMicrotasks()
    expect(state.view()).toBe('board')
    expect(window.location.search).toBe(before)
    expect(state.params().get('view')).toBe('board')
    dispose()
  })

  it('reads the URL once on mount, so first paint renders from the link', () => {
    const url = adapter('n=42&tags=["x","y"]&broken=abc')
    const { state, dispose } = setup(
      { n: 1, tags: [] as string[], broken: 7 },
      { adapter: url },
    )
    expect(state.n()).toBe(42)
    expect(state.tags()).toEqual(['x', 'y'])
    // An unparseable value is not a crash: the initial value wins.
    expect(state.broken()).toBe(7)
    dispose()
  })

  it('serializes primitives as-is and objects with stable key order', async () => {
    const url = adapter()
    const { state, dispose } = setup(
      { page: 1, flag: false as boolean, range: { to: 30, from: 10 } },
      { adapter: url },
    )
    state.set('page', 3)
    state.set('flag', true)
    state.set('range', { to: 99, from: 0 })
    await flushMicrotasks()

    expect(url.replace).toHaveBeenCalledTimes(1)
    const params = url.last()
    expect(params.get('page')).toBe('3')
    expect(params.get('flag')).toBe('true')
    expect(params.get('range')).toBe('{"from":0,"to":99}')

    const roundTrip = setup(
      { page: 1, flag: false as boolean, range: { to: 0, from: 0 } },
      { adapter: adapter(params.toString()) },
    )
    expect(roundTrip.state.page()).toBe(3)
    expect(roundTrip.state.flag()).toBe(true)
    expect(roundTrip.state.range()).toEqual({ from: 0, to: 99 })
    dispose()
    roundTrip.dispose()
  })

  it('treats undefined as absent — removed, never an empty string', async () => {
    const url = adapter('q=hello')
    const { state, dispose } = setup({ q: 'hello' }, { adapter: url })
    state.set('q', undefined)
    await flushMicrotasks()

    expect(url.last().has('q')).toBe(false)
    expect(url.last().get('q')).toBeNull()
    expect(state.q()).toBe('hello')
    dispose()
  })

  it('coalesces several writes in one tick into a single replace', async () => {
    const url = adapter()
    const { state, dispose } = setup({ a: 1, b: 2 }, { adapter: url })
    state.set('a', 10)
    state.set('b', 20)
    await flushMicrotasks()
    expect(url.replace).toHaveBeenCalledTimes(1)
    expect(url.last().get('a')).toBe('10')
    expect(url.last().get('b')).toBe('20')

    state.set('a', 11)
    await flushMicrotasks()
    expect(url.replace).toHaveBeenCalledTimes(2)
    dispose()
  })

  it('debounces search-like keys, resetting the window on every keystroke', async () => {
    vi.useFakeTimers()
    try {
      const url = adapter()
      const { state, dispose } = setup(
        { q: '', page: 1 },
        { adapter: url, debounce: ['q'] },
      )
      state.set('q', 'a')
      expect(url.replace).not.toHaveBeenCalled()
      vi.advanceTimersByTime(200)
      state.set('q', 'ab')
      expect(url.replace).not.toHaveBeenCalled()
      vi.advanceTimersByTime(200)
      expect(url.replace).not.toHaveBeenCalled()
      vi.advanceTimersByTime(100)
      expect(url.replace).toHaveBeenCalledTimes(1)
      expect(url.last().get('q')).toBe('ab')

      // A non-debounced key still writes immediately.
      state.set('page', 4)
      await vi.advanceTimersByTimeAsync(0)
      expect(url.last().get('page')).toBe('4')
      dispose()
    } finally {
      vi.useRealTimers()
    }
  })

  it('honours a custom debounce window', async () => {
    vi.useFakeTimers()
    try {
      const url = adapter()
      const { state, dispose } = setup(
        { q: '' },
        { adapter: url, debounce: ['q'], debounceMs: 50 },
      )
      state.set('q', 'x')
      vi.advanceTimersByTime(50)
      expect(url.last().get('q')).toBe('x')
      dispose()
    } finally {
      vi.useRealTimers()
    }
  })

  it('exposes params() as a snapshot that cannot corrupt the state', () => {
    const { state, dispose } = setup({ view: 'list' })
    const snapshot = state.params()
    snapshot.set('view', 'tampered')
    expect(state.params().get('view')).toBe('list')
    dispose()
  })
})
