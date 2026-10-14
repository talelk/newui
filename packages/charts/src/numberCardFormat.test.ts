import { describe, expect, it } from 'vitest'
import {
  deltaDirection,
  deltaTone,
  formatCardDelta,
  formatCardValue,
} from './numberCardFormat'

describe('deltaDirection', () => {
  it('reads the sign of the change', () => {
    expect(deltaDirection(3)).toBe('up')
    expect(deltaDirection(-3)).toBe('down')
    expect(deltaDirection(0)).toBe('flat')
    expect(deltaDirection(null)).toBe('flat')
    expect(deltaDirection(undefined)).toBe('flat')
  })
})

describe('deltaTone', () => {
  it('calls a rise good unless the metric inverts', () => {
    expect(deltaTone(3)).toBe('positive')
    expect(deltaTone(-3)).toBe('negative')
    expect(deltaTone(0)).toBe('neutral')
  })

  it('flips the colors without touching the direction', () => {
    expect(deltaTone(-3, true)).toBe('positive')
    expect(deltaTone(3, true)).toBe('negative')
    expect(deltaDirection(-3)).toBe('down')
  })
})

describe('formatCardValue', () => {
  it('renders a string reading as given', () => {
    expect(formatCardValue({}, 'N/A')).toBe('N/A')
  })

  it('formats a number with prefix and suffix', () => {
    expect(formatCardValue({ prefix: '$', suffix: 'k' }, 1234)).toBe('$1,234k')
  })

  it('uses the caller format when one is given', () => {
    expect(formatCardValue({ format: (v) => `${v}%` }, 42)).toBe('42%')
  })

  it('is empty for a missing value', () => {
    expect(formatCardValue({}, null)).toBe('')
    expect(formatCardValue({}, undefined)).toBe('')
  })
})

describe('formatCardDelta', () => {
  it('prints the magnitude, unsigned, with its units', () => {
    expect(formatCardDelta({ deltaSuffix: '%' }, -3.1)).toBe('3.1%')
    expect(formatCardDelta({ deltaPrefix: '$' }, 2500)).toBe('$2.5K')
  })

  it('is empty for a missing delta', () => {
    expect(formatCardDelta({}, null)).toBe('')
  })

  it('uses the caller delta format on the magnitude', () => {
    expect(formatCardDelta({ deltaFormat: (v) => `${v}pts` }, -5)).toBe('5pts')
  })
})
