import { QueryClient } from '@tanstack/solid-query'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { connectRealtime } from './connect-realtime'
import type { Realtime } from './realtime'

/** A socket-shaped test double: `emit` stands in for a server push. */
function fakeRealtime() {
  const handlers = new Map<string, Set<(data: unknown) => void>>()
  const [connected, setConnected] = createSignal(false)
  const socket: Realtime = {
    connected,
    connect: () => setConnected(true),
    on(event, listener) {
      const set = handlers.get(event) ?? new Set()
      set.add(listener)
      handlers.set(event, set)
      return () => set.delete(listener)
    },
    off(event, listener) {
      handlers.get(event)?.delete(listener)
    },
    send: () => {},
    close: () => setConnected(false),
  }
  return {
    socket,
    emit(event: string, data: unknown) {
      for (const listener of handlers.get(event) ?? []) listener(data)
    },
  }
}

function makeClient() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
  const invalidate = vi.spyOn(client, 'invalidateQueries')
  return { client, invalidate }
}

describe('connectRealtime', () => {
  it('invalidates the doctype prefix for list events', () => {
    const { client, invalidate } = makeClient()
    const { socket, emit } = fakeRealtime()
    connectRealtime(client, { realtime: socket, doctype: 'Task' })

    emit('list_update', { doctype: 'Task' })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['Task'] })
  })

  it('invalidates the exact key for doc events', () => {
    const { client, invalidate } = makeClient()
    const { socket, emit } = fakeRealtime()
    connectRealtime(client, { realtime: socket, doctype: 'Task' })

    emit('list_update', { doctype: 'Task', name: 'TASK-1' })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['Task', 'TASK-1'],
      exact: true,
    })
  })

  it('honours an explicit event type over the name heuristic', () => {
    const { client, invalidate } = makeClient()
    const { socket, emit } = fakeRealtime()
    connectRealtime(client, { realtime: socket, doctype: 'Task' })

    emit('list_update', { doctype: 'Task', name: 'TASK-1', type: 'list' })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['Task'] })
  })

  it('filters by doctype and reports the normalized event', () => {
    const { client, invalidate } = makeClient()
    const { socket, emit } = fakeRealtime()
    const onEvent = vi.fn()
    connectRealtime(client, { realtime: socket, doctype: 'Task' }, { onEvent })

    emit('list_update', { doctype: 'Invoice', name: 'INV-1' })
    expect(invalidate).not.toHaveBeenCalled()
    expect(onEvent).not.toHaveBeenCalled()

    emit('list_update', { doctype: 'Task', name: 'TASK-1' })
    expect(onEvent).toHaveBeenCalledWith({
      type: 'doc',
      doctype: 'Task',
      name: 'TASK-1',
    })
  })

  it('subscribes to the event names the app declares', () => {
    const { client, invalidate } = makeClient()
    const { socket, emit } = fakeRealtime()
    connectRealtime(client, {
      realtime: socket,
      doctype: ['Task', 'Invoice'],
      events: ['doc_update'],
    })

    emit('list_update', { doctype: 'Task' })
    expect(invalidate).not.toHaveBeenCalled()
    emit('doc_update', { doctype: 'Invoice', name: 'INV-2' })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['Invoice', 'INV-2'],
      exact: true,
    })
  })

  it('ignores payloads that are not change events', () => {
    const { client, invalidate } = makeClient()
    const { socket, emit } = fakeRealtime()
    const onEvent = vi.fn()
    connectRealtime(client, { realtime: socket, doctype: 'Task' }, { onEvent })

    emit('list_update', 'ping')
    emit('list_update', { name: 'no-doctype' })
    emit('list_update', null)
    expect(invalidate).not.toHaveBeenCalled()
    expect(onEvent).not.toHaveBeenCalled()
  })

  it('stops listening on close, leaving the socket itself alone', () => {
    const { client, invalidate } = makeClient()
    const { socket, emit } = fakeRealtime()
    const connection = connectRealtime(client, {
      realtime: socket,
      doctype: 'Task',
    })

    connection.close()
    emit('list_update', { doctype: 'Task' })
    expect(invalidate).not.toHaveBeenCalled()
    expect(socket.connected()).toBe(false)
  })
})
