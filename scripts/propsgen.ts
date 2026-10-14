/**
 * API-table generator.
 *
 * Collects every exported `*Props` interface in `@newui/ui` and writes a stable
 * table to `packages/ui/api.json`. `--check` regenerates in memory and fails
 * when the committed table drifts — the frappe-ui `docs:check` gate, rebuilt on
 * the TypeScript AST instead of `vue-component-meta`.
 *
 * Types are read from the source type node (not the checker), so the output
 * depends only on what is written, not on how much of the program loaded.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { Project } from 'ts-morph'

const root = process.cwd()
const isCheck = process.argv.includes('--check')
const outFile = path.join(root, 'packages/ui/api.json')
/** Every package that ships props worth documenting: the components and the
 * blocks composed from them. `api.json` is keyed by source path, so the two are
 * told apart later by that path, not by a second table. */
const SOURCES = ['packages/ui', 'packages/blocks'].map((pkg) =>
  path.join(root, pkg, 'src'),
)

interface ApiMember {
  name: string
  type: string
  optional: boolean
  description?: string
}

const project = new Project({
  tsConfigFilePath: path.join(root, 'packages/ui/tsconfig.json'),
})
// The tsconfig's `include` is `packages/ui/src`, so a project built from it
// holds only that package's files. The blocks are added explicitly — they are
// documented in the same table, told apart by their path.
project.addSourceFilesAtPaths(
  SOURCES.map((dir) => path.join(dir, '**/*.{ts,tsx}')),
)

const table: Record<string, Record<string, ApiMember[]>> = {}

for (const sourceFile of project.getSourceFiles()) {
  const filePath = sourceFile.getFilePath()
  if (!SOURCES.some((dir) => filePath.startsWith(dir))) continue

  const entries: Record<string, ApiMember[]> = {}

  for (const iface of sourceFile.getInterfaces()) {
    const name = iface.getName()
    if (!iface.isExported() || !name.endsWith('Props')) continue
    entries[name] = iface.getProperties().map((property) => {
      const description = property.getJsDocs()[0]?.getDescription().trim()
      return {
        name: property.getName(),
        type: property.getTypeNode()?.getText() ?? 'unknown',
        optional: property.hasQuestionToken(),
        ...(description ? { description } : {}),
      }
    })
  }

  if (Object.keys(entries).length > 0) {
    table[path.relative(root, filePath)] = entries
  }
}

const serialized = `${JSON.stringify(table, null, 2)}\n`

if (isCheck) {
  let committed = ''
  try {
    committed = readFileSync(outFile, 'utf8')
  } catch {
    console.error(
      '[api:check] packages/ui/api.json is missing. Run `pnpm api`.',
    )
    process.exit(1)
  }
  if (committed !== serialized) {
    console.error(
      '[api:check] API table is stale. Run `pnpm api` and commit the result.',
    )
    process.exit(1)
  }
  console.warn('[api:check] API table is up to date.')
} else {
  writeFileSync(outFile, serialized)
  const count = Object.values(table).reduce(
    (sum, entries) => sum + Object.keys(entries).length,
    0,
  )
  console.warn(`[api] wrote ${count} prop types to packages/ui/api.json`)
}
