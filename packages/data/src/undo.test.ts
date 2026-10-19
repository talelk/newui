import { createRoot } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { createUndo } from './undo'

describe('undo', () => {
  it('captures, restores once, then reports nothing left', () => {
    createRoot((dispose) => {
      const undo = createUndo<number[]>()
      expect(undo.snapshot()).toBeUndefined()
      expect(undo.undo(() => {})).toBe(false)

      undo.capture([1, 2])
      const restored: number[][] = []
      expect(undo.undo((value) => restored.push(value))).toBe(true)
      expect(restored).toEqual([[1, 2]])
      expect(undo.snapshot()).toBeUndefined()

      undo.capture([3])
      undo.clear()
      expect(undo.snapshot()).toBeUndefined()
      dispose()
    })
  })
})
