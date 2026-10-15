import { describe, expect, it } from 'vitest'
import { initialDeals, placeDeal } from './deals-data'

describe('opportunity placement', () => {
  it('reorders within a stage and preserves the previous snapshot', () => {
    const first = initialDeals[0]
    const second = initialDeals[1]
    if (!first || !second) throw new Error('Missing fixture')
    const rows = [
      { ...first, stage: 'Qualification' as const },
      { ...second, stage: 'Qualification' as const },
    ]
    const after = placeDeal(rows, second.id, 'Qualification', first.id)
    expect(after.map((row) => row.id)).toEqual([second.id, first.id])
    expect(rows.map((row) => row.id)).toEqual([first.id, second.id])
  })
  it('moves across stages without duplicating records or modifying other records', () => {
    const before = initialDeals.map((row) => ({ ...row }))
    const first = before[0]
    if (!first) throw new Error('Missing fixture')
    const after = placeDeal(before, first.id, 'Won')
    expect(after.find((row) => row.id === first.id)?.stage).toBe('Won')
    expect(first.stage).toBe('Qualification')
    expect(new Set(after.map((row) => row.id)).size).toBe(before.length)
    expect(after.filter((row) => row.id !== first.id)).toEqual(before.slice(1))
    expect(placeDeal(before, 'unknown', 'Won')).toBe(before)
  })
})
