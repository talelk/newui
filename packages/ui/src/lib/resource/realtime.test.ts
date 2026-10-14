import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createRealtime,
  type RealtimeListener,
  type RealtimeSocket,
  type RealtimeSocketFactory,
} from './realtime'

/** A minimal socket: records listeners, exposes a manual `fire`. */
function makeSocket() {
  const handlers = new Map<string, Set<RealtimeListener>>()
  const sent: unknown[] = []
  let closed = false

  const socket: RealtimeSocket = {
    on(event, listener) {
      const set = handlers.get(event) ?? new Set<RealtimeListener>()
      set.add(listener)
      handlers.set(event, set)
    },
    off(event, listener) {
      handlers.get(event)?.delete(listener)
    },
    close() {
      closed = true
    },
    send(data) {
      sent.push(data)
    },
  }

  return {
    socket,
    fire(event: string, ...args: unknown[]) {
      for (const listener of handlers.get(event) ?? []) listener(...args)
    },
    count(event: string) {
      return handlers.get(event)?.size ?? 0
    },
    sent,
    get closed() {
      return closed
    },
  }
}

type Fake = ReturnType<typeof makeSocket>

function makeHarness() {
  const sockets: Fake[] = []
  const factory: RealtimeSocketFactory = () => {
    const next = makeSocket()
    sockets.push(next)
    return next.socket
  }
  return { sockets, factory }
}

