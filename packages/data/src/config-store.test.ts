import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CONFIG_DOCUMENT_LIMIT,
  type ConfigStorage,
  createConfigStore,
} from './config-store'

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

describe('createConfigStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-01T10:00:00Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('wraps saves in a versioned envelope and loads them back', () => {
    const storage = memoryStorage()
    const store = createConfigStore({ key: 'acme.views', storage })

    expect(store.save('revenue', { columns: ['date', 'usd'] })).toBe(true)
    const loaded = store.load<{ columns: string[] }>('revenue')
    expect(loaded?.v).toBe(1)
    expect(loaded?.name).toBe('revenue')
    expect(loaded?.updatedAt).toBe('2026-03-01T10:00:00.000Z')
    expect(loaded?.doc).toEqual({ columns: ['date', 'usd'] })

    // The store namespaces its keys, so a sibling store cannot collide.
    expect([...storage.map.keys()]).toEqual(['acme.views:revenue'])
  })

  it('carries the type discriminator through save and list', () => {
    const store = createConfigStore({
      key: 'acme',
      storage: memoryStorage(),
    })
    store.save('week-only', { filters: [] }, { type: 'saved-view' })
    store.save('layout', { widgets: [] }, { type: 'dashboard-config' })

    const listed = store.list()
    expect(listed).toHaveLength(2)
    expect(listed.map((row) => row.type).sort()).toEqual([
      'dashboard-config',
      'saved-view',
    ])
  })

  it('lists documents newest first and skips unreadable entries', () => {
    const storage = memoryStorage()
    const store = createConfigStore({ key: 'acme', storage })
    store.save('old', { n: 1 })
    vi.setSystemTime(new Date('2026-03-02T10:00:00Z'))
    store.save('new', { n: 2 })
    storage.map.set('acme:garbage', '{not json')

    expect(store.list().map((row) => row.name)).toEqual(['new', 'old'])
    expect(store.load('garbage')).toBeUndefined()
  })

  it('removes and renames, reporting whether the document existed', () => {
    const storage = memoryStorage()
    const store = createConfigStore({ key: 'acme', storage })
    store.save('draft', { n: 1 })

    expect(store.remove('draft')).toBe(true)
    expect(store.remove('draft')).toBe(false)
    expect(store.load('draft')).toBeUndefined()

    store.save('draft', { n: 1 })
    vi.setSystemTime(new Date('2026-03-03T10:00:00Z'))
    expect(store.rename('draft', 'keeper')).toBe(true)
    expect(store.rename('draft', 'ghost')).toBe(false)

    const keeper = store.load<{ n: number }>('keeper')
    expect(keeper?.name).toBe('keeper')
    expect(keeper?.updatedAt).toBe('2026-03-03T10:00:00.000Z')
    expect(keeper?.doc).toEqual({ n: 1 })
    expect(storage.map.has('acme:draft')).toBe(false)
  })

  it('migrates older envelopes instead of reading them wrong', () => {
    const storage = memoryStorage()
    storage.map.set(
      'acme:old',
      JSON.stringify({ v: 0, name: 'old', updatedAt: 'x', doc: { a: 1 } }),
    )

    const migrated = createConfigStore({
      key: 'acme',
      storage,
      migrate: (doc) => ({ ...(doc as object), migrated: true }),
    })
    const loaded = migrated.load<{ a: number; migrated: boolean }>('old')
    expect(loaded?.v).toBe(1)
    expect(loaded?.doc).toEqual({ a: 1, migrated: true })

    // Without a migrate, a version mismatch is unreadable, not corrupted.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const strict = createConfigStore({ key: 'acme', storage })
    expect(strict.load('old')).toBeUndefined()
    expect(warn).toHaveBeenCalled()
  })

  it('caps documents at 64KB with a loud dev warning', () => {
    const storage = memoryStorage()
    const store = createConfigStore({ key: 'acme', storage })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const huge = 'x'.repeat(CONFIG_DOCUMENT_LIMIT + 1)
    expect(store.save('huge', { data: huge })).toBe(false)
    expect(storage.map.has('acme:huge')).toBe(false)
    expect(warn).toHaveBeenCalledTimes(1)

    // Just under the cap still saves.
    expect(store.save('big', { data: 'y' })).toBe(true)
    expect(store.load('big')).toBeDefined()
  })

  it('drops writes when the backend fails, warning once per failure site', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const failing: ConfigStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceeded')
      },
      removeItem: () => {},
      keys: () => [],
    }
    const store = createConfigStore({ key: 'acme', storage: failing })
    expect(store.save('one', { n: 1 })).toBe(false)
    expect(warn).toHaveBeenCalled()
  })

  it('falls back to memory under SSR, where localStorage is absent', () => {
    vi.stubGlobal('localStorage', undefined)
    try {
      const store = createConfigStore({ key: 'acme' })
      expect(store.save('page', { n: 1 })).toBe(true)
      expect(store.load<{ n: number }>('page')?.doc.n).toBe(1)
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
