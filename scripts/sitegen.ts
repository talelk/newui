/**
 * Site data generator.
 *
 * The reference pages need three things the library already knows, in a shape a
 * browser can load one page at a time:
 *
 *  1. **The component registry** — one entry per exported compound, with the
 *     group it belongs to. Read from `api.json` (the prop interfaces) so a
 *     component cannot exist without appearing in the site.
 *  2. **Per-component API slices** — the prop tables for one component as its
 *     own module, so `/components/pagination` loads ~1 kB instead of the 111 kB
 *     `api.json`. One file per slug; the page resolves its own slice through a
 *     glob, so nothing imports them all.
 *  3. **Nothing else.** The specs are read straight out of `spec/` at build
 *     time (`lib/specs.ts`), and the demos are the ones the playground already
 *     has — a second copy of either would be a second source of truth.
 *
 * `--check` regenerates in memory and fails on drift, the same gate `api:check`
 * and `css:check` are.
 */
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const apiFile = path.join(root, 'packages/ui/api.json')
const outDir = path.join(root, 'apps/playground/src/generated')
const apiOutDir = path.join(outDir, 'api')
const isCheck = process.argv.includes('--check')

interface ApiMember {
  name: string
  type: string
  optional: boolean
  description?: string
}

const api = JSON.parse(readFileSync(apiFile, 'utf8')) as Record<
  string,
  Record<string, ApiMember[]>
>

/**
 * Which compound each prop interface belongs to.
 *
 * `ButtonProps` → `Button`, `SettingsNavItemProps` → the `SettingsDialog`
 * family. Derived from the name, with the handful of parts whose prefix is a
 * family rather than a component spelled out — a heuristic here would be a
 * silent mis-grouping, which is worse than a short list.
 */
const FAMILIES: Record<string, string> = {
  AccordionItem: 'Accordion',
  AccordionTrigger: 'Accordion',
  AccordionContent: 'Accordion',
  CollapsibleTrigger: 'Collapsible',
  CollapsibleContent: 'Collapsible',
  ContextMenuRoot: 'ContextMenu',
  ContextMenuItem: 'ContextMenu',
  CalendarView: 'DatePicker',
  DialogRoot: 'Dialog',
  DialogHeader: 'Dialog',
  DialogFooter: 'Dialog',
  DialogContent: 'Dialog',
  DropdownOption: 'Dropdown',
  FormControlText: 'FormControl',
  KeyboardShortcutsDialog: 'KeyboardShortcutsDialog',
  ListRow: 'List',
  ListCell: 'List',
  ListHeader: 'List',
  ListHeaderCell: 'List',
  MobileNavItem: 'MobileNav',
  PageHeaderMobile: 'MobileShell',
  SettingsSidebar: 'SettingsDialog',
  SettingsNavGroup: 'SettingsDialog',
  SettingsNavItem: 'SettingsDialog',
  SettingsContent: 'SettingsDialog',
  SettingsPanel: 'SettingsDialog',
  SettingsHeader: 'SettingsDialog',
  SettingsBody: 'SettingsDialog',
  SettingsRow: 'SettingsDialog',
  SidebarHeader: 'Sidebar',
  SidebarItem: 'Sidebar',
  SidebarLabel: 'Sidebar',
  SidebarRail: 'Sidebar',
  SidebarRailItem: 'Sidebar',
  SidebarCollapseToggle: 'Sidebar',
  SidebarSection: 'Sidebar',
  SidebarCard: 'Sidebar',
  TabsRoot: 'Tabs',
  TabsTrigger: 'Tabs',
  TabsContent: 'Tabs',
  TimelineItem: 'Timeline',
  ToastRegion: 'Toast',
  ToggleGroupItem: 'ToggleGroup',
  TreeRoot: 'Tree',
  PaginationRoot: 'Pagination',
  PaginationTrigger: 'Pagination',
}

/** Interfaces that are types, not a part's props. */
const NOT_A_PART = /^(FieldProps|PortalProps|UIProviderProps|DropdownOption)$/

