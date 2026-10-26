/**
 * API-table generator.
 *
 * Collects every exported `*Props` interface from the atomic and optional domain
 * packages and writes a stable table to the root `api.json`. `--check` regenerates in memory and fails
 * when the committed table drifts — the frappe-ui `docs:check` gate, rebuilt on
 * the TypeScript AST instead of `vue-component-meta`.
 *
 * Types are read from the source type node (not the checker), so the output
 * depends only on what is written, not on how much of the program loaded.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { Node, Project, type PropertySignature } from 'ts-morph'

const root = process.cwd()
const isCheck = process.argv.includes('--check')
const outFile = path.join(root, 'api.json')

/**
 * DOM-lib symbols declared with string-literal names (`'aria-label'`) surface
 * from the checker with their quotes attached; declared members drop them.
 * Normalize once, or the same attribute lands in a table twice under both
 * spellings.
 */
function symbolName(name: string): string {
  const unquoted = name.replace(/^'(.*)'$/, '$1')
  return unquoted
}
/** Every package that ships component/template props. `api.json` is keyed by
 * source path, so the site derives each entry's owner from its implementation. */
const SOURCES = [
  'packages/atoms',
  'packages/molecules',
  'packages/organisms',
  'packages/templates',
  'packages/charts',
  'packages/editor',
  'packages/code-editor',
].map((pkg) => path.join(root, pkg, 'src'))

interface ApiMember {
  name: string
  type: string
  optional: boolean
  description?: string
  default?: string
}

const project = new Project({
  tsConfigFilePath: path.join(root, 'packages/atoms/tsconfig.json'),
})
// The base project uses the atoms package's strict compiler options; remaining
// atomic and optional domain packages are added explicitly to the same table.
project.addSourceFilesAtPaths(
  SOURCES.map((dir) => path.join(dir, '**/*.{ts,tsx}')),
)

function defaultFor(property: PropertySignature): string | undefined {
  return property
    .getJsDocs()
    .flatMap((doc) => doc.getTags())
    .find((tag) => ['default', 'defaultValue'].includes(tag.getTagName()))
    ?.getCommentText()
}

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
      const defaultValue = defaultFor(property)
      return {
        name: symbolName(property.getName()),
        type: property.getTypeNode()?.getText() ?? 'unknown',
        optional: property.hasQuestionToken(),
        ...(description ? { description } : {}),
        ...(defaultValue ? { default: defaultValue } : {}),
      }
    })
    // Include inherited Field and recipe axes while leaving Solid's native DOM
    // attributes to its standard contract. Their source signatures stay intact.
    const own = new Set(entries[name]?.map((member) => symbolName(member.name)))
    for (const symbol of iface.getType().getProperties()) {
      const inherited = symbolName(symbol.getName())
      if (own.has(inherited)) continue
      const declaration = symbol.getDeclarations()[0]
      if (
        !declaration
          ?.getSourceFile()
          .getFilePath()
          .startsWith(path.join(root, 'packages'))
      )
        continue
      const description = Node.isPropertySignature(declaration)
        ? declaration.getJsDocs()[0]?.getDescription().trim()
        : undefined
      const defaultValue = Node.isPropertySignature(declaration)
        ? defaultFor(declaration)
        : undefined
      entries[name]?.push({
        name: inherited,
        type: Node.isPropertySignature(declaration)
          ? (declaration.getTypeNode()?.getText() ?? 'unknown')
          : symbol.getTypeAtLocation(iface).getText(iface),
        optional: symbol.isOptional(),
        ...(description ? { description } : {}),
        ...(defaultValue ? { default: defaultValue } : {}),
      })
    }
  }

  for (const alias of sourceFile.getTypeAliases()) {
    const name = alias.getName()
    if (!alias.isExported() || !name.endsWith('Props')) continue
    entries[name] = alias
      .getType()
      .getProperties()
      .flatMap((symbol) => {
        const declaration = symbol.getDeclarations()[0]
        if (!declaration || !('getTypeNode' in declaration)) return []
        const property = declaration as PropertySignature
        const description = property.getJsDocs()[0]?.getDescription().trim()
        const defaultValue = defaultFor(property)
        return [
          {
            name: symbolName(symbol.getName()),
            type: property.getTypeNode()?.getText() ?? 'unknown',
            optional: symbol.isOptional(),
            ...(description ? { description } : {}),
            ...(defaultValue ? { default: defaultValue } : {}),
          },
        ]
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
    console.error('[api:check] api.json is missing. Run `pnpm api`.')
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
  console.warn(`[api] wrote ${count} prop types to api.json`)
}
