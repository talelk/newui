import { semanticColors } from '@newui/tokens'
import { wcagLuminance } from 'culori'
import { describe, expect, it } from 'vitest'

/**
 * The contrast contract.
 *
 * Every foreground/background pairing the components ship is asserted against
 * WCAG AA in both themes. This is objective UX: a pairing that fails is a
 * legibility bug, not a taste question.
 *
 * The pairs mirror the recipes (Button, Badge, Alert, labels, links). Disabled
 * text is deliberately absent — WCAG exempts inactive controls from contrast.
 */
type Mode = 'light' | 'dark'

const AA = 4.5

function resolve(mode: Mode, token: string): string {
  const [category = '', ...rest] = token.split('-')
  const layer = semanticColors[mode] as unknown as Record<
    string,
    Record<string, string>
  >
  const value = layer[category]?.[rest.join('-')]
  if (!value) throw new Error(`unknown token: ${token}`)
  return value
}

function contrast(fg: string, bg: string): number {
  const a = wcagLuminance(fg)
  const b = wcagLuminance(bg)
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

const THEMES = ['gray', 'blue', 'green', 'amber', 'red', 'violet'] as const

interface Pair {
  fg: string
  bg: string
  what: string
}

const PAIRS: Pair[] = [
  // body copy and labels
  { fg: 'ink-gray-8', bg: 'surface-base', what: 'body text' },
  { fg: 'ink-gray-6', bg: 'surface-base', what: 'label on base' },
  { fg: 'ink-gray-6', bg: 'surface-gray-2', what: 'muted on gray-2' },
  {
    fg: 'ink-gray-6',
    bg: 'surface-elevation-2',
    what: 'muted on a popover/menu surface',
  },

  // subtle / outline / ghost text — ink-{theme}-8 on the pale surface
  ...THEMES.map((theme) => ({
    fg: `ink-${theme}-8`,
    bg: `surface-${theme}-2`,
    what: `${theme} subtle`,
  })),
  ...THEMES.map((theme) => ({
    fg: `ink-${theme}-8`,
    bg: 'surface-base',
    what: `${theme} outline/ghost`,
  })),

  // solid fills — ink-base on the saturated surface (amber needs the deepest)
  ...THEMES.map((theme) => ({
    fg: 'ink-base',
    bg:
      theme === 'gray'
        ? 'surface-gray-10'
        : theme === 'amber'
          ? 'surface-amber-9'
          : `surface-${theme}-8`,
    what: `${theme} solid`,
  })),
]

describe('contrast contract (WCAG AA)', () => {
  for (const mode of ['light', 'dark'] as Mode[]) {
    for (const pair of PAIRS) {
      it(`${mode}: ${pair.what} ≥ ${AA}`, () => {
        const ratio = contrast(resolve(mode, pair.fg), resolve(mode, pair.bg))
        expect(
          Number(ratio.toFixed(2)),
          `${pair.fg} on ${pair.bg} = ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(AA)
      })
    }
  }
})
