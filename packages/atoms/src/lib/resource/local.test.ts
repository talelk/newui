import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createLocalStore } from './local'

// jsdom provides a working `localStorage` (vitest sets an http origin), so the
// default backend is exercised for real; the memory fallback is tested by
// passing `storage: null` and by hiding the global.

let prefix = 0
function nextPrefix(): string {
  prefix += 1
  return `test-${prefix}:`
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('createLocalStore', () => {
  it('round-trips JSON values through localStorage', () => {
    const store = createLocalStore({ prefix: nextPrefix() })

    store.set('doc', { name: 'T-1', tags: ['a', 'b'] })
    store.set('count', 3)
    store.set('flag', false)

    expect(store.persistent).toBe(true)
    expect(store.get('doc')).toEqual({ name: 'T-1', tags: ['a', 'b'] })
    expect(store.get('count')).toBe(3)
    expect(store.get('flag')).toBe(false)
  })

  it('returns null for a missing or unparseable entry', () => {
    const store = createLocalStore<unknown>({ prefix: 'broken:' })
    expect(store.get('nope')).toBe(null)

    // A value written outside the JSON contract must not throw on read.
    localStorage.setItem('broken:x', 'not json')
    expect(store.get('x')).toBe(null)
  })

  it('scopes keys, delete, has, keys and clear to its prefix', () => {
    const store = createLocalStore({ prefix: 'mine:' })
    const other = createLocalStore({ prefix: 'other:' })

    store.set('a', 1)
    store.set('b', 2)
    other.set('a', 9)

    expect(store.has('a')).toBe(true)
    expect(store.keys().sort()).toEqual(['a', 'b'])
    expect(other.keys()).toEqual(['a'])

    store.delete('a')
    expect(store.has('a')).toBe(false)
    expect(other.get('a')).toBe(9)

    store.clear()
    expect(store.keys()).toEqual([])
    expect(other.get('a')).toBe(9)
  })

  it('persists across store instances that share a prefix', () => {
    const first = createLocalStore<{ v: number }>({ prefix: 'shared:' })
    first.set('k', { v: 1 })

    const second = createLocalStore<{ v: number }>({ prefix: 'shared:' })
    expect(second.get('k')).toEqual({ v: 1 })
  })

  it('falls back to memory when storage is explicitly null', () => {
    const store = createLocalStore({ prefix: nextPrefix(), storage: null })

    expect(store.persistent).toBe(false)
    store.set('k', 'v')
    expect(store.get('k')).toBe('v')
    expect(store.has('k')).toBe(true)
    expect(store.keys()).toEqual(['k'])
    store.clear()
    expect(store.keys()).toEqual([])
  })

  it('falls back to memory when localStorage is unavailable (SSR)', () => {
    vi.stubGlobal('localStorage', undefined)
    const store = createLocalStore({ prefix: nextPrefix() })

    expect(store.persistent).toBe(false)
    store.set('k', { v: 1 })
    expect(store.get('k')).toEqual({ v: 1 })
  })

  it('drops writes when the backing storage throws', () => {
    const throwing = {
      length: 0,
      key: () => null,
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
      removeItem: () => {},
    } as unknown as Storage
    const store = createLocalStore({ prefix: nextPrefix(), storage: throwing })

    expect(() => store.set('k', 1)).not.toThrow()
    expect(store.get('k')).toBe(null)
  })
})
