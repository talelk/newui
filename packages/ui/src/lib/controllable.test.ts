import { createRoot } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createControllableSignal } from './controllable'

describe('createControllableSignal', () => {
  it('updates internal state and fires onChange when uncontrolled', () => {
    createRoot((dispose) => {
      const onChange = vi.fn()
      const [value, set] = createControllableSignal<number>({
        defaultValue: 0,
        onChange,
      })
      set(5)
      expect(value()).toBe(5)
      expect(onChange).toHaveBeenCalledWith(5)
      dispose()
    })
  })

  it('ignores internal updates when controlled', () => {
    createRoot((dispose) => {
      const [value, set] = createControllableSignal<number>({
        value: () => 1,
        defaultValue: 0,
      })
      set(9)
      expect(value()).toBe(1)
      dispose()
    })
  })
})
