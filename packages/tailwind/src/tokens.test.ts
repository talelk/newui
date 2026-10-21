import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { layoutSpacing, radiusRoles } from '@newui/tokens'
import { describe, expect, it } from 'vitest'

/**
 * Token discipline.
 *
 * Two failure modes this catches, both of which have shipped here before:
 *
 *  1. A component referencing a semantic token that does not exist
 *     (`bg-surface-modal`) — the utility silently compiles to nothing and the
 *     element renders transparent.
 *  2. A component reaching for a raw Tailwind palette colour
 *     (`bg-red-500`) instead of the semantic vocabulary (P: semantic tokens
 *     only). Brand customization and dark mode both depend on this.
 */
const REPO = process.cwd()
const VISUAL_SRCS = [
  'atoms',
  'molecules',
  'organisms',
  'templates',
  'charts',
  'editor',
  'code-editor',
].map((pkg) => path.join(REPO, `packages/${pkg}/src`))
const THEME_CSS = path.join(REPO, 'packages/tailwind/src/generated/theme.css')

const themeCss = readFileSync(THEME_CSS, 'utf8')
const definedColors = new Set(
  [...themeCss.matchAll(/--color-([a-z0-9-]+):/g)].map((m) => m[1]),
)

const TOKENS_CSS = path.join(REPO, 'packages/tailwind/src/generated/tokens.css')
const tokensCss = readFileSync(TOKENS_CSS, 'utf8')

/**
 * Every custom property tokens.css *declares* — both sides of the `name: value`.
 * A pointer at an undeclared property is the chart-palette bug: `--chart-1:
 * var(--blue-6)` named a shade that does not exist, so the property was
 * guaranteed-invalid, every `var(--chart-1)` fell back to `transparent`, and
 * charts and the palette swatches rendered invisible with no error anywhere.
 */
const declaredVars = new Set(
  [...tokensCss.matchAll(/^\s*(--[a-z0-9-]+):/gm)].map((m) => m[1]),
)

const SEMANTIC_PREFIX = '(?:surface|ink|outline|black-overlay|white-overlay)'
const COLOR_UTILITIES =
  '(?:bg|text|border|outline|fill|stroke|divide|ring|decoration|placeholder|caret|accent|from|via|to|shadow)'

// A raw palette ramp, e.g. `bg-red-500`, `text-gray-700`. Semantic uses are
// always prefixed (`bg-surface-red-2`), so a bare family+shade is the smell.
const PALETTE_FAMILIES =
  '(?:gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)'
const RAW_PALETTE = new RegExp(
  `${COLOR_UTILITIES}-${PALETTE_FAMILIES}-\\d{2,3}\\b`,
  'g',
)

// Colours with no semantic equivalent that are legitimately used raw.
const RAW_ALLOWLIST = new Set(['text-white', 'text-black'])

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry))
      out.push(full)
  }
  return out
}

const files = VISUAL_SRCS.flatMap((dir) => walk(dir))

function scan(regex: RegExp): Map<string, string> {
  const found = new Map<string, string>()
  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    for (const match of source.matchAll(regex)) {
      found.set(match[0], path.relative(REPO, file))
    }
  }
  return found
}

describe('token discipline', () => {
  it('emits the semantic layout spacing and radius roles', () => {
    for (const name of Object.keys(layoutSpacing))
      expect(themeCss).toContain(`--spacing-${name}:`)
    for (const name of Object.keys(radiusRoles))
      expect(themeCss).toContain(`--radius-${name}:`)
  })

  it('only references semantic tokens that exist in the theme', () => {
    const semanticUse = new RegExp(
      `${COLOR_UTILITIES}-(${SEMANTIC_PREFIX}-[a-z0-9-]+)`,
      'g',
    )
    const missing: string[] = []
    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      for (const match of source.matchAll(semanticUse)) {
        const token = match[1]
        if (!definedColors.has(token)) {
          missing.push(
            `${match[0]} → --color-${token} (in ${path.relative(REPO, file)})`,
          )
        }
      }
    }
    expect(missing).toEqual([])
  })

  it('does not use raw Tailwind palette colours', () => {
    const offenders = [...scan(RAW_PALETTE)].filter(
      ([token]) => !RAW_ALLOWLIST.has(token),
    )
    expect(offenders).toEqual([])
  })

  it('does not hard-code colours in class strings', () => {
    // A literal hex/rgb/hsl value cannot follow the theme, so it breaks dark
    // mode and brand customization. Colours come from tokens, always.
    const HARDCODED =
      /(?:bg|text|border|ring|fill|stroke|outline|shadow|from|via|to|decoration|caret|accent)-\[(?:#|rgba?\(|hsla?\()/g
    const offenders = [...scan(HARDCODED)]
    expect(offenders).toEqual([])
  })

  it('every runtime token pointer names a token that is declared', () => {
    // `--x: var(--y)` where `--y` is declared nowhere is worse than a typo: it
    // is silently valid CSS that makes every consumer transparent. Catches the
    // whole class, not just the chart ramp that shipped broken.
    const missing: string[] = []
    for (const match of tokensCss.matchAll(
      /^\s*(--[a-z0-9-]+):\s*var\((--[a-z0-9-]+)\)/gm,
    )) {
      const [, name, target] = match
      if (!declaredVars.has(target)) missing.push(`${name} → ${target}`)
    }
    expect(missing).toEqual([])
  })
})
