import { type Accessor, createSignal } from 'solid-js'

export interface ControllableOptions<T> {
  /** Controlled value. When provided (defined), the component is controlled. */
  value?: Accessor<T | undefined>
  /** Uncontrolled initial value. */
  defaultValue?: T
  /** Called on every user-initiated change, controlled or not. */
  onChange?: (value: T) => void
}

/**
 * The Solid replacement for Vue's `v-model`.
 *
 * Returns `[value, setValue]`. `setValue` updates internal state only while
 * uncontrolled, but always fires `onChange` — so a controlled parent observes
 * the request and an uncontrolled one sees the value move.
 */
export function createControllableSignal<T>(
  opts: ControllableOptions<T>,
): [Accessor<T>, (next: T) => void] {
  const [internal, setInternal] = createSignal<T>(opts.defaultValue as T)
  const isControlled = () => opts.value?.() !== undefined

  const value = () => (isControlled() ? (opts.value?.() as T) : internal())

  const set = (next: T) => {
    if (!isControlled()) setInternal(() => next)
    opts.onChange?.(next)
  }

  return [value, set]
}
