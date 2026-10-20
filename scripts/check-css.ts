/**
 * Every utility a component references must exist in the built stylesheet.
 *
 * This is the general form of the "transparent dialog" bug (`bg-surface-modal`
 * compiled to nothing) and of a class that never reaches the output for any
 * other reason: a typo, a utility the scanner cannot see, or a `@source`
 * exclusion that went too far. A class-name assertion cannot catch it; the
 * emitted CSS can.
 *
 * Run after `pnpm build:playground`. Tokens are filtered to utilities with a
 * prefix the merge config knows, so prose and attribute values are ignored.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { twMergeConfig } from '../packages/ui/src/lib/tw-merge.config'

const REPO = process.cwd()
const UI_SRC = path.join(REPO, 'packages/ui/src')
const BLOCKS_SRC = path.join(REPO, 'packages/blocks/src')
const LAYOUTS_SRC = path.join(REPO, 'packages/layouts/src')
const DATA_SRC = path.join(REPO, 'packages/data/src')
const APP_SRC = path.join(REPO, 'apps/playground/src')
const DIST = path.join(REPO, 'apps/playground/dist')

const cssFiles = (() => {
  const assets = path.join(DIST, 'assets')
  const found = statSync(assets, { throwIfNoEntry: false })
    ? readdirSync(assets).filter((file) => file.endsWith('.css'))
    : []
  return [
    ...found.map((file) => path.join(assets, file)),
    // The playground inlines its CSS into index.html.
    path.join(DIST, 'index.html'),
  ].filter((file) => statSync(file, { throwIfNoEntry: false }))
})()

if (cssFiles.length === 0) {
  console.error(
    '[css:check] no build found. Run `pnpm build:playground` first.',
  )
  process.exit(1)
}

const css = cssFiles.map((file) => readFileSync(file, 'utf8')).join('\n')

// --- is this token a real utility, per the merge config? ---
// Mirrors tailwind-merge's resolution: an exact literal, or a known prefix whose
// validator accepts the remainder. This is what separates `bottom-0` (a class)
// from `bottom-end` (a placement value).
//
// A validator is either a predicate or a bare string, and both forms are in the
// config: `{ tracking: ['wide', 'tight'] }` comes straight from the stock
// configuration, where tailwind-merge turns each string into an exact-value
// match. Reading only the function form made this script throw on a valid
// config (`validator is not a function`), which is the sort of thing a checker
// should not do.
type Validator = ((value: string) => boolean) | string

function accepts(validator: Validator, value: string): boolean {
  return typeof validator === 'string' ? validator === value : validator(value)
}

function isUtility(token: string): boolean {
  for (const group of Object.values(twMergeConfig.classGroups)) {
    for (const entry of group as readonly unknown[]) {
      if (typeof entry === 'string') {
        if (entry === token) return true
        continue
      }
      if (!entry || typeof entry !== 'object') continue
      for (const [key, validators] of Object.entries(
        entry as Record<string, Validator[]>,
      )) {
        if (!token.startsWith(`${key}-`)) continue
        const value = token.slice(key.length + 1)
        if (validators.some((validator) => accepts(validator, value)))
          return true
      }
    }
  }
  return false
}

/**
 * Every `lucide-*` class the app writes, checked against the emitted sheet.
 *
 * The icon utilities are generated from `lucide-static` by scanning the source,
 * so a name that does not exist — `lucide-github`, which lucide dropped along
 * with its other brand glyphs — produces no rule at all and the icon renders as
 * nothing. Silently: the element is there, the class is there, the glyph is not.
 * This has shipped twice.
 */
function missingIcons(): string[] {
  const used = new Map<string, string>()
  // Comments are stripped first: a comment explaining *why* an icon was
  // replaced tends to name the icon that was removed, and that is not a usage.
  const withoutComments = (source: string) =>
    source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')

  for (const file of walk(APP_SRC)) {
    const source = withoutComments(readFileSync(file, 'utf8'))
    for (const match of source.matchAll(/lucide-[a-z0-9-]+/g)) {
      used.set(match[0], path.relative(REPO, file))
    }
  }
  return [...used]
    .filter(([name]) => !css.includes(`.${name}`))
    .map(([name, file]) => `${name} (in ${file})`)
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry))
      out.push(full)
  }
  return out
}

/** CSS escapes every character that is not valid in a selector identifier. */
function escapeClass(token: string): string {
  return token.replace(/[./[\]()%#!:,&*+>~'"]/g, (char) => `\\${char}`)
}

const TOKEN_RE = /^[a-z][a-z0-9./-]*$/
const missing = new Map<string, string>()

// Every package that ships class names: the components, the blocks and layouts
// composed from them, and the data layer's promoted surfaces. Their classes are
// scanned by `style.css`'s `@source`, so a missing rule there is a real defect —
// the component renders unstyled.
for (const file of [
  ...walk(UI_SRC),
  ...walk(BLOCKS_SRC),
  ...walk(LAYOUTS_SRC),
  ...walk(DATA_SRC),
]) {
  // Not component markup: the config is vocabulary, and its own literals are
  // excluded from the Tailwind scan by `@source not`.
  if (
    file.endsWith('tw-merge.config.ts') ||
    file.endsWith('tw-merge.harness.ts')
  )
    continue

  const source = readFileSync(file, 'utf8')
  for (const match of source.matchAll(/(.{0,24})['"`]([^'"`\n]*)['"`]/g)) {
    if (/(?:data|aria)-[a-z-]+=$/.test(match[1] ?? '')) continue
    for (const raw of (match[2] ?? '').split(/\s+/)) {
      const token = raw.replace(/^!/, '')
      // Base utilities only: variants are emitted as separate rules with their
      // own selectors, which this simple containment check cannot match.
      if (token.includes(':')) continue
      if (!TOKEN_RE.test(token)) continue
      if (!isUtility(token)) continue
      if (!css.includes(`.${escapeClass(token)}`)) {
        missing.set(token, path.relative(REPO, file))
      }
    }
  }
}

if (missing.size > 0) {
  console.error(
    `\n[css:check] ${missing.size} class(es) referenced but not emitted:\n`,
  )
  for (const [token, file] of [...missing].slice(0, 30)) {
    console.error(`  ${token}  (${file})`)
  }
  process.exit(1)
}

const gone = missingIcons()
if (gone.length > 0) {
  console.error(
    `\n[css:check] ${gone.length} icon class(es) do not exist and would render as nothing:\n`,
  )
  for (const entry of gone) console.error(`  ${entry}`)
  process.exit(1)
}

console.warn('[css:check] every referenced utility and icon is emitted.')
