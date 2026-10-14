import { type Accessor, createSignal } from 'solid-js'

/**
 * A realtime transport over a `WebSocket`.
 *
 * This is a **plain-`WebSocket`** helper, not a socket.io client: it opens one
 * socket to a configurable URL and multiplexes subscriptions over it through
 * `on`/`off`/`close`. The socket is created by an injectable
 * {@link RealtimeSocketFactory}, so a consumer who already uses socket.io can
 * pass `io(url)` as the factory — a socket.io `Socket` satisfies
 * {@link RealtimeSocket} — and get named events for free. The wire protocol is
 * deliberately *not* implemented here.
 *
 * The default factory adapts the native `WebSocket` to the same surface: it
 * forwards the `open`/`close`/`error` lifecycle events and delivers each
 * message as a single `message` event carrying the raw `event.data`. With the
 * native transport there is no event multiplexing on the wire, so named
 * subscriptions only fire under a transport that provides them (socket.io).
 */

/** A listener registered with {@link Realtime.on}. */
export type RealtimeListener = (...args: unknown[]) => void

/**
 * The minimal socket surface the realtime helper drives. A native `WebSocket`
 * is adapted to it by the default factory; a `socket.io-client` `Socket`
 * already satisfies it, so it can be passed through
 * {@link RealtimeOptions.factory} directly.
 */
export interface RealtimeSocket {
  on(event: string, listener: RealtimeListener): unknown
  off(event: string, listener: RealtimeListener): unknown
  close(): void
  send?(data: unknown): void
  /** Whether the socket is currently connected (socket.io exposes this). */
  readonly connected?: boolean
}

/** Build the transport for a URL. See {@link RealtimeOptions.factory}. */
export type RealtimeSocketFactory = (
  url: string,
  protocols?: string | string[],
) => RealtimeSocket

/** The map of event name to payload, for a typed {@link Realtime}. */
export interface RealtimeEventMap {
  [event: string]: unknown
}

/** Options for {@link createRealtime}. */
export interface RealtimeOptions {
  /** WebSocket URL, or an accessor for a reactive URL. */
  url: string | (() => string)
  /** Subprotocols passed to the native `WebSocket` constructor. */
  protocols?: string | string[]
  /**
   * Socket factory. Defaults to a native `WebSocket` adapter. Pass a
   * socket.io client factory (`(url) => io(url)`) to reuse that transport.
   */
  factory?: RealtimeSocketFactory
  /** Connect on creation. Defaults to `true`. */
  auto?: boolean
  /**
   * Reconnect after an unexpected close, with exponential backoff. Defaults to
   * `true`. Set `false` when the injected transport (socket.io) reconnects on
   * its own.
   */
  reconnect?: boolean
  /** First reconnect delay in ms. Defaults to `1000`. */
  reconnectDelay?: number
  /** Cap on the reconnect delay in ms. Defaults to `30000`. */
  maxReconnectDelay?: number
  onOpen?: () => void
  onClose?: (event?: unknown) => void
  onError?: (event?: unknown) => void
}

/** The signal-based realtime handle {@link createRealtime} returns. */
export interface Realtime<TEvents extends RealtimeEventMap = RealtimeEventMap> {
  /** Whether the socket is currently connected. */
  connected: Accessor<boolean>
  /** Open the connection. Idempotent while already open. */
  connect(): void
  /** Subscribe to an event. Returns an unsubscribe function. */
  on<K extends keyof TEvents & string>(
    event: K,
    listener: (data: TEvents[K]) => void,
  ): () => void
  /** Unsubscribe a listener previously registered with `on`. */
  off(event: string, listener: RealtimeListener): void
  /** Send a payload; the native transport JSON-encodes non-strings. */
  send(data: unknown): void
  /** Close the connection and stop reconnecting. */
  close(): void
}

const DEFAULT_RECONNECT_DELAY = 1000
const DEFAULT_MAX_RECONNECT_DELAY = 30_000

/** Adapt a native `WebSocket` to {@link RealtimeSocket}. */
function nativeFactory(
  url: string,
  protocols?: string | string[],
): RealtimeSocket {
  const socket = protocols ? new WebSocket(url, protocols) : new WebSocket(url)
  const messageHandlers = new Map<
    RealtimeListener,
    (event: MessageEvent) => void
  >()

  return {
    on(event, listener) {
      if (event === 'message') {
        const handler = (message: MessageEvent) => listener(message.data)
        messageHandlers.set(listener, handler)
        socket.addEventListener('message', handler)
        return
      }
      socket.addEventListener(
        event as keyof WebSocketEventMap,
        listener as EventListener,
      )
    },
    off(event, listener) {
      if (event === 'message') {
        const handler = messageHandlers.get(listener)
        if (handler) {
          socket.removeEventListener('message', handler)
          messageHandlers.delete(listener)
        }
        return
      }
      socket.removeEventListener(
        event as keyof WebSocketEventMap,
        listener as EventListener,
      )
    },
    close() {
      socket.close()
    },
    send(data) {
      socket.send(typeof data === 'string' ? data : JSON.stringify(data))
    },
    get connected() {
      return socket.readyState === WebSocket.OPEN
    },
  }
}

