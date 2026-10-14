import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Guards the generated `@theme` vocabulary.
 *
 * Components reference utilities like `bg-surface-elevation-1` and
 * `bg-black-overlay-200`. If a token stops being emitted — a renamed generator
 * branch, a dropped color family — the utility silently compiles to nothing
 * and the component renders transparent. That is a class of bug no component
 * test catches, so assert the tokens exist in the generated CSS directly.
 */
const themeCss = readFileSync(
  path.join(process.cwd(), 'packages/tailwind/src/generated/theme.css'),
  'utf8',
)

const REQUIRED_TOKENS = [
  // semantic surfaces used by overlays and shells
  '--color-surface-base',
  '--color-surface-elevation-1',
  '--color-surface-gray-10',
  // ink / outline families
  '--color-ink-base',
  '--color-outline-gray-2',
  // overlay ramps (translucent black/white)
  '--color-black-overlay-200',
  '--color-black-overlay-700',
  '--color-white-overlay-500',
  // radius, type, elevation
  '--radius-4',
  '--text-base',
  '--text-base-medium',
  '--shadow-base',
  // chart series
  '--color-chart-1',
  '--color-chart-grid',
]

describe('generated theme vocabulary', () => {
  it('emits every token components depend on', () => {
    const missing = REQUIRED_TOKENS.filter((token) => !themeCss.includes(token))
    expect(missing).toEqual([])
  })
})
