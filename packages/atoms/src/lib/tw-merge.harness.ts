import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { extendTailwindMerge } from 'tailwind-merge'
import { twMerge } from './tw-merge'
import {
  isLength,
  layoutSpacingNames,
  radiusRoleNames,
  twMergeConfig,
  zLayerNames,
} from './tw-merge.config'

/**
 * Shared equivalence harness for the pruned merge config.
 *
 * The config is only trustworthy if it behaves like the default for the
 * utilities this repo emits. So: collect every class token from the source,
 * group them into families using the config's own validators, and expose the
 * pairs worth checking. The fast, per-family golden check lives in
 * `tw-merge.test.ts` and runs with every `pnpm test`; the full all-pairs sweep
 * that costs hundreds of thousands of comparisons lives in
 * `tw-merge.sweep.test.ts` (`pnpm test:sweep`) and is routed by
 * `scripts/affected.ts` to only run when the merge config, the tokens or the
 * sweep itself change.
 *
 * The reference is the *extended* default, not the stock one: this library
 * extends Tailwind's vocabulary (`text-<size>-<weight>`, numeric `rounded-<n>`,
 * named `shadow-<step>`), and the stock config would mis-classify all three.
 */

export const ours = twMerge

const REPO = process.cwd()
const SOURCES = [
  path.join(REPO, 'packages/atoms/src'),
  path.join(REPO, 'packages/molecules/src'),
  path.join(REPO, 'packages/organisms/src'),
  path.join(REPO, 'packages/templates/src'),
  path.join(REPO, 'apps/playground/src'),
]

const isTextSize = (value: string) =>
  /^(p-)?(interface|caption|heading|section|metric|hero|2xs|xs|sm|base|md|lg|xl|[0-9]{1,2}xl)(-(medium|semibold|bold))?$/.test(
    value,
  )
const isOurRadius = (value: string) =>
  /^(\d|full|none)$/.test(value) || radiusRoleNames.includes(value)
const isOurShadow = (value: string) =>
  ['', 'base', 'sm', 'md', 'lg', 'xl', '2xl', 'none'].includes(value)
const isOurLeading = (value: string) =>
  /^(none|tighter|tight|snug|normal|relaxed|loose|\d+)$/.test(value)
const isOurZ = (value: string) =>
  /^\d+$/.test(value) || zLayerNames.includes(value)
const isOurDuration = (value: string) =>
  isLength(value) || ['fast', 'base', 'slow'].includes(value)

export const reference = extendTailwindMerge({
  extend: {
    theme: { spacing: layoutSpacingNames },
    classGroups: {
      'font-size': [{ text: [isTextSize] }],
      rounded: [{ rounded: [isOurRadius] }],
      // Our numeric radii apply to every corner group (`rounded-t-7`, …), not
      // just `rounded-<n>`. The stock default only knows named radii for the
      // sub-groups, so it would mis-classify a numeric sub-corner and diverge.
      'rounded-s': [{ 'rounded-s': [isOurRadius] }],
      'rounded-e': [{ 'rounded-e': [isOurRadius] }],
      'rounded-t': [{ 'rounded-t': [isOurRadius] }],
      'rounded-r': [{ 'rounded-r': [isOurRadius] }],
      'rounded-b': [{ 'rounded-b': [isOurRadius] }],
      'rounded-l': [{ 'rounded-l': [isOurRadius] }],
      'rounded-ss': [{ 'rounded-ss': [isOurRadius] }],
      'rounded-se': [{ 'rounded-se': [isOurRadius] }],
      'rounded-ee': [{ 'rounded-ee': [isOurRadius] }],
      'rounded-es': [{ 'rounded-es': [isOurRadius] }],
      'rounded-tl': [{ 'rounded-tl': [isOurRadius] }],
      'rounded-tr': [{ 'rounded-tr': [isOurRadius] }],
      'rounded-br': [{ 'rounded-br': [isOurRadius] }],
      'rounded-bl': [{ 'rounded-bl': [isOurRadius] }],
      shadow: [{ shadow: [isOurShadow] }],
      leading: [{ leading: [isOurLeading] }],
      // The stacking scale's named layers sit on the same axis as `z-<n>`.
      z: [{ z: [isOurZ] }],
      duration: [{ duration: [isOurDuration] }],
    },
  },
})

