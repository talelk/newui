import { describe, expect, it } from 'vitest'
import { createMediaQuery, screenDown, screens, screenUp } from './index'

describe('media (via the /internal barrel)', () => {
  it('exports the screen helpers from lib/index', () => {
    expect(screenUp('sm')).toBe('(min-width: 640px)')
    expect(screenUp('lg')).toBe('(min-width: 1024px)')
  })

  it('screenDown is the max-width complement of screenUp', () => {
    // Sidebar's collapse query: below `sm`.
    expect(screenDown('sm')).toBe('(max-width: 639px)')
    for (const name of Object.keys(screens) as (keyof typeof screens)[]) {
      expect(screenDown(name)).toBe(`(max-width: ${screens[name] - 1}px)`)
    }
  })

  it('createMediaQuery is exported alongside the screen helpers', () => {
    expect(typeof createMediaQuery).toBe('function')
  })
})
