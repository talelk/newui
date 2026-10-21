import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  colors,
  duration,
  easing,
  fontSize,
  radius,
  semanticColors,
  shadows,
  spacing,
  tracking,
  zIndex,
} from '@newui/tokens'
import { describe, expect, it } from 'vitest'

/**
 * Generator parity: `@newui/tokens` data ↔ generated `@theme`.
 *
 * `scripts/build-css.ts` derives `theme.css` from the token data, so the
 * expected vocabulary is derived here the same way instead of hand-listed.
 * A renamed generator branch or a dropped token family then fails here
 * instead of silently compiling a component's utility to nothing.
 *
 * This is the data→CSS direction only. The reverse direction (every token a
 * component *references* exists) is `tokens.test.ts`; nothing is asserted
 * twice.
 */
const themeCss = readFileSync(
  path.join(process.cwd(), 'packages/tailwind/src/generated/theme.css'),
  'utf8',
)

// Every custom property theme.css declares (`--spacing-0.5` needs the dot).
const defined = new Set<string>(
  [...themeCss.matchAll(/^\s*(--[a-z0-9.-]+):/gm)].flatMap((m) =>
    m[1] ? [m[1]] : [],
  ),
)

// Mirrors build-css.ts: semantic categories, primitive + dark ramps, overlay
// ramps, then the hand-added chart series (build-css.ts chart branch).
function expectedColors(): Set<string> {
  const names = new Set<string>()
  for (const [category, entries] of Object.entries(semanticColors.light)) {
    for (const name of Object.keys(entries)) {
      names.add(`--color-${category}-${name}`)
    }
  }
  for (const [family, shades] of Object.entries(colors.light)) {
    for (const shade of Object.keys(shades)) {
      names.add(`--color-${family}-${shade}`)
    }
  }
  for (const [family, shades] of Object.entries(colors.dark)) {
    for (const shade of Object.keys(shades)) {
      names.add(`--color-dark-${family}-${shade}`)
    }
  }
  for (const [name, shades] of Object.entries(colors.overlay)) {
    if (typeof shades !== 'object') continue
    for (const shade of Object.keys(shades)) {
      names.add(`--color-${name}-overlay-${shade}`)
    }
  }
  for (let index = 1; index <= 8; index += 1) {
    names.add(`--color-chart-${index}`)
  }
  names.add('--color-chart-grid')
  names.add('--color-chart-axis')
  return names
}

function expectedShadows(): Set<string> {
  const names = new Set<string>()
  for (const key of Object.keys(shadows)) {
    if (key === 'none') continue
    names.add(key === 'DEFAULT' ? '--shadow' : `--shadow-${key}`)
  }
  return names
}

const WEIGHTS = ['medium', 'semibold', 'bold'] as const

// `--text-<size>` always; `--text-<size>-<weight>` only where the tracking
// table has an entry for that size+weight (build-css.ts typography branch).
function expectedText(): Set<string> {
  const names = new Set<string>()
  for (const key of Object.keys(fontSize)) {
    names.add(`--text-${key}`)
    const isParagraph = key.startsWith('p-')
    const group = isParagraph ? 'paragraph' : 'text'
    const size = isParagraph ? key.slice(2) : key
    const byWeight = tracking[group]?.[size]
    if (!byWeight) continue
    for (const weight of WEIGHTS) {
      if (byWeight[weight] !== undefined) names.add(`--text-${key}-${weight}`)
    }
  }
  return names
}

describe('generated theme parity with @newui/tokens', () => {
  it('emits every derived --color-* token', () => {
    const missing = [...expectedColors()].filter((name) => !defined.has(name))
    expect(missing).toEqual([])
  })

  it('defines no --color-* token the data does not derive', () => {
    const expected = expectedColors()
    const extra = [...defined].filter(
      (name) => name.startsWith('--color-') && !expected.has(name),
    )
    expect(extra).toEqual([])
  })

  it('emits every radius, spacing and shadow token', () => {
    const expected = [
      ...Object.keys(radius).map((key) => `--radius-${key}`),
      ...Object.keys(spacing).map((key) => `--spacing-${key}`),
      ...expectedShadows(),
    ]
    const missing = expected.filter((name) => !defined.has(name))
    expect(missing).toEqual([])
  })

  it('emits every derived text-size token', () => {
    const missing = [...expectedText()].filter((name) => !defined.has(name))
    expect(missing).toEqual([])
  })

  it('emits the stacking and motion scales', () => {
    const expected = [
      ...Object.keys(zIndex).map((key) => `--z-${key}`),
      ...Object.keys(duration).map((key) => `--duration-${key}`),
      ...Object.keys(easing).map((key) => `--ease-${key}`),
    ]
    const missing = expected.filter((name) => !defined.has(name))
    expect(missing).toEqual([])
  })
})
