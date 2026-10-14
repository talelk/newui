/**
 * An IndexedDB-backed, Promise-based key/value store for caching resource data.
 *
 * The asynchronous sibling of {@link createLocalStore}, written against the
 * native `indexedDB` API — no `idb`/`idb-keyval` dependency. Values are stored
 * with the structured-clone algorithm, so objects, arrays, `Date`s, `Blob`s and
 * the like round-trip without an explicit `JSON.stringify`.
 *
 * SSR-safe: with no `indexedDB` (the server, or a browser with it disabled) the
 * store falls back to an in-memory `Map` and every method still resolves, so a
 * caller never has to branch on `typeof window`. The `indexedDB` implementation
 * is injectable through {@link IdbStoreOptions.factory}, which is also how the
 * unit tests drive the native code path (jsdom ships no IndexedDB).
 */

/** A Promise-based, structured-clone key/value cache. */
export interface IdbStore<T = unknown> {
  /** The stored value, or `null` when the key is absent. */
  get(key: string): Promise<T | null>
  /** Persist a value. */
  set(key: string, value: T): Promise<void>
  /** Remove a key. */
  delete(key: string): Promise<void>
  /** Every key currently in the store. */
  keys(): Promise<string[]>
  /** Remove every key. */
  clear(): Promise<void>
  /** False when the store fell back to memory (SSR, or no IndexedDB). */
  readonly persistent: boolean
  /** Close the underlying database, if one was opened. */
  close(): void
}

/** Options for {@link createIdbStore}. */
export interface IdbStoreOptions {
  /** Database name. Defaults to `newui`. */
  name?: string
  /** Object store name. Defaults to `keyval`. */
  store?: string
  /** Database version. Defaults to `1`. */
  version?: number
  /** IndexedDB implementation. Defaults to the global `indexedDB`. */
  factory?: IDBFactory | null
}

function defaultFactory(): IDBFactory | null {
  try {
    return typeof indexedDB === 'undefined' ? null : indexedDB
  } catch {
    return null
  }
}

/** Resolve an {@link IDBRequest} on success and reject on error. */
function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () =>
      reject(request.error ?? new Error('IndexedDB request failed'))
  })
}

/**
 * Create a Promise-based cache over IndexedDB.
 *
 * The database is opened lazily on the first operation and reused. When no
 * IndexedDB implementation is available the store keeps values in memory, so
 * `get`/`set`/`keys` behave identically (minus persistence) and `persistent`
 * reports the difference.
 */
export function createIdbStore<T = unknown>(
  options: IdbStoreOptions = {},
): IdbStore<T> {
  const dbName = options.name ?? 'newui'
  const storeName = options.store ?? 'keyval'
  const version = options.version ?? 1
  const factory =
    options.factory === undefined ? defaultFactory() : options.factory
  const memory = new Map<string, T>()

  let opening: Promise<IDBDatabase> | null = null

  function open(): Promise<IDBDatabase> {
    if (!factory) {
      return Promise.reject(new Error('IndexedDB is not available'))
    }
    if (opening) return opening
    opening = new Promise<IDBDatabase>((resolve, reject) => {
      const request = factory.open(dbName, version)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName)
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () =>
        reject(
          request.error ?? new Error(`Failed to open IndexedDB "${dbName}"`),
        )
    })
    return opening
  }

  async function store(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await open()
    return db.transaction(storeName, mode).objectStore(storeName)
  }

  async function get(key: string): Promise<T | null> {
    if (!factory) return memory.get(key) ?? null
    const objectStore = await store('readonly')
    const value = (await promisify(objectStore.get(key))) as T | undefined
    return value ?? null
  }

  async function set(key: string, value: T): Promise<void> {
    if (!factory) {
      memory.set(key, value)
      return
    }
    const objectStore = await store('readwrite')
    await promisify(objectStore.put(value, key))
  }

  async function remove(key: string): Promise<void> {
    if (!factory) {
      memory.delete(key)
      return
    }
    const objectStore = await store('readwrite')
    await promisify(objectStore.delete(key))
  }

  async function keys(): Promise<string[]> {
    if (!factory) return [...memory.keys()]
    const objectStore = await store('readonly')
    const all = await promisify(objectStore.getAllKeys())
    return all.map(String)
  }

  async function clear(): Promise<void> {
    if (!factory) {
      memory.clear()
      return
    }
    const objectStore = await store('readwrite')
    await promisify(objectStore.clear())
  }

  function close(): void {
    const current = opening
    if (!current) return
    opening = null
    void current.then((db) => db.close()).catch(() => {})
  }

  return {
    get,
    set,
    delete: remove,
    keys,
    clear,
    persistent: factory !== null,
    close,
  }
}
