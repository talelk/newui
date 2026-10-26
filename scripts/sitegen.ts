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
 *     own module, so `/molecules/pagination` loads ~1 kB instead of the 111 kB
 *     `api.json`. One file per slug; the page resolves its own slice through a
 *     glob, so nothing imports them all.
 *  3. **Source manifests and acceptance inventories** — paths to application
 *     source dependencies and actual public/reference surfaces. Text stays in
 *     the original modules and contracts; nothing here copies their contents.
 *
 * `--check` regenerates in memory and fails on drift, the same gate `api:check`
 * and `css:check` are.
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { Node, Project, SyntaxKind } from 'ts-morph'
import { APPLICATION_FILES } from '../apps/playground/src/lib/application-files'
import { EXAMPLES } from '../apps/playground/src/lib/examples'
import { semanticColors } from '../packages/tokens/src/index.js'
import { atomicOf } from './atomic'

const root = process.cwd()
const apiFile = path.join(root, 'api.json')
const outDir = path.join(root, 'apps/playground/src/generated')
const apiOutDir = path.join(outDir, 'api')
const isCheck = process.argv.includes('--check')

interface ApiMember {
  name: string
  type: string
  optional: boolean
  description?: string
  default?: string
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
  AvatarGroup: 'AvatarGroup',
  Calendar: 'Calendar',
  Carousel: 'Carousel',
  CollapsibleTrigger: 'Collapsible',
  CollapsibleContent: 'Collapsible',
  ColorPicker: 'ColorPicker',
  IconButton: 'IconButton',
  Image: 'Image',
  Link: 'Link',
  PinInput: 'PinInput',
  PopoverRoot: 'Popover',
  MenuRoot: 'Menu',
  MenuItem: 'Menu',
  ScrollAreaRoot: 'ScrollArea',
  ScrollAreaViewport: 'ScrollArea',
  ScrollAreaScrollbar: 'ScrollArea',
  TimeRangePicker: 'TimeRangePicker',
  TooltipRoot: 'Tooltip',
  TooltipTrigger: 'Tooltip',
  EditorToolbar: 'Editor',
  ChartTooltipSlot: 'ChartTooltip',
  HoverCardRoot: 'HoverCard',
  HoverCardTrigger: 'HoverCard',
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
  SidebarCollapseToggle: 'Sidebar',
  SidebarSection: 'Sidebar',
  SidebarCard: 'Sidebar',
  TabsRoot: 'Tabs',
  TabsTrigger: 'Tabs',
  TabsContent: 'Tabs',
  TimelineItem: 'Timeline',
  ToastRegion: 'Toast',
  ToggleGroupItem: 'ToggleGroup',
  TransferList: 'TransferList',
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
  Editor: 'Editors',
  CodeEditor: 'Editors',
  ChartBase: 'Charts',
  ChartCard: 'Charts',
  ChartContainer: 'Charts',
  ChartLegend: 'Charts',
  ChartTooltip: 'Charts',
  Dashboard: 'Charts',
  AreaChart: 'Charts',
  BarChart: 'Charts',
  LineChart: 'Charts',
  DonutChart: 'Charts',
  FunnelChart: 'Charts',
  HeatmapChart: 'Charts',
  ScatterChart: 'Charts',
  SankeyChart: 'Charts',
  NumberCard: 'Charts',
  Accordion: 'Disclosure',
  Calendar: 'Selection',
  Collapsible: 'Disclosure',
  Tabs: 'Disclosure',
  TabButtons: 'Disclosure',
  Stepper: 'Disclosure',
  ToggleGroup: 'Selection',
  Button: 'Actions',
  IconButton: 'Actions',
  Link: 'Actions',
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
  TagInput: 'Inputs',
  ColorPicker: 'Inputs',
  TransferList: 'Selection',
  PinInput: 'Inputs',
  FormControl: 'Inputs',
  FormLabel: 'Inputs',
  ErrorMessage: 'Inputs',
  Select: 'Selection',
  Combobox: 'Selection',
  CommandPalette: 'Overlays',
  MultiSelect: 'Selection',
  DatePicker: 'Selection',
  DateRangePicker: 'Selection',
  DateTimePicker: 'Selection',
  TimePicker: 'Selection',
  TimeRangePicker: 'Selection',
  FileUploader: 'Selection',
  Badge: 'Display',
  Avatar: 'Display',
  AvatarGroup: 'Display',
  Image: 'Display',
  VisuallyHidden: 'Display',
  Heading: 'Display',
  Icon: 'Display',
  Text: 'Display',
  Card: 'Display',
  Divider: 'Display',
  Carousel: 'Display',
  EmptyState: 'Display',
  Timeline: 'Display',
  Tree: 'Display',
  List: 'Display',
  ItemListRow: 'Display',
  Breadcrumbs: 'Navigation',
  Pagination: 'Navigation',
  Sidebar: 'Navigation',
  AppShell: 'Layout',
  PaneLayout: 'Layout',
  AuthLayout: 'Layout',
  MobileNav: 'Navigation',
  Dialog: 'Overlays',
  BottomSheet: 'Overlays',
  Popover: 'Overlays',
  HoverCard: 'Overlays',
  Tooltip: 'Overlays',
  ScrollArea: 'Overlays',
  SettingsDialog: 'Patterns',
  // Organisms — composed page regions rather than single controls.
  AppSidebar: 'Layout',
  PageToolbar: 'Layout',
  DetailHeader: 'Layout',
  KanbanBoard: 'Layout',
  FilterBar: 'Data',
  StatGrid: 'Data',
  DataTable: 'Data',
  DataState: 'Data',
  ScrollTable: 'Data',
  Section: 'Layout',
  SelectionBar: 'Data',
  Table: 'Data',
  VirtualList: 'Data',
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
  'Charts',
  'Editors',
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

/** part name → component, package entrypoint and source. */
const partsByComponent = new Map<string, string[]>()
const importOf = new Map<string, string>()
const sourceOf = new Map<string, string>()
for (const [file, parts] of Object.entries(api)) {
  const pkg = file.split('/')[1]
  const packageName = pkg ? `@talelk/newui-${pkg}` : '@talelk/newui-atoms'
  const source = path.relative(root, path.dirname(path.join(root, file)))
  for (const part of Object.keys(parts)) {
    const component = componentOf(part)
    if (!component) continue
    const list = partsByComponent.get(component) ?? []
    list.push(part)
    partsByComponent.set(component, list)
    importOf.set(component, packageName)
    sourceOf.set(component, source)
  }
}

/** A spec file per component, by kebab name, for the "contract" link. */
const specDir = path.join(root, 'spec')
const specSlugs = new Set(
  readdirSync(specDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, '')),
)

