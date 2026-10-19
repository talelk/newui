import { type Accessor, createSignal } from 'solid-js'

/**
 * One-step undo (H2, spec/examples-refresh.md §1).
 *
 * Three pages kept the same shape by hand — a snapshot signal, capture
 * before mutating, restore and clear on undo. `createUndo` owns that
 * signal; the page keeps owning its data and its notice copy.
 */
export interface Undo<T> {
  /** The captured value, or `undefined` when there is nothing to undo. */
  snapshot: Accessor<T | undefined>
  /** Remember `value` as the state an undo returns to. */
  capture: (value: T) => void
  /**
   * Hand the snapshot back to `restore` and clear it. Returns whether a
   * snapshot existed, so the caller can word its notice either way.
   */
  undo: (restore: (value: T) => void) => boolean
  /** Drop the snapshot without restoring. */
  clear: () => void
}

export function createUndo<T>(): Undo<T> {
  const [snapshot, setSnapshot] = createSignal<T | undefined>(undefined)
  return {
    snapshot,
    capture: (value) => setSnapshot(() => value),
    undo: (restore) => {
      const previous = snapshot()
      if (previous === undefined) return false
      restore(previous)
      setSnapshot(undefined)
      return true
    },
    clear: () => setSnapshot(undefined),
  }
}
