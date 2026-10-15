import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { extendTailwindMerge } from 'tailwind-merge'
import { describe, expect, it } from 'vitest'
import { twMerge as ours } from './tw-merge'
import { twMergeConfig } from './tw-merge.config'

/**
 * Equivalence harness for the pruned merge config.
 *
 * The config is only trustworthy if it behaves like the default for the
 * utilities this repo emits. So: collect every class token from the source,
 * group them into families using the config's own validators, and compare
 * `ours` against the reference for **every ordered pair**. A missing group or a
 * wrong conflict edge fails here instead of a class silently failing to
 * override at runtime.
 *
 * The reference is the *extended* default, not the stock one: this library
 * extends Tailwind's vocabulary (`text-<size>-<weight>`, numeric `rounded-<n>`,
 * named `shadow-<step>`), and the stock config would mis-classify all three.
 */
const REPO = process.cwd()
const SOURCES = [
  path.join(REPO, 'packages/ui/src'),
  path.join(REPO, 'apps/playground/src'),
]

const isTextSize = (value: string) =>
  /^(p-)?(interface|caption|heading|section|metric|hero|2xs|xs|sm|base|md|lg|xl|[0-9]{1,2}xl)(-(medium|semibold|bold))?$/.test(
    value,
  )
const isOurRadius = (value: string) => /^(\d|full|none)$/.test(value)
const isOurShadow = (value: string) =>
  ['', 'base', 'sm', 'md', 'lg', 'xl', '2xl', 'none'].includes(value)
const isOurLeading = (value: string) =>
  /^(none|tighter|tight|snug|normal|relaxed|loose|\d+)$/.test(value)

const reference = extendTailwindMerge({
  extend: {
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

function familyOf(token: string): string | undefined {
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
    // The config and its wrapper contain the whole vocabulary as strings; they
    // are not usage.
    if (file.endsWith('tw-merge.config.ts') || file.endsWith('tw-merge.ts')) {
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

// Every ordered pair, not just pairs sharing a prefix: `p-2` vs `px-4` are
// different prefixes and *must not* conflict, while `p-2` vs `p-4` must. Only an
// all-pairs sweep catches both directions.
const all = [...tokens]
const cases: [string, string][] = []
for (const first of all) {
  for (const second of all) {
    if (first !== second) cases.push([first, second])
  }
}

describe('axis independence (the invariant the bug violated)', () => {
  // Each case is a pair of utilities that live on *different* CSS properties and
  // must therefore both survive. A merge config that lumps an axis family into
  // one class group silently deletes one of them — this is the padding/margin
  // bug, written down as a rule.
  const MUST_BOTH_SURVIVE: [string, string][] = [
    ['p-2', 'px-4'],
    ['p-2', 'py-4'],
    ['p-2', 'pt-4'],
    ['px-4', 'py-2'],
    ['m-1', 'my-2'],
    ['m-1', 'ms-2'],
    ['mx-2', 'my-1'],
    ['gap-2', 'gap-x-4'],
    ['inset-0', 'top-2'],
    ['border-2', 'border-t-transparent'],
    ['border-2', 'border-outline-gray-2'],
    ['rounded-4', 'rounded-t-lg'],
    ['size-4', 'w-8'],
    ['h-8', 'w-4'],
    ['flex-1', 'items-center'],
    ['translate-x-2', 'translate-y-1'],
    ['scale-x-50', 'scale-y-75'],
    ['from-blue-500', 'to-red-500'],
    ['text-base-medium', 'text-ink-gray-8'],
    ['bg-surface-gray-2', 'text-ink-gray-8'],
  ]

  for (const [first, second] of MUST_BOTH_SURVIVE) {
    it(`keeps ${first} and ${second}`, () => {
      const merged = ours(first, second)
      expect(merged).toContain(first)
      expect(merged).toContain(second)
    })
  }

  it('still drops a same-axis override', () => {
    expect(ours('p-2', 'p-4')).toBe('p-4')
    expect(ours('px-2', 'px-4')).toBe('px-4')
    expect(ours('bg-surface-gray-2', 'bg-surface-red-2')).toBe(
      'bg-surface-red-2',
    )
  })
})

describe('tw-merge equivalence with the default', () => {
  it('finds a broad set of utilities to compare', () => {
    expect(cases.length).toBeGreaterThan(1000)
  })

  it(`agrees on every pair (${cases.length} cases)`, () => {
    const mismatches: string[] = []
    for (const [first, second] of cases) {
      const expected = reference(first, second)
      const actual = ours(first, second)
      if (expected !== actual) {
        mismatches.push(
          `${first} + ${second}\n  default: ${expected}\n  ours:    ${actual}`,
        )
      }
    }
    expect(mismatches.slice(0, 10).join('\n')).toBe('')
    expect(mismatches.length).toBe(0)
  }, 60_000)
})
