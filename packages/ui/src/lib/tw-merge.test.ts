import { describe, expect, it } from 'vitest'
import {
  families,
  familyOf,
  goldenPairs,
  ours,
  reference,
} from './tw-merge.harness'

/**
 * Fast equivalence harness — the one `pnpm test` runs (see
 * `tw-merge.harness.ts` for the shared setup and `tw-merge.sweep.test.ts`
 * for the quadratic all-pairs sweep that this file replaces on every change).
 *
 * Two directions are pinned cheaply and every family that the source actually
 * emits is covered by at least one golden pair, so a missing group or a wrong
 * conflict edge fails here instead of a class silently failing to override at
 * runtime. The sweep remains the full closure for CI.
 */

describe('equivalence families', () => {
  it('finds a broad set of families in the source vocabulary', () => {
    // Real usage spans dozens of prefixes; anything this low means the token
    // harvest itself broke (the scan, not the merge).
    expect(families.size).toBeGreaterThan(20)
  })

  it(`agrees with the default per family (${goldenPairs.length / 2} pairs, both directions)`, () => {
    const mismatches: string[] = []
    for (const [first, second] of goldenPairs) {
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
  })

  it('classifies every harvested token into a family', () => {
    for (const members of families.values()) {
      for (const token of members ?? []) {
        expect(familyOf(token), token).toBeDefined()
      }
    }
  })
})

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
