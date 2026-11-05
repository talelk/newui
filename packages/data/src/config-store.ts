/**
 * Versioned documents for user-authored views.
 *
 * `createConfigStore` is one storage abstraction with two consumers: saved
 * filters (the "saved view" side) and dashboard config (the widget-layout
 * side). Both are documents in the same store, distinguished by a `type`
 * discriminator in the envelope — never by separate stores.
 *
 * Documents are versioned envelopes so a future shape migrates per-store, not
 * globally, and the envelope carries `updatedAt` so conflict resolution stays
 * a later decision rather than a later accident. Storage is a seam: the
 * default is `localStorage`, and a server-backed adapter (Frappe `/resource`
 * or any REST) drops in without touching consumers.
 */

/** The current envelope shape. A breaking change bumps this and migrates. */
export const CONFIG_SCHEMA_VERSION = 1

/** The byte cap on one stored document — a widget grid that grows forever. */
export const CONFIG_DOCUMENT_LIMIT = 64 * 1024

/** One stored document, with its version and metadata around the payload. */
export interface ConfigDocument<T = unknown> {
  /** Envelope schema version; see {@link CONFIG_SCHEMA_VERSION}. */
  v: number
  name: string
  /** What kind of document this is (`'saved-view'`, `'dashboard-config'`, …). */
  type?: string
  /** ISO timestamp of the last {@link ConfigStore.save}. */
  updatedAt: string
  /** The document's payload, owned by the consumer. */
  doc: T
}

/** The row {@link ConfigStore.list} returns per stored document. */
export interface ConfigSummary {
  name: string
  type?: string
  updatedAt: string
}

/**
 * The storage seam. Keys are globally unique; the store namespaces them with
 * its `key` prefix, so `keys()` must enumerate every key the store may read.
 */
export interface ConfigStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  /** Every key the storage holds, for the store's namespace scan. */
  keys(): string[]
}

/** Options for {@link createConfigStore}. */
export interface ConfigStoreOptions {
  /** Namespace prefix, so several stores share one storage. */
  key: string
  /** Backend. Defaults to `localStorage` (in-memory under SSR). */
  storage?: ConfigStorage
  /**
   * Upgrade a document written against an older envelope version. Return the
   * document in the current shape; return `undefined` to reject it. Without a
   * `migrate`, a version mismatch is unreadable rather than silently wrong.
   */
  migrate?: (doc: unknown, from: number) => unknown
}

/** The document API {@link createConfigStore} returns. */
export interface ConfigStore {
  /** Every stored document, newest first. Unreadable entries are skipped. */
  list(): ConfigSummary[]
  /** Load one document through `migrate`; `undefined` when absent or stale. */
  load<T>(name: string): ConfigDocument<T> | undefined
  /** Store a document in a fresh envelope. False when over the 64KB cap. */
  save<T>(name: string, doc: T, options?: { type?: string }): boolean
  /** Delete one document. Returns whether it existed. */
  remove(name: string): boolean
  /** Move a document to a new name. False when the source is absent. */
  rename(from: string, to: string): boolean
}

function defaultStorage(): ConfigStorage {
  const memory = new Map<string, string>()
  let backend: Storage | null = null
  try {
    backend = typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    // A sandboxed or disabled `localStorage` throws on access, not on use.
    backend = null
  }
  if (!backend) {
    return {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => void memory.set(key, value),
      removeItem: (key) => void memory.delete(key),
      keys: () => [...memory.keys()],
    }
  }
  return {
    getItem(key) {
      try {
        return backend.getItem(key)
      } catch {
        return null
      }
    },
    setItem(key, value) {
      // Failures surface to the caller's `save`, which warns and no-ops.
      backend.setItem(key, value)
    },
    removeItem(key) {
      try {
        backend.removeItem(key)
      } catch {
        // The entry is already unreachable.
      }
    },
    keys() {
      const all: string[] = []
      try {
        for (let index = 0; index < backend.length; index++) {
          const key = backend.key(index)
          if (key !== null) all.push(key)
        }
      } catch {
        return all
      }
      return all
    },
  }
}

/**
 * True outside a production build. Bundlers replace `process.env.NODE_ENV`,
 * and this package is type-checked against Node's types, not `vite/client`,
 * so the read goes through `globalThis` with a guard for non-Node hosts.
 */
