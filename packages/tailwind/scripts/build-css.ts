/**
 * Generates the two machine-derived stylesheets consumed by `style.css`:
 *
 *   src/generated/tokens.css  — runtime custom properties (`:root` + dark)
 *   src/generated/theme.css   — the Tailwind v4 `@theme` block
 *
 * Everything here reads from `@newui/tokens`, so the utility vocabulary is a
 * pure function of the token data. Nothing about colors, radius, type, spacing
 * or elevation is hand-listed anywhere.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  colors,
  cssVariables,
  fontSize,
  fontWeight,
  radius,
  semanticColors,
  shadows,
  spacing,
  tracking,
} from '@newui/tokens'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, '../src/generated')
mkdirSync(outDir, { recursive: true })

const WEIGHTS = ['medium', 'semibold', 'bold'] as const
const lines: string[] = []

const decl = (name: string, value: string) => lines.push(`  ${name}: ${value};`)
const comment = (text: string) => lines.push(`\n  /* ${text} */`)

// ---------------------------------------------------------------------------
// @theme inline
// ---------------------------------------------------------------------------
lines.push('@theme inline {')

comment('semantic colors — utilities emit the runtime var, so dark mode flips')
for (const [category, entries] of Object.entries(semanticColors.light)) {
  for (const name of Object.keys(entries)) {
    decl(`--color-${category}-${name}`, `var(--${category}-${name})`)
  }
}

comment(
  'primitive ramps — addressable directly (bg-gray-500, bg-dark-gray-500)',
)
for (const [family, shades] of Object.entries(colors.light)) {
  for (const shade of Object.keys(shades)) {
    decl(`--color-${family}-${shade}`, `var(--${family}-${shade})`)
  }
}
for (const [family, shades] of Object.entries(colors.dark)) {
  for (const shade of Object.keys(shades)) {
    decl(`--color-dark-${family}-${shade}`, `var(--dark-${family}-${shade})`)
  }
}

comment(
  'overlay ramps — translucent black/white (bg-black-overlay-200), static',
)
for (const [name, shades] of Object.entries(colors.overlay)) {
  if (typeof shades !== 'object') continue
  for (const [shade, value] of Object.entries(shades)) {
    decl(`--color-${name}-overlay-${shade}`, value)
  }
}

comment(
  'chart series — categorical, dark-aware through the runtime --chart-* vars',
)
for (let index = 1; index <= 8; index += 1) {
  decl(`--color-chart-${index}`, `var(--chart-${index})`)
}
decl('--color-chart-grid', 'var(--outline-gray-1)')
decl('--color-chart-axis', 'var(--outline-gray-3)')

comment('radius (static — never flips by theme)')
for (const [key, value] of Object.entries(radius)) {
  decl(`--radius-${key}`, value)
}

comment('spacing scale — every half step and integer 1..128')
for (const [key, value] of Object.entries(spacing)) {
  decl(`--spacing-${key}`, value)
}

comment('elevation — shadow-<step> resolves the runtime elevation var')
for (const [key] of Object.entries(shadows)) {
  if (key === 'none') continue
  if (key === 'DEFAULT') decl('--shadow', 'var(--elevation-base)')
  else decl(`--shadow-${key}`, `var(--elevation-${key})`)
}

comment('typography — text-<size> and text-<size>-<weight>, text + paragraph')
for (const [key, style] of Object.entries(fontSize)) {
  decl(`--text-${key}`, style.fontSize)
  decl(`--text-${key}--line-height`, style.lineHeight)
  decl(`--text-${key}--letter-spacing`, style.letterSpacing)
  decl(`--text-${key}--font-weight`, String(style.fontWeight))

  const isParagraph = key.startsWith('p-')
  const group = isParagraph ? 'paragraph' : 'text'
  const size = isParagraph ? key.slice(2) : key
  const byWeight = tracking[group]?.[size]
  if (!byWeight) continue

  for (const weight of WEIGHTS) {
    const letterSpacing = byWeight[weight]
    if (letterSpacing === undefined) continue
    decl(`--text-${key}-${weight}`, style.fontSize)
    decl(`--text-${key}-${weight}--line-height`, style.lineHeight)
    decl(`--text-${key}-${weight}--letter-spacing`, letterSpacing)
    decl(`--text-${key}-${weight}--font-weight`, String(fontWeight[weight]))
  }
}

comment('fonts')
decl('--font-sans', "'InterVar', ui-sans-serif, system-ui, sans-serif")

comment('line-heights — leading-tighter pins single-line chrome to 1.15')
decl('--leading-tighter', '1.15')

lines.push('}')
lines.push('')

writeFileSync(resolve(outDir, 'theme.css'), lines.join('\n'))

// ---------------------------------------------------------------------------
// runtime tokens (delegated to @newui/tokens)
// ---------------------------------------------------------------------------
const { tokensCss } = await import('@newui/tokens/css')
writeFileSync(resolve(outDir, 'tokens.css'), tokensCss())

// A tiny summary to confirm what was generated.
console.warn(
  `[newui] theme.css + tokens.css generated (${
    Object.keys(cssVariables.light).length
  } runtime vars)`,
)