/** Follow the package barrels to the actual declarations they expose. */
function barrelExports(file: string): Set<string> {
  const exported = new Set<string>()
  const visited = new Set<string>()
  const resolve = (base: string): string | undefined =>
    [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      path.join(base, 'index.ts'),
      path.join(base, 'index.tsx'),
    ].find((candidate) => existsSync(candidate) && statSync(candidate).isFile())

  const visit = (filename: string) => {
    const resolved = resolve(filename)
    if (!resolved || visited.has(resolved)) return
    visited.add(resolved)
    const source = readFileSync(resolved, 'utf8')
    const directory = path.dirname(resolved)
    for (const match of source.matchAll(
      /^export\s+\*\s+from\s+['"]([^'"]+)['"]/gm,
    )) {
      const specifier = match[1]
      if (specifier?.startsWith('.')) visit(path.resolve(directory, specifier))
    }
    for (const match of source.matchAll(
      /^export\s*\{([^}]+)\}\s*(?:from\s+['"]([^'"]+)['"])?/gm,
    )) {
      const members = match[1] ?? ''
      const specifier = match[2]
      if (specifier?.startsWith('.')) {
        visit(path.resolve(directory, specifier))
      } else {
        for (const member of members.split(',')) {
          const name = member
            .trim()
            .split(/\s+as\s+/)
            .at(-1)
            ?.trim()
          if (name && name !== 'type')
            exported.add(name.replace(/^type\s+/, ''))
        }
      }
    }
    for (const match of source.matchAll(
      /^export\s+(?:declare\s+)?(?:async\s+)?(?:function|const|let|var|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm,
    )) {
      if (match[1]) exported.add(match[1])
    }
  }

  visit(path.join(root, file))
  return exported
}

