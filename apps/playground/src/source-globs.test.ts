import { globSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Vite 8's dependency scan matches files on the literal substring
 * `import.meta.glob` — comments included — and rewrites everything it matches
 * with `moduleType: js`. A `.tsx` file so marked is parsed with the JSX
 * transform switched off, crashing the scan ("Unexpected JSX expression — JSX
 * syntax is disabled"). When the scan dies, nothing is pre-bundled and every
 * cold dev load pays for unbundled imports.
 *
 * So `.tsx` files must not even *mention* the call: globs live in `.ts`
 * modules (`lib/component-sources.ts`, `lib/story-sources.ts`,
 * `lib/package-guide-sources.ts`,
 * `lib/specs.ts`, `lib/application-sources.ts`) and `.tsx` files import them.
 * This test is the guard from the other side.
 */

// Test runs resolve `process.cwd()` to the repo root (same assumption as
// routes.test.ts, which reads `apps/playground/src/routes.tsx` the same way).
const SRC = 'apps/playground/src'

describe('source globs', () => {
  it('keeps the glob call out of .tsx files — even in comments', () => {
    const offenders: string[] = []
    for (const file of globSync(path.join(SRC, '**/*.tsx'))) {
      // The substring rule is what Vite's handler keys on, not the syntax:
      // the check stays exact, comments and all, so it cannot be fooled by
      // the very prose that explains it.
      if (readFileSync(file, 'utf8').includes('import.meta.glob'))
        offenders.push(path.relative(process.cwd(), file))
    }
    expect(offenders).toEqual([])
  })
})
