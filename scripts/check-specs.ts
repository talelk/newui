/**
 * Spec contracts agree with the code they contract.
 *
 * Two checks over `spec/*.md`, read-only, failing with `file:line`:
 *
 * 1. Every prop a spec documents exists. Tables with a `prop` column (under a
 *    `Props` heading, or directly under a heading that names a component, as
 *    in `form.md`) are resolved to the `*Props` types in
 *    `packages/ui/api.json` and every named prop must be a member. Combined
 *    rows (`` `a` / `b` ``) are split and each name is checked on its own.
 *    The component a table belongs to comes from, in order: a `part` column,
 *    a dotted sub-heading (`Accordion.Item`), a parenthesised Props heading
 *    (`Props (Tree.Root)`), the heading above a nested `### Props`, the spec
 *    filename, then its `#` title. A dotted part is checked strictly against
 *    that part's `*Props`; a bare family table (filename or component heading
 *    only — `Collapsible`, the `FormControl` dispatcher) documents the family
 *    surface with the part named in the notes, so it is checked against the
 *    union of the same-file `*Props` types sharing its prefix. An unresolvable
 *    component or an unknown prop is an error: a renamed prop must fail here,
 *    not in a reader's code. Pattern cells (`aria-*`, `…`) state a family of
 *    attributes, not a prop, and are skipped.
 *
 * 2. Every fenced `ts`/`tsx` sample parses. Blocks are loaded into an
 *    in-memory ts-morph project and its syntactic diagnostics are mapped back
 *    to the spec line they came from. Samples are fragments (bare JSX,
 *    top-level `await`), so only syntax is judged — never types or names.
 *    Samples in skipped files are still parsed: a broken example is broken
 *    wherever it lives.
 *
 * `api.json` deliberately omits Solid's native DOM attributes (see
 * `scripts/propsgen.ts`), so the closed `DOM_FALLTHROUGH` list below carries
 * the standard attributes that arrive through a `JSX.HTMLAttributes` spread
 * (`ItemListRow`'s `role`/`onClick`, a nav item's native button `disabled`).
 * It is a closed list on purpose: a typo'd handler still fails.
 */
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { Project, ScriptKind, ts } from 'ts-morph'

const ROOT = process.cwd()
const SPEC_DIR = path.join(ROOT, 'spec')
const API_FILE = path.join(ROOT, 'packages/ui/api.json')

/**
 * Specs exempt from check 1 because their prop tables are not one component's
 * contract. Each entry needs its reason here; check 2 still applies. A spec
 * with no prop table needs no entry.
 */
const SKIP_PROPS: Record<string, string> = {
  // Index of the contracts; documents no component.
  'README.md': 'index',
  // The shared P5 labelling contract: its table lists the props every input
  // exposes, validated per control in that control's own spec.
  'inputs.md': 'shared Field contract, not one component',
  // Documents the `DialogOptions`/`PromptOptions` bags for the imperative
  // `dialog.*` helpers, which are not component `*Props` in `api.json`.
  'dialog-imperative.md': 'imperative options, not component props',
  // Historical frappe-ui parity audits; their prop-surface tables compare
  // against the reference, they are not contracts.
  'design-deltas-display.md': 'parity audit, not a contract',
  'design-deltas-inputs.md': 'parity audit, not a contract',
  'design-deltas-overlays.md': 'parity audit, not a contract',
}

/** Standard DOM fallthrough `api.json` omits by design. See the header. */
const DOM_FALLTHROUGH = new Set([
  'role',
  'slot',
  'title',
  'lang',
  'dir',
  'hidden',
  'tabIndex',
  'tabindex',
  'disabled',
  'onClick',
  'onDoubleClick',
  'onContextMenu',
  'onKeyDown',
  'onKeyUp',
  'onFocus',
  'onBlur',
  'onMouseDown',
  'onMouseUp',
  'onPointerDown',
  'onPointerUp',
  'onTouchStart',
  'onTouchEnd',
])

interface ApiMember {
  name: string
}

type ApiTable = Record<string, Record<string, ApiMember[]>>

const errors: string[] = []
const fail = (spec: string, line: number, message: string): void => {
  errors.push(`${spec}:${line} ${message}`)
}

