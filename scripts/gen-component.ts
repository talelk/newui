/**
 * Scaffold one component: the source file, its barrel/export/classification
 * entries, the spec stub, the story skeleton and the changeset — the seven
 * registration points a new component must touch, which the conventions
 * otherwise carry in the reader's head.
 *
 *   pnpm gen component <Name> [--level atom|molecule|organism] [--group <Group>]
 *
 * The generated code compiles and the gates accept it, but it is a skeleton:
 * writing the actual behavior, the tests and the required states is still the
 * author's job — the script prints what is left.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const args = process.argv.slice(2).filter((arg) => arg !== 'component')
const [nameArg] = args
const levelArg = args[args.indexOf('--level') + 1] ?? 'molecule'
const groupArg = args[args.indexOf('--group') + 1]

const NAME = nameArg?.trim()
const LEVEL = levelArg as 'atom' | 'molecule' | 'organism'
const VALID_LEVELS = new Set(['atom', 'molecule', 'organism'])

if (!NAME || !/^[A-Z][A-Za-z0-9]+$/.test(NAME)) {
  console.error(
    'usage: pnpm gen component <Name> [--level atom|molecule|organism] [--group <Group>]',
  )
  process.exit(1)
}
if (!VALID_LEVELS.has(LEVEL)) {
  console.error(`--level must be one of ${[...VALID_LEVELS].join(', ')}`)
  process.exit(1)
}

const kebab = NAME.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const PACKAGE = LEVEL === 'atom' ? 'atoms' : `${LEVEL}s`
const PARTS_DIR =
  LEVEL === 'atom' ? 'atoms' : LEVEL === 'molecule' ? 'molecules' : 'organisms'

function insertAlphabetically(
  source: string,
  line: string,
  pattern: RegExp,
): string {
  const lines = source.split('\n')
  const index = lines.findIndex(
    (entry) => pattern.test(entry) && entry.localeCompare(line) > 0,
  )
  if (index === -1) {
    // Append before the closing of the matched block: after the last match.
    let last = -1
    lines.forEach((entry, i) => {
      if (pattern.test(entry)) last = i
    })
    lines.splice(last + 1, 0, line)
  } else {
    lines.splice(index, 0, line)
  }
  return lines.join('\n')
}

function patch(file: string, edit: (source: string) => string) {
  const source = readFileSync(file, 'utf8')
  const next = edit(source)
  if (next === source) throw new Error(`no change applied to ${file}`)
  writeFileSync(file, next)
}

// --- 1. the component itself -------------------------------------------------

const componentDir = path.join(
  root,
  `packages/${PACKAGE}/src/${PARTS_DIR}/${NAME}`,
)
if (existsSync(componentDir)) {
  console.error(
    `${NAME} already exists at ${path.relative(root, componentDir)}`,
  )
  process.exit(1)
}

mkdirSync(componentDir, { recursive: true })
writeFileSync(
  path.join(componentDir, `${NAME}.tsx`),
  `import { cn } from '../../lib/tv'
import type { JSX } from 'solid-js'

export interface ${NAME}Props {
  class?: string
  children: JSX.Element
}

/**
 * TODO One sentence: what is this control, in the vocabulary of CONTEXT.md?
 */
export function ${NAME}(props: ${NAME}Props): JSX.Element {
  return (
    <div data-slot="${kebab}" class={cn('TODO shared classes', props.class)}>
      {props.children}
    </div>
  )
}
`,
)
writeFileSync(
  path.join(componentDir, 'index.ts'),
  `export * from './${NAME}'\n`,
)

// --- 2..6 the registration points --------------------------------------------

const indexFile = path.join(
  root,
  `packages/${PACKAGE}/src/${PARTS_DIR}/index.ts`,
)
patch(indexFile, (source) =>
  insertAlphabetically(
    source,
    `export * from './${NAME}'`,
    /^export \* from '\.\//,
  ),
)

patch(path.join(root, `packages/${PACKAGE}/src/exports.test.ts`), (source) =>
  insertAlphabetically(source, `  '${NAME}',`, /^ {2}'/),
)

patch(path.join(root, 'scripts/atomic.ts'), (source) =>
  insertAlphabetically(
    source,
    `  ${NAME}: '${LEVEL}',`,
    /^ {2}[A-Z][A-Za-z0-9]*: '/,
  ),
)

if (groupArg) {
  patch(path.join(root, 'scripts/sitegen.ts'), (source) =>
    insertAlphabetically(
      source,
      `  ${NAME}: '${groupArg}',`,
      /^ {2}[A-Z][A-Za-z0-9]*: '/,
    ),
  )
}

// --- the spec stub ------------------------------------------------------------

writeFileSync(
  path.join(root, `spec/${kebab}.md`),
  `# ${NAME}

TODO One sentence: what is this control and when do you reach for it?

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| \`class\` | \`string\` | — | merged into the root |

## Behavior and accessibility

TODO Keyboard, focus and ARIA (P12). Styling hooks: \`data-slot\` /
\`data-state\` (P10). Responsive behavior at the narrow width.
`,
)

// --- the story ----------------------------------------------------------------

writeFileSync(
  path.join(root, `apps/playground/src/stories/${kebab}.stories.tsx`),
  `import { ${NAME} } from '@newui/${PACKAGE}'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (\`excludeStories\` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="max-w-md">
      <${NAME}>TODO a real example, not lorem ipsum</${NAME}>
    </div>
  )
}

const meta = {
  title: '${LEVEL === 'atom' ? 'Atoms' : LEVEL === 'molecule' ? 'Molecules' : 'Organisms'}/TODO Group/${NAME}',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
`,
)

// --- the changeset -------------------------------------------------------------

writeFileSync(
  path.join(root, `.changeset/${kebab}-new.md`),
  `---
"@newui/${PACKAGE}": minor
---

New \`${NAME}\` ${LEVEL}. TODO one line on what it does and its vocabulary.
`,
)

console.warn(
  `ok  ${NAME} scaffolded in packages/${PACKAGE}/src/${PARTS_DIR}/${NAME}`,
)
console.warn(`
Remaining, by hand:
  1. the component's real API and behavior (PRINCIPLES.md is the rule layer)
  2. ${NAME}.test.tsx — logic/ARIA, and a browser test if it renders states
  3. the required states in scripts/story-states.ts (see spec/states.md)
${
  groupArg
    ? ''
    : `  4. the sitegen GROUPS entry (scripts/sitegen.ts) so the registry picks it up
`
}  ${groupArg ? 4 : 5}. regenerate: pnpm api && pnpm site && pnpm stories
  ${groupArg ? 5 : 6}. the ${`spec/${kebab}.md`} contract — stubbed, not done
`)
