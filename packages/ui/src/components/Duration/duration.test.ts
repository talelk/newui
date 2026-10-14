import { describe, expect, it } from 'vitest'
import { formatDuration, parseDuration } from './duration'

describe('formatDuration', () => {
  it('formats the short preset with smart zero-omission', () => {
    expect(formatDuration(5445)).toBe('1h 30m 45s')
    expect(formatDuration(90)).toBe('1m 30s')
    expect(formatDuration(0)).toBe('0s')
  })

  it('formats the long preset with pluralization', () => {
    expect(formatDuration(5445, 'long')).toBe('1 hour 30 minutes 45 seconds')
    expect(formatDuration(1, 'long')).toBe('1 second')
    expect(formatDuration(0, 'long')).toBe('0 seconds')
  })

  it('formats the colon preset', () => {
    expect(formatDuration(5445, 'colon')).toBe('1:30:45')
    expect(formatDuration(90, 'colon')).toBe('1:30')
  })

  it('renders token templates, padding runs of two or more', () => {
    expect(formatDuration(5445, "h'h' m'm' s's'")).toBe('1h 30m 45s')
    expect(formatDuration(90, "h'h' m'm' s's'")).toBe('0h 1m 30s')
    expect(formatDuration(7323, 'hh:mm:ss')).toBe('02:02:03')
    expect(formatDuration(0, "''")).toBe("'")
  })

  it('returns an empty string for a missing value', () => {
    expect(formatDuration(null)).toBe('')
    expect(formatDuration(undefined)).toBe('')
  })
})

describe('parseDuration', () => {
  it('parses named units in any order, spaces optional', () => {
    expect(parseDuration('1h 30m 45s')).toBe(5445)
    expect(parseDuration('1h30m45s')).toBe(5445)
    expect(parseDuration('4m 3h 4s')).toBe(11044)
    expect(parseDuration('4sec 3hour 4min')).toBe(11044)
  })

  it('parses colon-separated forms', () => {
    expect(parseDuration('1:30:45')).toBe(5445)
    expect(parseDuration('1:30')).toBe(90)
    expect(parseDuration(':45')).toBe(45)
    expect(parseDuration('1:75')).toBe(135)
  })

  it('treats a bare integer as seconds', () => {
    expect(parseDuration('90')).toBe(90)
    expect(parseDuration('90s')).toBe(90)
  })

  it('is case-insensitive and trims', () => {
    expect(parseDuration('  2H 30M  ')).toBe(9000)
  })

  it('returns null for invalid or empty input', () => {
    expect(parseDuration('')).toBeNull()
    expect(parseDuration('   ')).toBeNull()
    expect(parseDuration('banana')).toBeNull()
    expect(parseDuration('1h 1h')).toBeNull()
    expect(parseDuration('1h 2')).toBeNull()
  })
})
