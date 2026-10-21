import { describe, expect, it } from 'vitest'
import { COMPONENTS } from '../apps/playground/src/generated/components'
import { atomicOf, CLASSIFICATION } from './atomic'

describe('atomic package classification', () => {
  it('classifies every shipped reference entry exactly once', () => {
    const names = COMPONENTS.filter((entry) => entry.shipped)
      .map((entry) => entry.name)
      .sort()
    expect(Object.keys(CLASSIFICATION).sort()).toEqual(names)
  })

  it('keeps every generated registry level equal to its explicit classification', () => {
    for (const entry of COMPONENTS) {
      expect(atomicOf(entry.name), entry.name).toBe(entry.atomic)
    }
  })
})
