/** Atomic-package import and headless-data boundaries, pinned by test. */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const SKIP = new Set(['node_modules', 'dist', 'storybook-static', '.git'])
const SOURCE = /\.(ts|tsx)$/
const TEST = /\.(test|spec)\.(ts|tsx)$/
const ADAPTERS = /from '@tanstack\/solid-(query|form|table|virtual)'/g
const OWNER: Record<string, string> = {
  query: 'packages/data/src/',
  form: 'packages/data/src/',
  table: 'packages/organisms/src/',
  virtual: 'packages/organisms/src/',
}

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
    const offenders = files.flatMap((file) => {
      const source = readFileSync(path.join(ROOT, file), 'utf8')
      return [...source.matchAll(ADAPTERS)]
        .filter((match) => !file.startsWith(OWNER[match[1] ?? '']))
        .map(() => file)
    })
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
    expect(activity).toContain("from '@newui/organisms'")
    expect(activity).not.toContain('@tanstack/solid-virtual')
  })

  it('the starter composes the same surfaces as the examples', () => {
    const records = readFileSync(
      path.join(ROOT, 'apps/starter/src/pages/Records.tsx'),
      'utf8',
    )
    expect(records).toContain("from '@newui/data/query'")
    expect(records).toContain("from '@newui/data/form'")
    expect(records).toContain("from '@newui/organisms'")
    expect(records).not.toMatch(/import .* from '@tanstack\//)
  })
})