function componentOf(part: string): string | undefined {
  if (NOT_A_PART.test(part)) return undefined
  const base = part.replace(/Props$/, '')
  const family = FAMILIES[base]
  if (family) return family
  // `PageHeaderProps` → PageHeader, but `PageBodyProps` is part of AppShell.
  if (
    base === 'PageBody' ||
    base === 'PageHeader' ||
    base === 'PageHeaderTitle'
  )
    return 'AppShell'
  return base
}

/**
 * The site's grouping. Explicit rather than inferred: a component's group is an
 * editorial decision, and getting it wrong is a nav nobody can scan.
 */
const GROUPS: Record<string, string> = {
  Accordion: 'Disclosure',
  Collapsible: 'Disclosure',
  Tabs: 'Disclosure',
  TabButtons: 'Disclosure',
  Button: 'Actions',
  Dropdown: 'Actions',
  Menu: 'Actions',
  ContextMenu: 'Actions',
  KeyboardShortcut: 'Actions',
  KeyboardShortcutsDialog: 'Actions',
  TextInput: 'Inputs',
  Textarea: 'Inputs',
  Password: 'Inputs',
  NumberInput: 'Inputs',
  Duration: 'Inputs',
  Checkbox: 'Inputs',
  Switch: 'Inputs',
  RadioGroup: 'Inputs',
  Slider: 'Inputs',
  Rating: 'Inputs',
  FormControl: 'Inputs',
  FormLabel: 'Inputs',
  ErrorMessage: 'Inputs',
  Select: 'Selection',
  Combobox: 'Selection',
  MultiSelect: 'Selection',
  DatePicker: 'Selection',
  DateRangePicker: 'Selection',
  DateTimePicker: 'Selection',
  TimePicker: 'Selection',
  FileUploader: 'Selection',
  Badge: 'Display',
  Avatar: 'Display',
  Icon: 'Display',
  Card: 'Display',
  Divider: 'Display',
  EmptyState: 'Display',
  Timeline: 'Display',
  Tree: 'Display',
  List: 'Display',
  ItemListRow: 'Display',
  Breadcrumbs: 'Navigation',
  Pagination: 'Navigation',
  Sidebar: 'Navigation',
  AppShell: 'Layout',
  DesktopShell: 'Layout',
  MobileShell: 'Layout',
  MobileNav: 'Navigation',
  Dialog: 'Overlays',
  BottomSheet: 'Overlays',
  Popover: 'Overlays',
  HoverCard: 'Overlays',
  Tooltip: 'Overlays',
  ScrollArea: 'Overlays',
  SettingsDialog: 'Patterns',
  // Blocks — composed sections rather than single controls.
  AppSidebar: 'Layout',
  PageToolbar: 'Layout',
  DetailHeader: 'Layout',
  FilterBar: 'Data',
  StatGrid: 'Data',
  AuthCard: 'Patterns',
  Alert: 'Feedback',
  Progress: 'Feedback',
  ProgressCircle: 'Feedback',
  Spinner: 'Feedback',
  Skeleton: 'Feedback',
  Toast: 'Feedback',
}

const GROUP_ORDER = [
  'Actions',
  'Data',
  'Disclosure',
  'Display',
  'Feedback',
  'Inputs',
  'Layout',
  'Navigation',
  'Overlays',
  'Patterns',
  'Selection',
]

function kebab(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

/** part name → the component it belongs to, and the package it came from. */
const partsByComponent = new Map<string, string[]>()
const packageOf = new Map<string, 'component' | 'block'>()
for (const [file, parts] of Object.entries(api)) {
  const kind = file.includes('/blocks/') ? 'block' : 'component'
  for (const part of Object.keys(parts)) {
    const component = componentOf(part)
    if (!component) continue
    const list = partsByComponent.get(component) ?? []
    list.push(part)
    partsByComponent.set(component, list)
    packageOf.set(component, kind)
  }
}

/** A spec file per component, by kebab name, for the "contract" link. */
const specDir = path.join(root, 'spec')
const specSlugs = new Set(
  readdirSync(specDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, '')),
)

