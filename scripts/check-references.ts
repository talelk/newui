import { existsSync, globSync, readFileSync } from 'node:fs'
import path from 'node:path'

/**
 * Reference checkout paths must exist.
 *
 * The reference trees (`references/frappe-ui-main`, `references/solid-ui-main`,
 * `references/zag-main`) get moved during the project's life — AGENTS.md was
 * updated and subagents were not. A prompt or spec pointing at a path that no
 * longer exists costs failed reads and mis-targeted subagents, and nothing in
 * the codebase fails because of it. This does the opposite: every `references/…`
 * path *mentioned* in the docs must exist on disk.
 *
 * Fast (plain fs) and deterministic, so it runs unconditionally in the gate
 * table.
 */

const root = process.cwd()

/** Files that legitimately mention reference paths. */
const DOC_GLOBS = [
  'AGENTS.md',
  'README.md',
  'spec/**/*.md',
  'packages/*/README.md',
]

// `references/foo` up to whitespace/backtick/quote/paren; trailing punctuation
// trimmed below. The bare `references/` (the directory itself) is allowed.
const REF_RE = /references\/[A-Za-z0-9._/-]+/g

const missing: string[] = []
for (const pattern of DOC_GLOBS) {
  for (const file of globSync(pattern, { cwd: root })) {
    const text = readFileSync(path.join(root, file), 'utf8')
    for (const match of text.matchAll(REF_RE)) {
      const rel = match[0].replace(/[.,;:)'"`]+$/, '')
      if (!existsSync(path.join(root, rel))) {
        missing.push(`${file}: ${rel}`)
      }
    }
  }
}

if (missing.length) {
  console.error('Stale reference paths (moved or deleted; fix the mention):')
  for (const entry of [...new Set(missing)].sort())
    console.error(`  - ${entry}`)
  process.exit(1)
}

console.warn('references: all mentioned paths exist')
