import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The Three-Radius Rule: 6px control, 8px card, 12px overlay. Tailwind's
 * numeric `rounded-5` is 10px — a fourth surface radius that reads almost,
 * but not quite, like a card. It drifted through both the library and the
 * application examples; use the role (`rounded-card`, `rounded-control`,
 * `rounded-overlay`) instead.
 *
 * The merge tests intentionally use arbitrary utilities to prove the resolver,
 * so test files are excluded. Everything that ships or renders is scanned.
 */
const ROOTS = ['packages', 'apps/playground/src', 'apps/starter/src']
const SOURCE = /\.(?:ts|tsx)$/
const INVENTED = /\brounded-5\b/

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) return filesUnder(file)
    if (!SOURCE.test(entry.name) || entry.name.includes('.test.')) return []
    return [file]
  })
}

describe('radius vocabulary', () => {
  it('uses the 6/8/12 roles, never the 10px rounded-5', () => {
    const offenders = ROOTS.flatMap((root) =>
      filesUnder(path.join(process.cwd(), root))
        .filter((file) => INVENTED.test(readFileSync(file, 'utf8')))
        .map((file) => path.relative(process.cwd(), file)),
    )
    expect(offenders).toEqual([])
  })
})
