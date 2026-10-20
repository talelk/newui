/**
 * One way to do data, forms, tables and lists.
 *
 * `spec/kit.md`'s W3 acceptance is an economic claim: the examples adopt the
 * logic layer and *their local copies are deleted*. A grep is the honest gate
 * for that — a page that quietly re-adds `@tanstack/solid-table`, or a second
 * `DataTable` under `examples/`, is the duplication the phase existed to end.
 *
 * The dependency graph and the bundle budgets catch the cost; this catches the
 * intent.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const SKIP = new Set(['node_modules', 'dist', 'storybook-static', '.git'])
const SOURCE = /\.(ts|tsx)$/
const TEST = /\.(test|spec)\.(ts|tsx)$/
const ADAPTERS = /from '@tanstack\/solid-(query|form|table|virtual)'/
/** Only the package that owns the adapters may name them. */
const OWNER = 'packages/data/src/'

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (SOURCE.test(entry)) out.push(full)
  }
  return out
}

const files = [
  ...walk(path.join(ROOT, 'apps')),
  ...walk(path.join(ROOT, 'packages')),
]
  .map((file) => path.relative(ROOT, file))
  .filter((file) => !TEST.test(file))

describe('the logic layer is the only way in', () => {
  it('no app or other package imports a TanStack adapter directly', () => {
    const offenders = files.filter(
      (file) =>
        !file.startsWith(OWNER) &&
        ADAPTERS.test(readFileSync(path.join(ROOT, file), 'utf8')),
    )
    expect(offenders).toEqual([])
  })

  it('the playground carries no local table, virtual list or form bridge', () => {
    expect(
      existsSync(path.join(ROOT, 'apps/playground/src/examples/DataTable.tsx')),
    ).toBe(false)
    expect(
      existsSync(
        path.join(ROOT, 'apps/playground/src/examples/ScrollTable.tsx'),
      ),
    ).toBe(false)
    const activity = readFileSync(
      path.join(ROOT, 'apps/playground/src/examples/ActivityList.tsx'),
      'utf8',
    )
    expect(activity).toContain("from '@newui/data/virtual'")
    expect(activity).not.toContain('@tanstack/solid-virtual')
  })

  it('the starter composes the same surfaces as the examples', () => {
    const records = readFileSync(
      path.join(ROOT, 'apps/starter/src/pages/Records.tsx'),
      'utf8',
    )
    expect(records).toContain("from '@newui/data/query'")
    expect(records).toContain("from '@newui/data/form'")
    expect(records).toContain("from '@newui/data/table'")
    expect(records).not.toMatch(/import .* from '@tanstack\//)
  })
})