// --- families, derived from the config's own validators ---
const literals = new Set<string>()
const prefixes: string[] = []
for (const group of Object.values(twMergeConfig.classGroups)) {
  for (const entry of group as readonly unknown[]) {
    if (typeof entry === 'string') literals.add(entry)
    else if (entry && typeof entry === 'object') {
      for (const key of Object.keys(entry)) prefixes.push(key)
    }
  }
}
prefixes.sort((a, b) => b.length - a.length)

export function familyOf(token: string): string | undefined {
  if (literals.has(token)) return `literal:${token}`
  for (const prefix of prefixes) {
    if (token === prefix || token.startsWith(`${prefix}-`)) {
      return `prefix:${prefix}`
    }
  }
  return undefined
}

// --- tokens, from the source ---
function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry))
      out.push(full)
  }
  return out
}

const TOKEN_RE = /^[a-z][a-z0-9:._/[\]()%-]*$/
const tokens = new Set<string>()
for (const dir of SOURCES) {
  for (const file of walk(dir)) {
    // The config and its wrapper (and this harness) contain the whole
    // vocabulary as strings/keys; they are not usage.
    if (
      file.endsWith('tw-merge.config.ts') ||
      file.endsWith('tw-merge.ts') ||
      file.endsWith('tw-merge.harness.ts')
    ) {
      continue
    }
    const source = readFileSync(file, 'utf8')
    for (const match of source.matchAll(/(.{0,24})['"`]([^'"`\n]*)['"`]/g)) {
      // Skip attribute values: `data-slot="select-control"` is not a class.
      if (/(?:data|aria)-[a-z-]+=$/.test(match[1] ?? '')) continue
      for (const raw of (match[2] ?? '').split(/\s+/)) {
        // Base utilities only. Variants go through tailwind-merge's own modifier
        // machinery, which this config deliberately does not touch.
        const token = raw.replace(/^.*:/, '').replace(/^!/, '')
        if (TOKEN_RE.test(token) && familyOf(token)) tokens.add(token)
      }
    }
  }
}

/** Family → representative tokens, sorted for stable output. */
export const families = new Map<string, string[]>()
for (const token of [...tokens].sort()) {
  const family = familyOf(token)
  if (!family) continue
  const bucket = families.get(family)
  if (bucket) bucket.push(token)
  else families.set(family, [token])
}

/**
 * Representative ordered pairs for the *fast* per-family golden check: within
 * each family (the override direction) and across neighbouring families
 * (the independence direction). This is what a normal `pnpm test` loop pays
 * for; the sweep above it does the quadratic closure.
 */
export const goldenPairs: [string, string][] = []
for (const members of families.values()) {
  const head = members[0]
  if (!head) continue
  for (const other of members.slice(1, 4)) {
    goldenPairs.push([head, other])
    goldenPairs.push([other, head])
  }
}
const familyHeads = [...families.values()]
  .map((members) => members?.[0])
  .filter((t): t is string => t !== undefined)
  .sort()
for (const [i, first] of familyHeads.entries()) {
  const next = familyHeads[(i + 1) % familyHeads.length]
  if (next && next !== first) {
    goldenPairs.push([first, next])
    goldenPairs.push([next, first])
  }
}

/** Every ordered pair — the quadratic sweep. */
export const allPairs: [string, string][] = (() => {
  const all = [...tokens]
  const cases: [string, string][] = []
  for (const first of all) {
    for (const second of all) {
      if (first !== second) cases.push([first, second])
    }
  }
  return cases
})()
