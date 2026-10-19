import { describe, expect, it } from 'vitest'
import { bytes, count, isEmail, usd, usdK } from './format'

describe('format', () => {
  it('formats money, counts and sizes the way the pages did', () => {
    expect(usd(128430)).toBe('$128,430')
    expect(usd(0)).toBe('$0')
    expect(usdK(42500)).toBe('$43k')
    expect(usdK(400)).toBe('$0k')
    expect(count(128430)).toBe('128,430')
    expect(bytes(512)).toBe('512 B')
    expect(bytes(2048)).toBe('2.0 KB')
    expect(bytes(5 * 1024 * 1024)).toBe('5.0 MB')
  })

  it('accepts ordinary addresses and rejects the rest', () => {
    expect(isEmail('rhea@example.com')).toBe(true)
    expect(isEmail('rhea@example')).toBe(false)
    expect(isEmail('rhea kapoor@example.com')).toBe(false)
    expect(isEmail('')).toBe(false)
  })
})
