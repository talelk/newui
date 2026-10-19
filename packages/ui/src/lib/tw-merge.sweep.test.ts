import { describe, expect, it } from 'vitest'
import { allPairs, ours, reference } from './tw-merge.harness'

/**
 * The quadratic closure of the merge equivalence: every ordered pair of every
 * utility the source emits, ours against the extended default.
 *
 * This is the expensive sibling of `tw-merge.test.ts` — hundreds of thousands
 * of comparisons. It belongs to CI and to `pnpm verify:affected` (which runs it
 * exactly when `tw-merge.config.ts`, the tokens, or this sweep's own harness
 * changes); the per-family golden pairs there catch the same class of bug a
 * second earlier for ordinary work. Run it directly with `pnpm test:sweep`.
 */
describe('tw-merge equivalence with the default (all-pairs sweep)', () => {
  it(`agrees on every pair (${allPairs.length} cases)`, async () => {
    const mismatches: string[] = []
    let batch = 0
    for (const [first, second] of allPairs) {
      const expected = reference(first, second)
      const actual = ours(first, second)
      if (expected !== actual) {
        mismatches.push(
          `${first} + ${second}\n  default: ${expected}\n  ours:    ${actual}`,
        )
      }
      // Yield periodically so a long sweep stays interruptible (the same
      // result, friendlier to `--reporter=slowTests` timing).
      if (++batch % 20_000 === 0) await Promise.resolve()
    }
    expect(mismatches.slice(0, 10).join('\n')).toBe('')
    expect(mismatches.length).toBe(0)
  }, 180_000)
})