function socketAt(sockets: Fake[], index = 0): Fake {
  const socket = sockets[index]
  if (!socket) throw new Error(`No socket at index ${index}`)
  return socket
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('createRealtime', () => {
  it('connects on creation and tracks the connected signal', () => {
    const { sockets, factory } = makeHarness()
    const realtime = createRealtime({
      url: 'ws://x',
      factory,
      reconnect: false,
    })

    expect(sockets).toHaveLength(1)
    expect(realtime.connected()).toBe(false)

    socketAt(sockets).fire('open')
    expect(realtime.connected()).toBe(true)

    socketAt(sockets).fire('close')
    expect(realtime.connected()).toBe(false)
  })

  it('accepts socket.io connect/disconnect lifecycle events', () => {
    const { sockets, factory } = makeHarness()
    const realtime = createRealtime({
      url: 'ws://x',
      factory,
      reconnect: false,
    })

    socketAt(sockets).fire('connect')
    expect(realtime.connected()).toBe(true)

    socketAt(sockets).fire('disconnect', 'io server disconnect')
    expect(realtime.connected()).toBe(false)
  })

  it('reflects a socket that is already connected', () => {
    const socket: RealtimeSocket = {
      connected: true,
      on() {},
      off() {},
      close() {},
      send() {},
    }
    const realtime = createRealtime({
      url: 'ws://x',
      factory: () => socket,
      reconnect: false,
    })

    expect(realtime.connected()).toBe(true)
  })

  it('delivers named events and unsubscribes', () => {
    const { sockets, factory } = makeHarness()
    const realtime = createRealtime<{ list_update: { name: string } }>({
      url: 'ws://x',
      factory,
      reconnect: false,
    })
    const received: string[] = []
    const unsubscribe = realtime.on('list_update', (data) =>
      received.push(data.name),
    )

    socketAt(sockets).fire('list_update', { name: 'T-1' })
    expect(received).toEqual(['T-1'])
    expect(socketAt(sockets).count('list_update')).toBe(1)

    unsubscribe()
    expect(socketAt(sockets).count('list_update')).toBe(0)
    socketAt(sockets).fire('list_update', { name: 'T-2' })
    expect(received).toEqual(['T-1'])
  })

  it('off() removes a listener registered with on()', () => {
    const { sockets, factory } = makeHarness()
    const realtime = createRealtime({
      url: 'ws://x',
      factory,
      reconnect: false,
    })
    const listener = vi.fn()

    realtime.on('evt', listener)
    realtime.off('evt', listener)
    socketAt(sockets).fire('evt', 1)

    expect(listener).not.toHaveBeenCalled()
    expect(socketAt(sockets).count('evt')).toBe(0)
  })

  it('replays subscriptions registered before connecting', () => {
    const { sockets, factory } = makeHarness()
    const realtime = createRealtime({
      url: 'ws://x',
      factory,
      auto: false,
      reconnect: false,
    })
    const listener = vi.fn()
    realtime.on('evt', listener)

    expect(sockets).toHaveLength(0)
    realtime.connect()
    expect(sockets).toHaveLength(1)
    expect(socketAt(sockets).count('evt')).toBe(1)

    socketAt(sockets).fire('evt', 42)
    expect(listener).toHaveBeenCalledWith(42)
  })

  it('forwards send to the socket', () => {
    const { sockets, factory } = makeHarness()
    const realtime = createRealtime({
      url: 'ws://x',
      factory,
      reconnect: false,
    })

    realtime.send({ ping: 1 })
    expect(socketAt(sockets).sent).toEqual([{ ping: 1 }])
  })

  it('reports lifecycle callbacks', () => {
    const { sockets, factory } = makeHarness()
    const onOpen = vi.fn()
    const onClose = vi.fn()
    const onError = vi.fn()
    createRealtime({
      url: 'ws://x',
      factory,
      reconnect: false,
      onOpen,
      onClose,
      onError,
    })

    socketAt(sockets).fire('open')
    socketAt(sockets).fire('error', 'boom')
    socketAt(sockets).fire('close', 'bye')

    expect(onOpen).toHaveBeenCalledOnce()
    expect(onError).toHaveBeenCalledWith('boom')
    expect(onClose).toHaveBeenCalledWith('bye')
  })

  it('reconnects after an unexpected close, with backoff', () => {
    vi.useFakeTimers()
    const { sockets, factory } = makeHarness()
    const realtime = createRealtime({
      url: 'ws://x',
      factory,
      reconnectDelay: 100,
      maxReconnectDelay: 100,
    })

    expect(sockets).toHaveLength(1)
    socketAt(sockets).fire('open')
    socketAt(sockets).fire('close')
    expect(realtime.connected()).toBe(false)

    vi.advanceTimersByTime(99)
    expect(sockets).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(sockets).toHaveLength(2)

    // A new connection is replayed the current subscriptions.
    const listener = vi.fn()
    realtime.on('evt', listener)
    socketAt(sockets, 1).fire('evt', 'again')
    expect(listener).toHaveBeenCalledWith('again')
  })

  it('close() stops reconnecting and closes the socket', () => {
    vi.useFakeTimers()
    const { sockets, factory } = makeHarness()
    const realtime = createRealtime({
      url: 'ws://x',
      factory,
      reconnectDelay: 100,
    })

    socketAt(sockets).fire('open')
    realtime.close()
    expect(socketAt(sockets).closed).toBe(true)
    expect(realtime.connected()).toBe(false)

    // A late close event must not reopen a socket the caller closed.
    socketAt(sockets).fire('close')
    vi.advanceTimersByTime(1000)
    expect(sockets).toHaveLength(1)
  })

  it('is a no-op without a WebSocket or factory (SSR-safe)', () => {
    vi.stubGlobal('WebSocket', undefined)
    const realtime = createRealtime({ url: 'ws://x' })

    expect(realtime.connected()).toBe(false)
    expect(() => realtime.connect()).not.toThrow()
    expect(() => realtime.send('x')).not.toThrow()
  })

  it('adapts the native WebSocket by default', () => {
    class FakeWebSocket {
      static OPEN = 1
      static instances: FakeWebSocket[] = []
      readyState = 0
      listeners = new Map<string, Set<EventListener>>()
      sent: unknown[] = []

      constructor(
        readonly url: string,
        readonly protocols?: string | string[],
      ) {
        FakeWebSocket.instances.push(this)
      }

      addEventListener(type: string, listener: EventListener) {
        const set = this.listeners.get(type) ?? new Set<EventListener>()
        set.add(listener)
        this.listeners.set(type, set)
      }

      removeEventListener(type: string, listener: EventListener) {
        this.listeners.get(type)?.delete(listener)
      }

      close() {
        this.readyState = 3
      }

      send(data: unknown) {
        this.sent.push(data)
      }

      emit(type: string, event: unknown) {
        for (const listener of this.listeners.get(type) ?? []) {
          listener(event as Event)
        }
      }
    }

    vi.stubGlobal('WebSocket', FakeWebSocket)
    const realtime = createRealtime({ url: 'ws://x', reconnect: false })
    const ws = FakeWebSocket.instances[0]
    if (!ws) throw new Error('WebSocket was not constructed')

    expect(ws.url).toBe('ws://x')
    ws.emit('open', new Event('open'))
    expect(realtime.connected()).toBe(true)

    realtime.send({ a: 1 })
    expect(ws.sent).toEqual(['{"a":1}'])

    const received: unknown[] = []
    realtime.on('message', (data) => received.push(data))
    ws.emit('message', { data: 'hello' } as MessageEvent)
    expect(received).toEqual(['hello'])

    realtime.close()
    expect(ws.readyState).toBe(3)
  })
})
