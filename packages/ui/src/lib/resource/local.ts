/**
 * A `localStorage`-backed key/value store for caching resource data.
 *
 * The synchronous sibling of {@link createIdbStore}: values are JSON-encoded, so
 * anything `JSON.parse(JSON.stringify(value))` round-trips is safe to cache.
 * Every call is guarded for SSR — with no `localStorage` the store silently
 * falls back to an in-memory `Map`, so importing and using it on the server
 * never throws. It is a plain API (no Solid reactivity): a cache is not a view.
 */

/** The storage backend a {@link LocalStore} reads and writes. */
type LocalStoreBackend = Storage | null

/** A synchronous, JSON, key/value cache. */
export interface LocalStore<T = unknown> {
  /** The stored value, or `null` when the key is absent or not JSON. */
  get(key: string): T | null
  /** JSON-encode and persist a value. */
  set(key: string, value: T): void
  /** Remove a key. */
  delete(key: string): void
  /** Whether the key exists. */
  has(key: string): boolean
  /** Every key owned by this store, with the prefix stripped. */
  keys(): string[]
  /** Remove every key owned by this store. */
  clear(): void
  /** False when the store fell back to memory (SSR, or storage disabled). */
  readonly persistent: boolean
}

/** Options for {@link createLocalStore}. */
export interface LocalStoreOptions {
  /** Key prefix, so several stores can share one `localStorage`. */
  prefix?: string
  /** Storage backend. Defaults to the global `localStorage`. */
  storage?: LocalStoreBackend
}

function defaultStorage(): LocalStoreBackend {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    // A sandboxed or disabled `localStorage` throws on access, not on use.
    return null
  }
}

/**
 * Create a synchronous cache over `localStorage`.
 *
 * Keys are namespaced by `prefix` (default `newui:`), so a store owns only the
 * entries it wrote: `keys()` and `clear()` never touch another store's data.
 * A storage that throws (quota exceeded, disabled) degrades to a no-op write
 * rather than failing the caller.
 */
export function createLocalStore<T = unknown>(
  options: LocalStoreOptions = {},
): LocalStore<T> {
  const prefix = options.prefix ?? 'newui:'
  const storage =
    options.storage === undefined ? defaultStorage() : options.storage
  const memory = new Map<string, string>()

  const scoped = (key: string): string => `${prefix}${key}`

  function get(key: string): T | null {
    let raw: string | null
    if (storage) {
      try {
        raw = storage.getItem(scoped(key))
      } catch {
        raw = null
      }
    } else {
      raw = memory.get(key) ?? null
    }
    if (raw === null) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  function set(key: string, value: T): void {
    const raw = JSON.stringify(value)
    if (storage) {
      try {
        storage.setItem(scoped(key), raw)
      } catch {
        // Quota or disabled storage: the write is dropped, not fatal.
      }
    } else {
      memory.set(key, raw)
    }
  }

  function remove(key: string): void {
    if (storage) {
      try {
        storage.removeItem(scoped(key))
      } catch {
        // Nothing to do — the entry is already unreachable.
      }
    } else {
      memory.delete(key)
    }
  }

  function has(key: string): boolean {
    if (storage) {
      try {
        return storage.getItem(scoped(key)) !== null
      } catch {
        return false
      }
    }
    return memory.has(key)
  }

  function keys(): string[] {
    if (!storage) return [...memory.keys()]
    const owned: string[] = []
    try {
      for (let index = 0; index < storage.length; index++) {
        const key = storage.key(index)
        if (key?.startsWith(prefix)) {
          owned.push(key.slice(prefix.length))
        }
      }
    } catch {
      return []
    }
    return owned
  }

  function clear(): void {
    if (!storage) {
      memory.clear()
      return
    }
    for (const key of keys()) remove(key)
  }

  return {
    get,
    set,
    delete: remove,
    has,
    keys,
    clear,
    persistent: storage !== null,
  }
}
