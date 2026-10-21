import { createSignal } from 'solid-js'

/**
 * A tiny request stack: a reactive list plus push/remove/reset.
 *
 * Generic on purpose — it knows nothing about dialogs, so the dialog module
 * owns its own types and the store stays reusable (and free of type-only
 * imports, which dependency-cruiser treats as no dependency at all).
 */
export function createRequestStore<T extends { id: string }>() {
  const [requests, setRequests] = createSignal<T[]>([])

  return {
    /** The mounted requests, in stack order. Read reactively by the host. */
    requests,
    add(request: T): void {
      setRequests((list) => [...list, request])
    },
    remove(id: string): void {
      setRequests((list) => list.filter((request) => request.id !== id))
    },
    /** Test seam: drop every pending request without resolving it. */
    reset(): void {
      setRequests([])
    },
  }
}
