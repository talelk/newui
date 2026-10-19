import { createRoot } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { csvText } from './download'
import { bytes, count, isEmail, usd, usdK } from './format'
import { first, optionsOf } from './select'
import { createUndo } from './undo'

describe('shared example formatting (H3)', () => {
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

describe('shared CSV quoting (H4)', () => {
  it('quotes every cell and doubles inner quotes', () => {
    expect(
      csvText([
        ['Name', 'Note'],
        ['Acme, Inc', 'Said "yes"'],
        ['Globex', 42],
      ]),
    ).toBe('"Name","Note"\r\n"Acme, Inc","Said ""yes"""\r\n"Globex","42"')
  })
})

describe('select plumbing (H5)', () => {
  it('mirrors values into options and unwraps with a fallback', () => {
    expect(optionsOf(['Name', 'Size'])).toEqual([
      { label: 'Name', value: 'Name' },
      { label: 'Size', value: 'Size' },
    ])
    expect(first(['Size'], 'Name')).toBe('Size')
    expect(first([], 'Name')).toBe('Name')
  })
})

describe('one-step undo (H2)', () => {
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