/** The default factory, or `undefined` when there is no browser `WebSocket`. */
function defaultFactory(): RealtimeSocketFactory | undefined {
  if (typeof window === 'undefined' || typeof WebSocket === 'undefined') {
    return undefined
  }
  return nativeFactory
}

/**
 * Open a WebSocket and expose typed `on`/`off`/`close` over it.
 *
 * `connected` is a signal. Subscriptions registered before the socket exists
 * are replayed onto every (re)connection, so a consumer can call `on` in any
 * order. Lifecycle events are accepted in both dialects — `open`/`close` for a
 * native `WebSocket`, `connect`/`disconnect` for socket.io.
 */
export function createRealtime<
  TEvents extends RealtimeEventMap = RealtimeEventMap,
>(options: RealtimeOptions): Realtime<TEvents> {
  const [connected, setConnected] = createSignal(false)
  const listeners = new Map<string, Set<RealtimeListener>>()
  const reconnectEnabled = options.reconnect !== false
  const baseDelay = options.reconnectDelay ?? DEFAULT_RECONNECT_DELAY
  const maxDelay = options.maxReconnectDelay ?? DEFAULT_MAX_RECONNECT_DELAY

  let socket: RealtimeSocket | null = null
  let stopped = false
  let attempt = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  const currentUrl = (): string =>
    typeof options.url === 'function' ? options.url() : options.url

  function handleOpen(): void {
    attempt = 0
    setConnected(true)
    options.onOpen?.()
  }

  function handleClose(event?: unknown): void {
    setConnected(false)
    options.onClose?.(event)
    socket = null
    if (!stopped && reconnectEnabled) scheduleReconnect()
  }

  function handleError(event?: unknown): void {
    options.onError?.(event)
  }

  function scheduleReconnect(): void {
    if (timer) return
    const delay = Math.min(baseDelay * 2 ** attempt, maxDelay)
    attempt += 1
    timer = setTimeout(() => {
      timer = null
      open()
    }, delay)
  }

  function attach(target: RealtimeSocket): void {
    const isCurrent = (): boolean => socket === target
    target.on('open', () => {
      if (isCurrent()) handleOpen()
    })
    target.on('connect', () => {
      if (isCurrent()) handleOpen()
    })
    target.on('close', (event) => {
      if (isCurrent()) handleClose(event)
    })
    target.on('disconnect', (event) => {
      if (isCurrent()) handleClose(event)
    })
    target.on('error', (event) => {
      if (isCurrent()) handleError(event)
    })
    for (const [event, set] of listeners) {
      for (const listener of set) target.on(event, listener)
    }
  }

  function open(): void {
    if (socket || stopped) return
    const create = options.factory ?? defaultFactory()
    if (!create) return
    const target = create(currentUrl(), options.protocols)
    socket = target
    attach(target)
    // A socket that is already connected (e.g. socket.io with `autoConnect`)
    // does not re-fire `connect`, so reflect its state now.
    if (target.connected) handleOpen()
  }

  function connect(): void {
    stopped = false
    open()
  }

  function on<K extends keyof TEvents & string>(
    event: K,
    listener: (data: TEvents[K]) => void,
  ): () => void {
    const wrapped = listener as RealtimeListener
    const set = listeners.get(event) ?? new Set<RealtimeListener>()
    set.add(wrapped)
    listeners.set(event, set)
    socket?.on(event, wrapped)
    return () => off(event, wrapped)
  }

  function off(event: string, listener: RealtimeListener): void {
    listeners.get(event)?.delete(listener)
    socket?.off(event, listener)
  }

  function send(data: unknown): void {
    socket?.send?.(data)
  }

  function close(): void {
    stopped = true
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    const target = socket
    // `handleClose` only runs for the current socket, so call it before the
    // socket is detached; the transport's own close event is then ignored.
    handleClose()
    target?.close()
  }

  // Auto-connect on creation. `connect` is a plain action, not a signal read.
  if (options.auto !== false) connect()

  return { connected, connect, on, off, send, close }
}