const exportedByPackage = new Map<string, Set<string>>([
  ['@talelk/newui-atoms', barrelExports('packages/atoms/src/index.ts')],
  ['@talelk/newui-molecules', barrelExports('packages/molecules/src/index.ts')],
  ['@talelk/newui-organisms', barrelExports('packages/organisms/src/index.ts')],
  ['@talelk/newui-templates', barrelExports('packages/templates/src/index.ts')],
  ['@talelk/newui-charts', barrelExports('packages/charts/src/index.ts')],
  ['@talelk/newui-editor', barrelExports('packages/editor/src/index.ts')],
  [
    '@talelk/newui-code-editor',
    barrelExports('packages/code-editor/src/index.ts'),
  ],
])

const SPEC_ALIASES: Record<string, string> = {
  DatePicker: 'datepicker',
  DateTimePicker: 'datetime-picker',
  TimePicker: 'timepicker',
  MultiSelect: 'multiselect',
  FormControl: 'form',
  FormLabel: 'form',
  ErrorMessage: 'form',
  TextInput: 'inputs',
  Textarea: 'inputs',
  Editor: 'editor',
  CodeEditor: 'code-editor',
  ChartBase: 'charts',
  ChartCard: 'charts',
  ChartContainer: 'charts',
  ChartLegend: 'charts',
  ChartTooltip: 'charts',
  Dashboard: 'charts',
  AreaChart: 'charts',
  BarChart: 'charts',
  LineChart: 'charts',
  DonutChart: 'charts',
  FunnelChart: 'charts',
  HeatmapChart: 'charts',
  ScatterChart: 'charts',
  SankeyChart: 'charts',
  NumberCard: 'charts',
}
for (const [packageName, exported] of exportedByPackage) {
  for (const name of exported) {
    if (GROUPS[name] && !partsByComponent.has(name)) {
      partsByComponent.set(name, [])
      importOf.set(name, packageName)
      const sourcePackage = packageName.replace('@talelk/newui-', '')
      sourceOf.set(name, `packages/${sourcePackage}/src`)
    }
  }
}
/**
 * One-line purposes for components that share a contract file. Without
 * these, every chart would inherit the package sentence verbatim.
 */
const PURPOSE_OVERRIDES: Record<string, string> = {
  AreaChart: 'Filled line series for change over time.',
  BarChart: 'Bars for comparing categories and series.',
  ChartBase: 'The shared ECharts host every chart renders through.',
  ChartCard: 'The bordered card a chart sits in, with title chrome.',
  ChartContainer: 'Sizing, loading and empty states around a chart.',
  ChartLegend: 'Series legend with hover emphasis.',
  ChartTooltip: 'The formatted hover card for chart values.',
  Dashboard: 'A ready-made grid of KPI cards and charts.',
  DonutChart: 'Part-to-whole shares as a ring.',
  FunnelChart: 'Stage-by-stage conversion drop-off.',
  HeatmapChart: 'Density across two categorical axes.',
  LineChart: 'Line series for trends and comparisons.',
  NumberCard: 'One KPI: value, delta, target and sparkline.',
  SankeyChart: 'Flows and their magnitudes between nodes.',
  ScatterChart: 'Point clouds for correlation and outliers.',
  FormControl: 'Wires a label, control and error together (P5).',
  FormLabel: 'The label half of the shared labelling contract (P5).',
  ErrorMessage: 'The inline error half of the labelling contract (P5).',
  TextInput: 'Single-line text value with the shared labelling contract.',
  Textarea: 'Multi-line text value with the shared labelling contract.',
  Toast: 'Transient notifications, mounted once via the Toaster.',
  VisuallyHidden: 'VisuallyHidden',
}

