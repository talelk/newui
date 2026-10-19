import { describe, expect, it } from 'vitest'
import { first, optionsOf } from './select'

describe('select', () => {
  it('mirrors values into options and unwraps with a fallback', () => {
    expect(optionsOf(['Name', 'Size'])).toEqual([
      { label: 'Name', value: 'Name' },
      { label: 'Size', value: 'Size' },
    ])
    expect(first(['Size'], 'Name')).toBe('Size')
    expect(first([], 'Name')).toBe('Name')
  })
})