/** `Accordion.Item` and `accordion-item` must find the same type. */
const norm = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]/g, '')

let api: ApiTable
try {
  api = JSON.parse(readFileSync(API_FILE, 'utf8')) as ApiTable
} catch {
  console.error(
    '[specs:check] packages/ui/api.json is missing. Run `pnpm api`.',
  )
  process.exit(1)
}

/** `*Props` name -> source file and member names, plus the lookup indexes. */
const propsFile = new Map<string, string>()
const propsMembers = new Map<string, Set<string>>()
const fileProps = new Map<string, string[]>()
const byNorm = new Map<string, string>()

for (const [file, entries] of Object.entries(api)) {
  for (const [name, members] of Object.entries(entries)) {
    propsFile.set(name, file)
    propsMembers.set(
      name,
      new Set(members.map((member) => member.name.replace(/^['"]|['"]$/g, ''))),
    )
    const siblings = fileProps.get(file) ?? []
    siblings.push(name)
    fileProps.set(file, siblings)
    byNorm.set(norm(name.replace(/Props$/, '')), name)
  }
}

/** A bare component name (`ContextMenu`, a filename) to its `*Props` type. */
function resolveBare(name: string): string | undefined {
  return byNorm.get(norm(name)) ?? byNorm.get(`${norm(name)}root`)
}

/**
 * A heading's component name to its `*Props` type. Dotted parts resolve by
 * exact concatenation (`Accordion.Item` -> `AccordionItemProps`,
 * `Tree.Root` -> `TreeRootProps`), by `.Root` naming the family type
 * (`Pagination.Root` -> `PaginationProps`), or by suffix within the family's
 * source file (`SettingsDialog.NavItem` -> `SettingsNavItemProps`, in the
 * same file as `SettingsDialogProps`).
 */
function resolveComponent(display: string): string | undefined {
  const parts = display
    .split('.')
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length === 0) return undefined
  if (parts.length === 1) return resolveBare(parts[0] ?? '')
  const joined = byNorm.get(norm(parts.join('')))
  if (joined) return joined
  const last = parts.at(-1) ?? ''
  const base = resolveBare(parts.slice(0, -1).join('.'))
  if (!base) return undefined
  if (last === 'Root') return base
  const file = propsFile.get(base)
  return (file ? (fileProps.get(file) ?? []) : []).find((candidate) =>
    norm(candidate.replace(/Props$/, '')).endsWith(norm(last)),
  )
}

/**
 * Members a table may name. A strict target (a dotted part or a `part` column
 * entry) gets exactly its own `*Props`; a bare family target gets the union
 * of same-file `*Props` sharing its prefix (`FormControl` covers its routed
 * `FormControlTextProps` variants, whose union type lists only the common
 * props). Returns the types used, for the error message.
 */
function membersFor(
  propsName: string,
  bare: boolean,
): { types: string[]; members: Set<string> } {
  if (!bare) {
    return {
      types: [propsName],
      members: propsMembers.get(propsName) ?? new Set(),
    }
  }
  const base = propsName.replace(/Props$/, '')
  const file = propsFile.get(propsName) ?? ''
  const types = (fileProps.get(file) ?? []).filter((candidate) =>
    candidate.replace(/Props$/, '').startsWith(base),
  )
  const members = new Set<string>()
  for (const type of types) {
    for (const member of propsMembers.get(type) ?? []) members.add(member)
  }
  return { types, members }
}

function isKnownProp(prop: string, members: Set<string>): boolean {
  return (
    members.has(prop) ||
    DOM_FALLTHROUGH.has(prop) ||
    prop.startsWith('aria-') ||
    prop.startsWith('data-')
  )
}

/** One markdown table row as trimmed cells, honouring `\|` in type cells. */
function splitCells(line: string): string[] {
  const parts = line.trim().split(/(?<!\\)\|/)
  if (parts[0] === '') parts.shift()
  if (parts.at(-1) === '') parts.pop()
  return parts.map((cell) => cell.trim())
}

const isSeparatorRow = (cells: string[]): boolean =>
  cells.length > 0 && cells.every((cell) => /^:?-{2,}:?$/.test(cell))

/**
 * Every prop name a cell documents. Combined rows spell several names
 * (`` `iconLeft` / `iconRight` ``, `` `placeholder`, `label` ``); each
 * backticked token is one prop. Pattern tokens (`aria-*`, `…`) and a
 * trailing `?` are not literal names.
 */
function propNames(cell: string): string[] {
  const ticked = [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1] ?? '')
  const raw = ticked.length > 0 ? ticked : [cell]
  return raw
    .map((name) => name.trim().replace(/\?$/, ''))
    .filter(
      (name) =>
        name.length > 0 &&
        !name.includes('*') &&
        !name.includes('…') &&
        /^[A-Za-z][\w-]*$/.test(name),
    )
}

interface Heading {
  level: number
  /** Heading text with backticks removed: `SettingsDialog.Root`. */
  text: string
}

interface TableRow {
  line: number
  cells: string[]
}

interface CodeBlock {
  spec: string
  /** 1-based line of the opening fence; sample line N sits at fence + N. */
  fenceLine: number
  lang: 'ts' | 'tsx'
  text: string
}

const PROPS_HEADING = /^Props(?:\s*\(|$)/
const codeBlocks: CodeBlock[] = []
let tablesChecked = 0
let propsChecked = 0

for (const file of readdirSync(SPEC_DIR).sort()) {
  if (!file.endsWith('.md')) continue
  const spec = `spec/${file}`
  const skipped = file in SKIP_PROPS
  const lines = readFileSync(path.join(SPEC_DIR, file), 'utf8').split('\n')
  const headings: Heading[] = []
  let title: string | undefined
  let inFence = false
  let fenceLang = ''
  let fenceLine = 0
  let fenceText: string[] = []

  const checkRows = (
    rows: TableRow[],
    propIdx: number,
    types: string[],
    members: Set<string>,
  ): void => {
    for (const row of rows) {
      for (const prop of propNames(row.cells[propIdx] ?? '')) {
        propsChecked += 1
        if (!isKnownProp(prop, members)) {
          fail(
            spec,
            row.line,
            `unknown prop \`${prop}\` for ${types.join(' / ')}`,
          )
        }
      }
    }
  }

  const checkTable = (
    headerLine: number,
    header: string[],
    rows: TableRow[],
  ): void => {
    tablesChecked += 1
    const propIdx = header.indexOf('prop')
    const partIdx = header.indexOf('part')

    // A `part` column names the component per row (`command-palette.md`);
    // an empty part cell keeps the previous row's part.
    if (partIdx >= 0) {
      let lastPart = ''
      const seen = new Map<
        string,
        { types: string[]; members: Set<string> } | null
      >()
      for (const row of rows) {
        const partCell = (row.cells[partIdx] ?? '').replace(/`/g, '').trim()
        if (partCell) lastPart = partCell
        if (!lastPart) {
          fail(spec, row.line, 'prop row names no part')
          continue
        }
        if (!seen.has(lastPart)) {
          const resolved = resolveComponent(lastPart)
          if (!resolved) {
            fail(
              spec,
              row.line,
              `unknown component \`${lastPart}\` (no *Props in api.json)`,
            )
            seen.set(lastPart, null)
          } else {
            seen.set(lastPart, membersFor(resolved, false))
          }
        }
        const target = seen.get(lastPart)
        if (target) checkRows([row], propIdx, target.types, target.members)
      }
      return
    }

    // Otherwise the heading context names the component.
    const propsIdx = headings.findIndex((h) => PROPS_HEADING.test(h.text))
    let displays: string[] = []
    let fromFilename = false
    if (propsIdx >= 0) {
      const propsHeading = headings[propsIdx]
      const sub = headings.at(-1)
      const paren = propsHeading?.text.match(/\(([^)]+)\)/)?.[1]
      if (sub && propsHeading && sub.level > propsHeading.level) {
        displays = sub.text.split(/\s*\/\s*/)
      } else if (paren) {
        displays = [paren]
      } else if (propsHeading && propsHeading.level > 2) {
        displays = [headings[propsIdx - 1]?.text ?? '']
      } else {
        fromFilename = true
      }
    } else {
      displays = [headings.at(-1)?.text ?? '']
    }

    const types: string[] = []
    const members = new Set<string>()
    if (fromFilename) {
      const resolved =
        resolveBare(file.replace(/\.md$/, '')) ??
        resolveBare(title?.split(/\s+/)[0] ?? '')
      if (!resolved) {
        fail(
          spec,
          headerLine,
          `unknown component for spec filename/title (no *Props in api.json)`,
        )
        return
      }
      const family = membersFor(resolved, true)
      types.push(...family.types)
      for (const member of family.members) members.add(member)
    } else {
      for (const display of displays) {
        const resolved = display ? resolveComponent(display) : undefined
        if (!resolved) {
          fail(
            spec,
            headerLine,
            propsIdx >= 0
              ? `unknown component \`${display}\` (no *Props in api.json)`
              : `prop table is not under a Props heading and heading ` +
                  `\`${display}\` names no component; add a Props heading ` +
                  `or a commented SKIP_PROPS entry`,
          )
          continue
        }
        const target = membersFor(resolved, !display.includes('.'))
        types.push(...target.types)
        for (const member of target.members) members.add(member)
      }
    }
    if (types.length > 0) checkRows(rows, propIdx, types, members)
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? ''
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      if (inFence) {
        if (fenceLang === 'ts' || fenceLang === 'tsx') {
          codeBlocks.push({
            spec,
            fenceLine,
            lang: fenceLang,
            text: fenceText.join('\n'),
          })
        }
        inFence = false
      } else {
        inFence = true
        fenceLang = trimmed.slice(3).trim().split(/\s+/)[0] ?? ''
        fenceLine = i + 1
        fenceText = []
      }
      continue
    }
    if (inFence) {
      fenceText.push(line)
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      const level = heading[1]?.length ?? 1
      const text = (heading[2] ?? '').replace(/`/g, '').trim()
      while (headings.length > 0 && (headings.at(-1)?.level ?? 0) >= level) {
        headings.pop()
      }
      headings.push({ level, text })
      if (level === 1 && !title) title = text
      continue
    }

    if (trimmed.startsWith('|')) {
      const header = splitCells(line).map((cell) => cell.toLowerCase())
      if (!header.includes('prop')) continue
      const rows: TableRow[] = []
      let j = i + 1
      while (j < lines.length && (lines[j] ?? '').trim().startsWith('|')) {
        const cells = splitCells(lines[j] ?? '')
        if (!isSeparatorRow(cells)) rows.push({ line: j + 1, cells })
        j += 1
      }
      if (!skipped) checkTable(i + 1, header, rows)
      i = j - 1
    }
  }
  if (inFence) fail(spec, fenceLine, 'unterminated code fence')
}

// Check 2: every ts/tsx sample parses. Syntactic diagnostics only — samples
// are fragments with free names, so semantics would judge the illustration,
// not the syntax.
const project = new Project({
  useInMemoryFileSystem: true,
  compilerOptions: {
    jsx: ts.JsxEmit.Preserve,
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
  },
})
const blockByPath = new Map<string, CodeBlock>()
codeBlocks.forEach((block, index) => {
  const virtual = `/spec-block-${index}.${block.lang}`
  blockByPath.set(virtual, block)
  project.createSourceFile(virtual, block.text, {
    scriptKind: block.lang === 'tsx' ? ScriptKind.TSX : ScriptKind.TS,
  })
})
for (const diagnostic of project.getProgram().getSyntacticDiagnostics()) {
  const sourceFile = diagnostic.getSourceFile()
  const block = sourceFile
    ? blockByPath.get(sourceFile.getFilePath())
    : undefined
  const messageText = diagnostic.getMessageText()
  const message =
    typeof messageText === 'string' ? messageText : messageText.getMessageText()
  if (block) {
    fail(
      block.spec,
      block.fenceLine + (diagnostic.getLineNumber() ?? 1),
      `${block.lang} sample does not parse: ${message}`,
    )
  } else {
    errors.push(
      `${sourceFile?.getFilePath() ?? 'spec'}: sample does not parse: ${message}`,
    )
  }
}

if (errors.length > 0) {
  console.error(`\n[specs:check] ${errors.length} problem(s):\n`)
  for (const error of errors) console.error(`  ${error}`)
  process.exit(1)
}

console.warn(
  `[specs:check] ${propsChecked} props in ${tablesChecked} tables match ` +
    `api.json; ${codeBlocks.length} code samples parse.`,
)
