import { type Accessor, createSignal, onCleanup, type Setter } from 'solid-js'
import {
  encodeValue,
  type UrlStateAdapter,
  type UrlStateValue,
} from './url-serialize'

export type { UrlStateAdapter, UrlStateValue } from './url-serialize'

/**
 * URL state, router-agnostic by contract.
 *
 * `createUrlState` owns the signals whose values serialize to
 * `URLSearchParams`: what makes a page reproducible by link — filters, view,
 * page index, sort, density, time range. The app supplies the adapter, so the
 * kit never imports a router: Solid Start's `useNavigate`, TanStack Router or
 * a `history.replaceState` shim all satisfy {@link UrlStateAdapter}. Without
 * an adapter the primitive is a plain controllable signal — tests and SSR stay
 * clean, and the URL is simply never written.
 *
 * Writes **replace** the query string, never push (the back button leaves the
 * page, it does not walk a filter history), and concurrent writes coalesce
 * into one `replace` per frame. Search-like keys can be debounced so typing
 * does not spam the history.
 */

/** Options for {@link createUrlState}. */
export interface UrlStateOptions {
  /** The router bridge. Absent means no URL access at all — pure signals. */
  adapter?: UrlStateAdapter
  /** Keys written after a debounce instead of immediately (search-like keys). */
  debounce?: readonly string[]
  /** Debounce window in ms. Defaults to `300`. */
  debounceMs?: number
}

/** The handle {@link createUrlState} returns: one accessor per key. */
export type UrlState<T extends Record<string, UrlStateValue>> = {
  [K in keyof T]: Accessor<T[K]>
} & {
  /** Write one key. `undefined` means absent — it is removed, never `""`. */
  set<K extends keyof T>(key: K, value: T[K] | undefined): void
  /** The params every key serializes to right now (for "copy link"). */
  params(): URLSearchParams
}

const DEFAULT_DEBOUNCE_MS = 300

/** Decode one raw param back, trusting the initial value's type. */
function decode(raw: string, initial: UrlStateValue): UrlStateValue {
  if (typeof initial === 'string') return raw
  if (typeof initial === 'number') {
    const value = Number(raw)
    return Number.isFinite(value) ? value : initial
  }
  if (typeof initial === 'boolean') return raw === 'true'
  try {
    return JSON.parse(raw) as UrlStateValue
  } catch {
    return initial
  }
}

/**
 * Controllable signals serialized to `URLSearchParams`.
 *
 * `initial` is what the page renders when the URL says nothing about a key;
 * the URL wins when it does. Keys are the app's, not the table's — `view.sort`
 * rather than `sort` — so one URL can host several surfaces without collisions.
 */
export function createUrlState<T extends Record<string, UrlStateValue>>(
  initial: T,
  options: UrlStateOptions = {},
): UrlState<T> {
  const keys = Object.keys(initial) as (keyof T & string)[]
  const params = new URLSearchParams()
  for (const key of keys) {
    params.set(key, encodeValue(initial[key] as UrlStateValue))
  }

  const signals = new Map<
    string,
    [Accessor<UrlStateValue>, Setter<UrlStateValue>]
  >()
  const state: Record<string, unknown> = {}
  for (const key of keys) {
    const [get, set] = createSignal<UrlStateValue>(
      initial[key] as UrlStateValue,
    )
    // Storing the accessor reference, not reading it — `state.view` is the
    // signal, so the reactivity rule sees no tracked read to miss.
    // eslint-disable-next-line solid/reactivity
    signals.set(key, [get, set])
    state[key] = get
  }

  // Read-once on mount: the URL seeds the signals, then signals drive.
  if (options.adapter) {
    try {
      const search = new URLSearchParams(options.adapter.search())
      for (const key of keys) {
        const raw = search.get(key)
        if (raw === null) continue
        const value = decode(raw, initial[key] as UrlStateValue)
        params.set(key, encodeValue(value))
        signals.get(key)?.[1](() => value)
      }
    } catch {
      // An unreadable URL is "absent everywhere": keep the initial values.
    }
  }

  const debounceKeys = new Set(options.debounce ?? [])
  const debounceMs = options.debounceMs ?? DEFAULT_DEBOUNCE_MS
  let timer: ReturnType<typeof setTimeout> | null = null
  let scheduled = false
  let dirty = false

  const flush = () => {
    scheduled = false
    dirty = false
    options.adapter?.replace(new URLSearchParams(params))
  }

  /** Replace-not-push, batched per tick: one `replace` per coalesced write. */
  const schedule = () => {
    dirty = true
    if (!options.adapter || scheduled) return
    scheduled = true
    queueMicrotask(flush)
  }

  onCleanup(() => {
    if (timer) clearTimeout(timer)
  })

  const setKey = (
    key: keyof T & string,
    value: UrlStateValue | undefined,
  ): void => {
    const entry = signals.get(key)
    if (!entry) return
    const [, set] = entry
    if (value === undefined) {
      params.delete(key)
      set(() => initial[key] as UrlStateValue)
    } else {
      params.set(key, encodeValue(value))
      set(() => value)
    }
    if (debounceKeys.has(key)) {
      // A search-like key waits out the debounce window before its value
      // reaches the URL, so typing does not spam the history.
      if (timer) clearTimeout(timer)
      dirty = true
      timer = setTimeout(() => {
        timer = null
        if (dirty) flush()
      }, debounceMs)
    } else {
      schedule()
    }
  }
  state['set'] = setKey

  state['params'] = () => new URLSearchParams(params)
  return state as unknown as UrlState<T>
}
