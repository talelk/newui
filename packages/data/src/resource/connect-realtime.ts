import type { QueryClient } from '@tanstack/solid-query'
import type { Realtime } from './realtime'

/**
 * The realtime-to-cache bridge.
 *
 * `connectRealtime` subscribes to a {@link createRealtime} socket and
 * invalidates the matching TanStack Query keys: a **list** event invalidates
 * the `[doctype]` prefix — every query that reads that doctype — and a **doc**
 * event invalidates exactly `[doctype, name]`. It is a function, not a hook:
 * the cache is the integration point, and the socket factory finally has a
 * consumer.
 */

/** A normalized change: `list` moves a whole doctype, `doc` one record. */
export interface RealtimeEvent {
  type: 'list' | 'doc'
  doctype: string
  name?: string
}

/** What the cache listens to. */
export interface RealtimeResource {
  /** The socket returned by {@link createRealtime}. */
  realtime: Realtime
  /** Doctype(s) whose changes should invalidate the cache. */
  doctype: string | readonly string[]
  /**
   * Event names carrying `{ doctype, name }` payloads. Defaults to
   * `['list_update']` — the event Frappe emits for every change.
   */
  events?: readonly string[]
}

/** Options for {@link connectRealtime}. */
export interface ConnectRealtimeOptions {
  /** Called for every event that passes the `doctype` filter. */
  onEvent?: (event: RealtimeEvent) => void
}

/** The handle {@link connectRealtime} returns. */
export interface RealtimeConnection {
  /** Unsubscribe from the socket. The socket itself stays open — the app
   * owns its lifecycle, and other consumers may still be on it. */
  close(): void
}

/**
 * Normalize one socket payload. A payload with a `type` wins; otherwise a
 * `name` means one document changed and its absence means the list did.
 */
function normalizeEvent(data: unknown): RealtimeEvent | undefined {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return undefined
  }
  const payload = data as Record<string, unknown>
  if (typeof payload['doctype'] !== 'string') return undefined
  const name = typeof payload['name'] === 'string' ? payload['name'] : undefined
  let type: 'list' | 'doc'
  if (payload['type'] === 'list' || payload['type'] === 'doc') {
    type = payload['type']
  } else {
    type = name ? 'doc' : 'list'
  }
  return { type, doctype: payload['doctype'], ...(name ? { name } : {}) }
}

/**
 * Bridge a socket to a query cache.
 *
 * ```ts
 * const socket = createRealtime({ url: realtimeUrl })
 * const connection = connectRealtime(queryClient, {
 *   realtime: socket,
 *   doctype: 'Task',
 *   onEvent: (event) => console.debug(event),
 * })
 * connection.close() // stop listening; the socket stays open
 * ```
 */
export function connectRealtime(
  queryClient: QueryClient,
  resource: RealtimeResource,
  options: ConnectRealtimeOptions = {},
): RealtimeConnection {
  const wanted = new Set(
    typeof resource.doctype === 'string'
      ? [resource.doctype]
      : resource.doctype,
  )
  const events = resource.events ?? ['list_update']
  const unsubscribes: (() => void)[] = []

  for (const event of events) {
    unsubscribes.push(
      resource.realtime.on(event, (data) => {
        const normalized = normalizeEvent(data)
        if (!normalized) return
        if (wanted.size > 0 && !wanted.has(normalized.doctype)) return
        if (normalized.type === 'doc' && normalized.name) {
          void queryClient.invalidateQueries({
            queryKey: [normalized.doctype, normalized.name],
            exact: true,
          })
        } else {
          void queryClient.invalidateQueries({
            queryKey: [normalized.doctype],
          })
        }
        options.onEvent?.(normalized)
      }),
    )
  }

  return {
    close() {
      for (const unsubscribe of unsubscribes) unsubscribe()
      unsubscribes.length = 0
    },
  }
}
