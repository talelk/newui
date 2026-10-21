import { describe, expect, it } from 'vitest'
import { createIdbStore } from './idb'

/**
 * jsdom ships no IndexedDB, so the native code path is driven by a minimal
 * in-memory `IDBFactory` implementing exactly the subset `createIdbStore`
 * uses: open + upgrade, one object store, and get/put/delete/getAllKeys/clear.
 * Requests settle on a microtask, as the real API does, which is why the store
 * must attach its handlers after the request is created.
 */

interface FakeRequest {
  result: unknown
  error: DOMException | Error | null
  onsuccess: ((event: Event) => void) | null
  onerror: ((event: Event) => void) | null
  onupgradeneeded: ((event: Event) => void) | null
}

function makeRequest(work: () => unknown): FakeRequest {
  const request: FakeRequest = {
    result: undefined,
    error: null,
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
  }
  queueMicrotask(() => {
    try {
      request.result = work()
      request.onsuccess?.(new Event('success'))
    } catch (error) {
      request.error = error as Error
      request.onerror?.(new Event('error'))
    }
  })
  return request
}

function makeFactory(): { factory: IDBFactory; opens: () => number } {
  const data = new Map<IDBValidKey, unknown>()
  const stores = new Set<string>()
  let opens = 0

  const objectStore = {
    get: (key: IDBValidKey) => makeRequest(() => data.get(key)),
    put: (value: unknown, key: IDBValidKey) =>
      makeRequest(() => {
        data.set(key, value)
        return key
      }),
    delete: (key: IDBValidKey) =>
      makeRequest(() => {
        data.delete(key)
        return undefined
      }),
    getAllKeys: () => makeRequest(() => [...data.keys()]),
    clear: () =>
      makeRequest(() => {
        data.clear()
        return undefined
      }),
  }

  const db = {
    objectStoreNames: { contains: (name: string) => stores.has(name) },
    createObjectStore: (name: string) => {
      stores.add(name)
      return {}
    },
    transaction: () => ({ objectStore: () => objectStore }),
    close: () => {},
  }

  const factory = {
    open: () => {
      opens += 1
      const request: FakeRequest = {
        result: db,
        error: null,
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
      }
      queueMicrotask(() => {
        request.onupgradeneeded?.(new Event('upgradeneeded'))
        request.onsuccess?.(new Event('success'))
      })
      return request as unknown as IDBOpenDBRequest
    },
  }

  return { factory: factory as unknown as IDBFactory, opens: () => opens }
}

describe('createIdbStore', () => {
  it('stores and reads structured-clone values through IndexedDB', async () => {
    const { factory } = makeFactory()
    const store = createIdbStore({ factory })

    expect(store.persistent).toBe(true)
    await store.set('doc', { name: 'T-1', tags: ['a', 'b'] })
    expect(await store.get('doc')).toEqual({ name: 'T-1', tags: ['a', 'b'] })
    expect(await store.get('missing')).toBe(null)
  })

  it('lists, deletes and clears keys', async () => {
    const { factory } = makeFactory()
    const store = createIdbStore({ factory })

    await store.set('a', 1)
    await store.set('b', 2)
    expect((await store.keys()).sort()).toEqual(['a', 'b'])

    await store.delete('a')
    expect(await store.keys()).toEqual(['b'])

    await store.clear()
    expect(await store.keys()).toEqual([])
  })

  it('opens the database once and reuses it', async () => {
    const { factory, opens } = makeFactory()
    const store = createIdbStore({ factory })

    await store.set('a', 1)
    await store.get('a')
    await store.set('b', 2)
    expect(opens()).toBe(1)
  })

  it('falls back to memory when IndexedDB is unavailable', async () => {
    const store = createIdbStore({ factory: null })

    expect(store.persistent).toBe(false)
    await store.set('k', { v: 1 })
    expect(await store.get('k')).toEqual({ v: 1 })
    expect(await store.keys()).toEqual(['k'])
    await store.delete('k')
    expect(await store.get('k')).toBe(null)
    await store.clear()
    expect(await store.keys()).toEqual([])
  })

  it('reports non-persistence when there is no global indexedDB', () => {
    // jsdom does not implement IndexedDB, so the default is the memory store.
    const store = createIdbStore()
    expect(store.persistent).toBe(false)
  })

  it('rejects when the database fails to open', async () => {
    const failing = {
      open: () => {
        const request: FakeRequest = {
          result: undefined,
          error: new Error('permission denied'),
          onsuccess: null,
          onerror: null,
          onupgradeneeded: null,
        }
        queueMicrotask(() => request.onerror?.(new Event('error')))
        return request
      },
    } as unknown as IDBFactory
    const store = createIdbStore({ factory: failing })

    await expect(store.get('x')).rejects.toThrow('permission denied')
  })
})