function isProduction(): boolean {
  return (
    (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
      ?.NODE_ENV === 'production'
  )
}

function warnStorageFailure(): void {
  if (!isProduction()) {
    console.warn(
      '[newui-data] createConfigStore: the storage backend rejected a write (quota or disabled storage). The document is dropped, not fatal.',
    )
  }
}

function warnOverLimit(name: string, bytes: number): void {
  if (!isProduction()) {
    console.warn(
      `[newui-data] createConfigStore: document "${name}" is ${bytes} bytes, over the ${CONFIG_DOCUMENT_LIMIT}-byte cap. It was not saved — check what grew (a widget grid that appends forever is the usual suspect).`,
    )
  }
}

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length
}

function isEnvelope(value: unknown): value is ConfigDocument {
  if (value === null || typeof value !== 'object') return false
  const candidate = value as Partial<ConfigDocument>
  return (
    typeof candidate.v === 'number' &&
    typeof candidate.name === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    'doc' in candidate
  )
}

/**
 * Create a store of named, versioned documents.
 *
 * `save` wraps the payload in a {@link ConfigDocument} envelope; `load` reads
 * it back and runs `migrate` when the stored version is older than the
 * current one. Documents are capped at 64KB with a loud dev warning, so an
 * unbounded document is caught in development instead of in a quota error.
 */
export function createConfigStore(options: ConfigStoreOptions): ConfigStore {
  const storage = options.storage ?? defaultStorage()
  const namespace = `${options.key}:`
  const scoped = (name: string) => `${namespace}${name}`
  let warned = false
  const warn = (message: string) => {
    if (warned) return
    warned = true
    console.warn(message)
  }

  /** A backend that throws drops the write and says so, once. */
  const write = (name: string, raw: string): boolean => {
    try {
      storage.setItem(scoped(name), raw)
      return true
    } catch {
      warnStorageFailure()
      return false
    }
  }

  const read = <T>(name: string): ConfigDocument<T> | undefined => {
    const raw = storage.getItem(scoped(name))
    if (raw === null) return undefined
    let value: unknown
    try {
      value = JSON.parse(raw)
    } catch {
      return undefined
    }
    if (!isEnvelope(value)) return undefined
    const envelope = value as ConfigDocument<T>
    if (envelope.v === CONFIG_SCHEMA_VERSION) return envelope
    if (!options.migrate) {
      warn(
        `[newui-data] createConfigStore: "${name}" is v${envelope.v}, the store reads v${CONFIG_SCHEMA_VERSION}, and no migrate was supplied. It is unreadable, not corrupted.`,
      )
      return undefined
    }
    const migrated = options.migrate(envelope.doc, envelope.v)
    if (migrated === undefined) return undefined
    return { ...envelope, v: CONFIG_SCHEMA_VERSION, doc: migrated as T }
  }

  return {
    list() {
      const summaries: ConfigSummary[] = []
      for (const key of storage.keys()) {
        if (!key.startsWith(namespace)) continue
        const name = key.slice(namespace.length)
        const envelope = read(name)
        if (!envelope) continue
        const summary: ConfigSummary = {
          name,
          updatedAt: envelope.updatedAt,
        }
        if (envelope.type !== undefined) summary.type = envelope.type
        summaries.push(summary)
      }
      return summaries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    },
    load<T>(name: string) {
      return read<T>(name)
    },
    save<T>(name: string, doc: T, saveOptions: { type?: string } = {}) {
      const envelope: ConfigDocument<T> = {
        v: CONFIG_SCHEMA_VERSION,
        name,
        ...(saveOptions.type !== undefined ? { type: saveOptions.type } : {}),
        updatedAt: new Date().toISOString(),
        doc,
      }
      const raw = JSON.stringify(envelope)
      const bytes = byteLength(raw)
      if (bytes > CONFIG_DOCUMENT_LIMIT) {
        warnOverLimit(name, bytes)
        return false
      }
      return write(name, raw)
    },
    remove(name: string) {
      const existed = storage.getItem(scoped(name)) !== null
      try {
        storage.removeItem(scoped(name))
      } catch {
        // The entry is unreachable to the store either way.
      }
      return existed
    },
    rename(from: string, to: string) {
      const envelope = read(from)
      if (!envelope) return false
      const raw = JSON.stringify({
        ...envelope,
        name: to,
        updatedAt: new Date().toISOString(),
      } satisfies ConfigDocument)
      if (byteLength(raw) > CONFIG_DOCUMENT_LIMIT) {
        warnOverLimit(to, byteLength(raw))
        return false
      }
      if (!write(to, raw)) return false
      try {
        storage.removeItem(scoped(from))
      } catch {
        // The renamed copy is saved; the source is already gone for us.
      }
      return true
    },
  }
}
