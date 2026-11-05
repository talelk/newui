/**
 * The serialization half of URL state, shared by `createUrlState` and by the
 * higher-level primitives that compose it (`createDashboardState`,
 * `createTablePersist`).
 *
 * `encodeValue` is `createUrlState`'s encoding; a composing primitive needs to
 * know what a key serializes to — to prune params that say nothing — so it
 * lives here instead of being copied. The types live here for the same reason:
 * `url-state.ts` re-exports them, so the public surface is unchanged.
 */

/** A value that serializes into a query parameter. */
export type UrlStateValue =
  | string
  | number
  | boolean
  | readonly UrlStateValue[]
  | { readonly [key: string]: UrlStateValue }

/** The router side of {@link createUrlState}. */
export interface UrlStateAdapter {
  /**
   * The current query string (`"?a=1"` or `"a=1"`). Read **once** on creation,
   * so first paint renders from the URL and a shared link deep-links without
   * a client redirect.
   */
  search(): string
  /** Replace the query string. Must not push a history entry. */
  replace(params: URLSearchParams): void
}

/** JSON with object keys in sorted order, so a round-trip is stable. */
function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, part: unknown) => {
    if (part !== null && typeof part === 'object' && !Array.isArray(part)) {
      const record = part as Record<string, unknown>
      const sorted: Record<string, unknown> = {}
      for (const key of Object.keys(record).sort()) sorted[key] = record[key]
      return sorted
    }
    return part
  })
}

/** Encode one value for its query parameter. Primitives stay as-is. */
export function encodeValue(value: UrlStateValue): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return stableStringify(value)
}

/**
 * The params an initial record serializes to — what "default" means for a
 * set of keys. A param that still carries its default value says nothing, so
 * it should never reach a shared link.
 */
export function defaultsFor(
  initial: Record<string, UrlStateValue>,
): URLSearchParams {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(initial)) {
    params.set(key, encodeValue(value))
  }
  return params
}

/** Drop every param that still says what its default says. Mutates `params`. */
export function pruneDefaults(
  params: URLSearchParams,
  defaults: URLSearchParams,
): URLSearchParams {
  for (const [key, value] of [...defaults]) {
    if (params.get(key) === value) params.delete(key)
  }
  return params
}

/**
 * An adapter wrapper that never writes a param back when it still holds its
 * default. The composing primitive owns the keys; the pruning rule is the
 * "link shares only what is not the default" contract, stated once.
 */
export function withPruning(
  adapter: UrlStateAdapter,
  defaults: URLSearchParams,
): UrlStateAdapter {
  return {
    search: () => adapter.search(),
    replace: (params) => adapter.replace(pruneDefaults(params, defaults)),
  }
}
