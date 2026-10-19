import { describe, expect, it } from 'vitest'
import { groupEntries, matchesEntry } from './catalog'

const entries = [
  { name: 'Button', group: 'Actions', parts: ['Button'] },
  { name: 'Dialog', group: 'Overlays', parts: ['Root', 'Trigger'] },
  { name: 'Badge', group: 'Display', parts: ['Badge'] },
  { name: 'Alert', group: 'Display', parts: ['Alert'] },
]

describe('catalog grouping (H11)', () => {
  it('keeps first-seen group order without an explicit list', () => {
    expect(groupEntries(entries).map((section) => section.group)).toEqual([
      'Actions',
      'Overlays',
      'Display',
    ])
  })

  it('follows the given group order and drops empty groups', () => {
    const grouped = groupEntries(entries, ['Display', 'Inputs', 'Actions'])
    expect(grouped.map((section) => section.group)).toEqual([
      'Display',
      'Actions',
    ])
    expect(grouped[0]?.entries.map((entry) => entry.name)).toEqual([
      'Badge',
      'Alert',
    ])
  })

  it('matches on name, group and part names, case-insensitively', () => {
    const dialog = entries[1]
    if (!dialog) throw new Error('Missing fixture')
    expect(matchesEntry(dialog, '')).toBe(true)
    expect(matchesEntry(dialog, '  ')).toBe(true)
    expect(matchesEntry(dialog, 'DIA')).toBe(true)
    expect(matchesEntry(dialog, 'overlays')).toBe(true)
    expect(matchesEntry(dialog, 'trigger')).toBe(true)
    expect(matchesEntry(dialog, 'button')).toBe(false)
  })
})