/** Exported names the barrels actually ship, so a stray interface cannot invent one. */
function barrelExports(file: string): Set<string> {
  const source = readFileSync(path.join(root, file), 'utf8')
  return new Set(
    [
      ...source.matchAll(/^export \* from '\.\/(?:components\/)?([^']+)'/gm),
    ].map((match) => match[1] ?? ''),
  )
}
const exported = barrelExports('packages/ui/src/index.ts')
const exportedBlocks = barrelExports('packages/blocks/src/index.ts')

const entries = [...partsByComponent.keys()]
  .filter((component) => GROUPS[component])
  .map((component) => ({
    name: component,
    slug: kebab(component),
    group: GROUPS[component] as string,
    /** `component` (an atom or molecule) or `block` (a composed section). */
    kind: packageOf.get(component) ?? 'component',
    parts: (partsByComponent.get(component) ?? []).sort(),
    spec: specSlugs.has(kebab(component)) ? kebab(component) : null,
    /** A page exists only for something a barrel exports. */
    shipped:
      packageOf.get(component) === 'block'
        ? exportedBlocks.has(component)
        : exported.has(component),
  }))
  .sort((a, b) => {
    const byGroup = GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group)
    return byGroup !== 0 ? byGroup : a.name.localeCompare(b.name)
  })

const registry = `/**
 * Generated by \`pnpm site\`. Do not edit.
 *
 * One entry per documented component. \`parts\` are the prop interfaces that
 * belong to it, so a reference page can show a table per part without loading
 * every table in the library.
 */
export interface ComponentEntry {
  name: string
  slug: string
  group: string
  /** \`component\` for a single control, \`block\` for a composed section. */
  kind: 'component' | 'block'
  parts: string[]
  /** Kebab name of the file in \`spec/\`, when the component has a contract. */
  spec: string | null
  /** Whether the package barrel actually exports it. */
  shipped: boolean
}

export const COMPONENTS: ComponentEntry[] = ${JSON.stringify(entries, null, 2)}

export const GROUPS = ${JSON.stringify(
  GROUP_ORDER.filter((group) => entries.some((e) => e.group === group)),
)} as const

export function componentBySlug(slug: string): ComponentEntry | undefined {
  return COMPONENTS.find((entry) => entry.slug === slug)
}

/** Only the blocks: what \`/blocks\` lists and pages through. */
export const BLOCKS: ComponentEntry[] = COMPONENTS.filter(
  (entry) => entry.kind === 'block',
)

`

const apiFiles = new Map<string, string>()
for (const entry of entries) {
  const tables: Record<string, ApiMember[]> = {}
  for (const part of entry.parts) {
    for (const parts of Object.values(api)) {
      if (parts[part]) tables[part] = parts[part] as ApiMember[]
    }
  }
  apiFiles.set(
    entry.slug,
    `/**
 * Generated by \`pnpm site\`. Do not edit.
 * Prop tables for ${entry.name}, one entry per part.
 */
export const API = ${JSON.stringify(tables, null, 2)} as const
`,
  )
}

function write(file: string, contents: string) {
  if (isCheck) {
    let current = ''
    try {
      current = readFileSync(file, 'utf8')
    } catch {
      current = ''
    }
    if (current !== contents) stale.push(path.relative(root, file))
    return
  }
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, contents)
}

const stale: string[] = []

write(path.join(outDir, 'components.ts'), registry)

if (!isCheck) {
  rmSync(apiOutDir, { recursive: true, force: true })
  mkdirSync(apiOutDir, { recursive: true })
}
for (const [slug, contents] of apiFiles) {
  write(path.join(apiOutDir, `${slug}.ts`), contents)
}

if (isCheck) {
  if (stale.length > 0) {
    console.warn('[site:check] the generated site data is stale:')
    for (const file of stale) console.warn(`  - ${file}`)
    console.warn('Run `pnpm site`.')
    process.exit(1)
  }
} else {
}

function _GROUPS_ORDER_COUNT(): number {
  return new Set(entries.map((entry) => entry.group)).size
}