/** Compact summaries are derived from contracts, which remain authoritative. */
function purposeFor(component: string): string {
  const override = PURPOSE_OVERRIDES[component]
  if (override) return override
  const slug = SPEC_ALIASES[component] ?? kebab(component)
  if (!specSlugs.has(slug))
    return `${GROUPS[component]} for application interfaces.`
  const markdown = readFileSync(path.join(root, 'spec', `${slug}.md`), 'utf8')
  const paragraph =
    markdown
      .split(/\n\s*\n/)
      .find((part) => !/^(?:#{1,6}\s|\||```|>|[-*]\s)/.test(part.trim())) ?? ''
  const text = paragraph
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const sentence = (text.match(/^.*?[.!?](?:\s|$)/)?.[0] ?? text).trim()
  // Index rows already print the name; a leading "Button — " repeats it.
  const withoutName = sentence.startsWith(`${component} — `)
    ? sentence.slice(component.length + 3)
    : sentence
  const capitalised = withoutName.charAt(0).toUpperCase() + withoutName.slice(1)
  if (capitalised.length <= 150) return capitalised
  const cut = capitalised.slice(0, 149)
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`
}

const entries = [...partsByComponent.keys()]
  .filter((component) => GROUPS[component])
  .map((component) => ({
    name: component,
    description: purposeFor(component),
    slug: kebab(component),
    group: GROUPS[component] as string,
    package: importOf.get(component) ?? '@talelk/newui-atoms',
    source:
      sourceOf.get(component) ??
      `packages/${(importOf.get(component) ?? '@talelk/newui-atoms').replace('@talelk/newui-', '')}/src`,
    /** One level, assigned exhaustively by `scripts/atomic.ts`. */
    atomic: atomicOf(component),
    parts: (partsByComponent.get(component) ?? []).sort(),
    spec: specSlugs.has(SPEC_ALIASES[component] ?? kebab(component))
      ? (SPEC_ALIASES[component] ?? kebab(component))
      : null,
    /** A page exists only for something its owning package barrel exports. */
    shipped:
      exportedByPackage
        .get(importOf.get(component) ?? '@talelk/newui-atoms')
        ?.has(component) ?? false,
  }))
  .sort((a, b) => {
    const byGroup = GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group)
    return byGroup !== 0 ? byGroup : a.name.localeCompare(b.name)
  })

const unresolved = entries.filter((entry) => entry.shipped && !entry.spec)
if (unresolved.length)
  throw new Error(
    `Missing contracts: ${unresolved.map((entry) => entry.name).join(', ')}`,
  )

const registry = `/**
 * Generated by \`pnpm site\`. Do not edit.
 *
 * One entry per documented component. \`parts\` are the prop interfaces that
 * belong to it, so a reference page can show a table per part without loading
 * every table in the library.
 */
export interface ComponentEntry {
  name: string
  description: string
  slug: string
  group: string
  package: string
  source: string
  /** The atomic level this entry is filed under. */
  atomic: 'atom' | 'molecule' | 'organism' | 'template'
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

/** One level of the atomic hierarchy: what an index lists and pages through. */
export function byAtomic(
  atomic: ComponentEntry['atomic'],
): ComponentEntry[] {
  return COMPONENTS.filter((entry) => entry.atomic === atomic)
}

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

/**
 * The release history, as data.
 *
 * Released sections are parsed from each package's CHANGELOG.md; the pending
 * block comes from the `.changeset/` directory, so the page is true both
 * between releases (what is queued) and after one (what shipped). The
 * masthead's version chip and `/changelog` both read this file.
 */
const changelogPackages = readdirSync(path.join(root, 'packages')).filter(
  (name) => existsSync(path.join(root, 'packages', name, 'CHANGELOG.md')),
)
const released = changelogPackages.flatMap((name) => {
  const pkg = JSON.parse(
    readFileSync(path.join(root, 'packages', name, 'package.json'), 'utf8'),
  ) as { name: string; version: string }
  const markdown = readFileSync(
    path.join(root, 'packages', name, 'CHANGELOG.md'),
    'utf8',
  )
  const sections = [...markdown.matchAll(/^## ([^\n]+)$/gm)].map((match) => ({
    version: match[1].trim(),
    body: markdown
      .slice(
        match.index + match[0].length,
        markdown.indexOf('\n## ', match.index),
      )
      .trim(),
  }))
  return { package: pkg.name, version: pkg.version, sections }
})
const pending = readdirSync(path.join(root, '.changeset'))
  .filter((file) => file.endsWith('.md') && file !== 'README.md')
  .flatMap((file) => {
    const source = readFileSync(path.join(root, '.changeset', file), 'utf8')
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
    const bumps = [
      ...frontmatter.matchAll(/^"@talelk\/([a-z-]+)": (major|minor|patch)$/gm),
    ]
    const summary = source.slice(source.indexOf('---', 3) + 3).trim()
    return bumps.map((bump) => ({
      package: `@talelk/newui-${bump[1]}`,
      bump: bump[2],
      summary,
      file,
    }))
  })
write(
  path.join(outDir, 'changelog.ts'),
  `/**
 * Generated by 'pnpm site' from the packages' CHANGELOG.md files and the
 * pending .changeset/ entries. Do not edit; regenerate.
 */
export interface ReleasedSection {
  version: string
  body: string
}

export interface ReleasedPackage {
  package: string
  version: string
  sections: ReleasedSection[]
}

export interface PendingChange {
  package: string
  bump: 'major' | 'minor' | 'patch'
  summary: string
  file: string
}

export const RELEASED: ReleasedPackage[] = ${JSON.stringify(released, null, 2)}

export const PENDING: PendingChange[] = ${JSON.stringify(pending, null, 2)}
`,
)

// One value, its own module: the masthead renders it on every route, and a
// route budget dies if that drags the full changelog bodies along.
write(
  path.join(outDir, 'version.ts'),
  `/** Generated by 'pnpm site' — the atoms package leads the kit. */
export const LIBRARY_VERSION = ${JSON.stringify(
    JSON.parse(
      readFileSync(path.join(root, 'packages/atoms/package.json'), 'utf8'),
    ).version,
  )}
`,
)

write(path.join(outDir, 'components.ts'), registry)

/**
 * The atomic design, as data.
 *
 * One row per level, in reading order, with the count taken from the registry
 * rather than restated by hand. Three consumers read it — the architecture
 * page, the home page's ladder strip and the sidebar's section counts — so the
 * three cannot disagree about how big "Components" is.
 */
const semanticTokenCount = Object.values(semanticColors.light).reduce(
  (total, category) => total + Object.keys(category).length,
  0,
)
const applications = EXAMPLES

const ladder = `/**
 * Generated by \`pnpm site\`. Do not edit.
 *
 * The ladder, in atomic design's terms: foundations → atoms → molecules →
 * organisms → templates → pages. Each level answers one question, may import
 * only downward, and counts itself from the registry so no page restates it.
 */
export interface LadderLevel {
  key:
    | 'foundations'
    | 'atoms'
    | 'molecules'
    | 'organisms'
    | 'templates'
    | 'pages'
  title: string
  /** The one question this level answers. */
  question: string
  /** What a single entry at this level is called. */
  unit: string
  package: string
  count: number
  href: string
  blurb: string
}

export const LADDER: LadderLevel[] = ${JSON.stringify(
  [
    {
      key: 'foundations',
      title: 'Foundations',
      question: 'What does it look like?',
      unit: 'token',
      package: '@talelk/newui-tokens',
      count: semanticTokenCount,
      href: '/foundations',
      blurb:
        'Colour, type, radius, elevation, focus and motion — the vocabulary every class is spelled in.',
    },
    {
      key: 'atoms',
      title: 'Atoms',
      question: 'What is this single element?',
      unit: 'atom',
      package: '@talelk/newui-atoms',
      count: entries.filter((entry) => entry.atomic === 'atom').length,
      href: '/atoms',
      blurb:
        'One control or mark, with nothing else inside: a Button, an input, a Badge, the scroll viewport itself.',
    },
    {
      key: 'molecules',
      title: 'Molecules',
      question: 'What is this interaction?',
      unit: 'molecule',
      package: '@talelk/newui-molecules · @talelk/newui-charts',
      count: entries.filter((entry) => entry.atomic === 'molecule').length,
      href: '/molecules',
      blurb:
        'Atoms assembled into one interaction: a field, a picker, a menu, a card, a chart legend.',
    },
    {
      key: 'organisms',
      title: 'Organisms',
      question: 'What is this section?',
      unit: 'organism',
      package:
        '@talelk/newui-organisms · @talelk/newui-charts · @talelk/newui-editor',
      count: entries.filter((entry) => entry.atomic === 'organism').length,
      href: '/organisms',
      blurb:
        'Self-contained regions of a page: a sidebar, a filter bar, a board, a chart, an editor.',
    },
    {
      key: 'templates',
      title: 'Templates',
      question: 'How does the page open?',
      unit: 'template',
      package: '@talelk/newui-templates',
      count: entries.filter((entry) => entry.atomic === 'template').length,
      href: '/templates',
      blurb:
        'The arrangement: a frame, a title block, a navigation column, and where the content scrolls.',
    },
    {
      key: 'pages',
      title: 'Pages',
      question: 'What does the product do?',
      unit: 'page',
      package: 'apps/playground',
      count: applications.length,
      href: '/pages',
      blurb:
        'Whole screens wired to real state — the acceptance surface every level above is proved on.',
    },
  ],
  null,
  2,
)}
`
write(path.join(outDir, 'ladder.ts'), ladder)

/**
 * The same counts without the prose. The sidebar renders them on *every* route,
 * so it must not import `ladder.ts` — the blurbs would ride along in the shell
 * and every route's budget would pay for a paragraph it never shows.
 */
const counts = `/**
 * Generated by \`pnpm site\`. Do not edit.
 *
 * One number per level, for the shell. \`ladder.ts\` carries the prose; this
 * file is what the sidebar can afford to import on every route.
 */
export const LADDER_COUNTS = ${JSON.stringify(
  {
    foundations: semanticTokenCount,
    atoms: entries.filter((entry) => entry.atomic === 'atom').length,
    molecules: entries.filter((entry) => entry.atomic === 'molecule').length,
    organisms: entries.filter((entry) => entry.atomic === 'organism').length,
    templates: entries.filter((entry) => entry.atomic === 'template').length,
    pages: applications.length,
  },
  null,
  2,
)} as const
`
write(path.join(outDir, 'counts.ts'), counts)

// Reconcile actual exported declarations, including compound parts and helpers.
// A documented destination is inventory evidence, never behavior acceptance.
const project = new Project({
  tsConfigFilePath: path.join(root, 'packages/atoms/tsconfig.json'),
})

// Follow the actual local source graph, including lazy layouts and type imports.
// Store paths only: Vite serves the originals as lazy raw modules, never copies.
const appRoot = path.join(root, 'apps/playground/src')
const sourcesOutDir = path.join(outDir, 'sources')
if (!isCheck) rmSync(sourcesOutDir, { recursive: true, force: true })
else if (existsSync(sourcesOutDir)) {
  for (const file of readdirSync(sourcesOutDir)) {
    if (!Object.hasOwn(APPLICATION_FILES, file.replace(/\.json$/, '')))
      stale.push(path.relative(root, path.join(sourcesOutDir, file)))
  }
}
for (const [slug, entry] of Object.entries(APPLICATION_FILES)) {
  const visited = new Set<string>()
  const dependencies = new Set<string>()
  function visit(relative: string) {
    if (visited.has(relative)) return
    visited.add(relative)
    const file = path.join(appRoot, relative)
    if (!/\.[cm]?[jt]sx?$/.test(file)) return
    const source = project.addSourceFileAtPath(file)
    const imports = [
      ...source
        .getImportDeclarations()
        .map((item) => item.getModuleSpecifierValue()),
      ...source
        .getExportDeclarations()
        .flatMap((item) => item.getModuleSpecifierValue() ?? []),
      ...source
        .getDescendantsOfKind(SyntaxKind.CallExpression)
        .flatMap((call) => {
          const argument = call.getArguments()[0]
          if (call.getExpression().getKind() !== SyntaxKind.ImportKeyword)
            return []
          if (!argument || !Node.isStringLiteral(argument))
            throw new Error(
              `Application source requires a literal lazy import: ${relative}:${call.getStartLineNumber()}`,
            )
          return [argument.getLiteralText()]
        }),
    ]
    for (const specifier of imports) {
      if (!specifier.startsWith('.')) {
        dependencies.add(
          specifier.startsWith('@')
            ? specifier.split('/').slice(0, 2).join('/')
            : (specifier.split('/')[0] ?? specifier),
        )
        continue
      }
      const base = path.resolve(path.dirname(file), specifier)
      const resolved = [
        base,
        `${base}.ts`,
        `${base}.tsx`,
        path.join(base, 'index.ts'),
        path.join(base, 'index.tsx'),
      ].find(
        (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
      )
      if (!resolved?.startsWith(`${appRoot}${path.sep}`))
        throw new Error(
          `Unresolved application source ${relative}: ${specifier}`,
        )
      visit(path.relative(appRoot, resolved))
    }
  }
  visit(entry)
  write(
    path.join(outDir, 'sources', `${slug}.json`),
    `${JSON.stringify({ files: [...visited], packages: [...dependencies].sort() }, null, 2)}\n`,
  )
}
const packages = [
  'atoms',
  'molecules',
  'organisms',
  'templates',
  'charts',
  'editor',
  'code-editor',
  'icons',
  'tokens',
  'tailwind',
  'vite',
]
const inventory = packages.flatMap((pkg) => {
  const manifest = JSON.parse(
    readFileSync(path.join(root, `packages/${pkg}/package.json`), 'utf8'),
  ) as { exports: Record<string, Record<string, string>> }
  const target =
    manifest.exports['.']?.['types'] ?? manifest.exports['./source']?.['types']
  if (!target) return []
  const file = path.join(root, `packages/${pkg}/${target}`)
  let source = project.getSourceFile(file)
  if (!source) {
    try {
      source = project.addSourceFileAtPath(file)
    } catch {
      return []
    }
  }
  const declarations = [...source.getExportedDeclarations()].flatMap(
    ([name, declarations]) => {
      const declaration = declarations[0]
      const initializer =
        declaration && Node.isVariableDeclaration(declaration)
          ? declaration.getInitializer()
          : undefined
      const parts =
        initializer && Node.isObjectLiteralExpression(initializer)
          ? initializer
              .getProperties()
              .flatMap((property) =>
                'getName' in property
                  ? [[`${name}.${property.getName()}`, [property]] as const]
                  : [],
              )
          : []
      return [[name, declarations] as const, ...parts]
    },
  )
  return declarations
    .map(([name, declarations]) => {
      const declaration = declarations[0]
      const implementation = declaration
        ? path.relative(root, declaration.getSourceFile().getFilePath())
        : null
      const family = entries.find(
        (entry) =>
          entry.package === `@talelk/newui-${pkg}` &&
          (entry.name === name ||
            entry.parts.includes(name) ||
            implementation?.includes(`/${entry.name}/`)),
      )
      const section = family ? `${family.atomic}s` : 'organisms'
      return {
        package: `@talelk/newui-${pkg}`,
        name,
        implementation,
        documentation: family ? `/${section}/${family.slug}` : `/docs#${pkg}`,
        contract: family?.spec ? `spec/${family.spec}.md` : null,
        tests: implementation
          ? readdirSync(path.dirname(path.join(root, implementation)))
              .filter((file) =>
                /\.(test|browser.test|a11y.test|ssr.test)\.tsx?$/.test(file),
              )
              .map((file) => path.join(path.dirname(implementation), file))
          : [],
        acceptance: 'pending' as const,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
})
write(
  path.join(outDir, 'surface-inventory.json'),
  `${JSON.stringify(inventory, null, 2)}\n`,
)

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
