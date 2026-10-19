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
 *  3. **Source manifests and acceptance inventories** — paths to application
 *     source dependencies and actual public/reference surfaces. Text stays in
 *     the original modules and contracts; nothing here copies their contents.
 *
 * `--check` regenerates in memory and fails on drift, the same gate `api:check`
 * and `css:check` are.
 */
import { createHash } from 'node:crypto'
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
import { REFERENCE_EXAMPLES } from '../apps/playground/src/lib/reference-examples'

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
  CollapsibleTrigger: 'Collapsible',
  CollapsibleContent: 'Collapsible',
  PopoverRoot: 'Popover',
  MenuRoot: 'Menu',
  MenuItem: 'Menu',
  ScrollAreaRoot: 'ScrollArea',
  ScrollAreaViewport: 'ScrollArea',
  ScrollAreaScrollbar: 'ScrollArea',
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
  Collapsible: 'Disclosure',
  Tabs: 'Disclosure',
  TabButtons: 'Disclosure',
  ToggleGroup: 'Selection',
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
  CommandPalette: 'Overlays',
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
  ResponsiveShell: 'Layout',
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
  KanbanBoard: 'Layout',
  FilterBar: 'Data',
  StatGrid: 'Data',
  AuthCard: 'Patterns',
  Alert: 'Feedback',
  Progress: 'Feedback',
  ProgressCircle: 'Feedback',
  Spinner: 'Feedback',
  Skeleton: 'Feedback',
  LoadingText: 'Feedback',
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

/** part name → the component it belongs to, and the package it came from. */
const partsByComponent = new Map<string, string[]>()
const packageOf = new Map<string, 'component' | 'block'>()
const importOf = new Map<string, string>()
for (const [file, parts] of Object.entries(api)) {
  const kind = file.includes('/blocks/') ? 'block' : 'component'
  for (const part of Object.keys(parts)) {
    const component = componentOf(part)
    if (!component) continue
    const list = partsByComponent.get(component) ?? []
    list.push(part)
    partsByComponent.set(component, list)
    packageOf.set(component, kind)
    const pkg = file.split('/')[1]
    importOf.set(component, `@newui/${pkg}`)
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
for (const name of [...exported, ...exportedBlocks]) {
  if (GROUPS[name] && !partsByComponent.has(name)) {
    partsByComponent.set(name, [])
    packageOf.set(name, exportedBlocks.has(name) ? 'block' : 'component')
    importOf.set(name, exportedBlocks.has(name) ? '@newui/blocks' : '@newui/ui')
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
    package: importOf.get(component) ?? '@newui/ui',
    source:
      importOf.get(component) === '@newui/ui'
        ? `packages/ui/src/components/${component}`
        : importOf.get(component) === '@newui/blocks'
          ? `packages/blocks/src/${component}`
          : importOf.get(component) === '@newui/charts'
            ? `packages/charts/src/${component}.tsx`
            : `packages/${importOf.get(component)?.replace('@newui/', '')}/src`,
    /** `component` (an atom or molecule) or `block` (a composed section). */
    kind: packageOf.get(component) ?? 'component',
    parts: (partsByComponent.get(component) ?? []).sort(),
    spec: specSlugs.has(SPEC_ALIASES[component] ?? kebab(component))
      ? (SPEC_ALIASES[component] ?? kebab(component))
      : null,
    /** A page exists only for something a barrel exports. */
    shipped:
      importOf.get(component) !== '@newui/ui' &&
      importOf.get(component) !== '@newui/blocks'
        ? true
        : packageOf.get(component) === 'block'
          ? exportedBlocks.has(component)
          : exported.has(component),
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

// Reconcile actual exported declarations, including compound parts and helpers.
// A documented destination is inventory evidence, never behavior acceptance.
const project = new Project({
  tsConfigFilePath: path.join(root, 'packages/ui/tsconfig.json'),
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
  'ui',
  'blocks',
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
          entry.package === `@newui/${pkg}` &&
          (entry.name === name ||
            entry.parts.includes(name) ||
            implementation?.includes(`/components/${entry.name}/`)),
      )
      const section =
        family?.kind === 'block'
          ? 'blocks'
          : family?.group === 'Charts'
            ? 'charts'
            : family?.group === 'Editors'
              ? 'editors'
              : 'components'
      return {
        package: `@newui/${pkg}`,
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

const referenceFile = path.join(outDir, 'reference-inventory.json')
type ReferenceSurface = {
  source: string
  implementation: string
  documentation: string
  tests: string[]
  digest?: string
  controls?: { line: number; element: string; source: string }[]
  acceptance: 'pending'
}
const previousReferences: ReferenceSurface[] = existsSync(referenceFile)
  ? JSON.parse(readFileSync(referenceFile, 'utf8'))
  : []
const families = [
  'Tasks',
  'Mail',
  'Files',
  'Deals',
  'Tickets',
  'Accounting',
  'Compose',
  'Discussions',
]
const references: ReferenceSurface[] = [
  ...['dashboard', 'authentication', 'cards', 'mail', 'tasks'].map((name) => ({
    source: `references/solid-ui-main/apps/docs/src/components/${name}/index.tsx`,
    implementation: `apps/playground/src/pages/${({ dashboard: 'Analytics', authentication: 'Authentication', cards: 'Cards', mail: 'Mail', tasks: 'Tasks' } as Record<string, string>)[name]}.tsx`,
    documentation: `/examples/${name === 'dashboard' ? 'analytics' : name}`,
    tests: [
      `e2e/${({ dashboard: 'analytics', authentication: 'example-patterns', cards: 'example-patterns', mail: 'mail', tasks: 'tasks' } as Record<string, string>)[name]}.spec.ts`,
    ],
    acceptance: 'pending' as const,
  })),
  ...families.flatMap((name) =>
    ['Desktop', 'Mobile'].map((viewport) => ({
      source: `references/frappe-ui-main/docs/components/recipes/${name}${viewport}.vue`,
      implementation: `apps/playground/src/pages/${name}.tsx`,
      documentation: `/examples/${name.toLowerCase()}`,
      tests: [
        `e2e/${({ Tasks: 'tasks', Mail: 'mail', Compose: 'compose', Discussions: 'discussions-settings' } as Record<string, string>)[name] ?? 'business-recipes'}.spec.ts`,
      ],
      acceptance: 'pending' as const,
    })),
  ),
  ...REFERENCE_EXAMPLES.map((entry) => ({
    source: `references/solid-ui-main/apps/docs/src/registry/example/${entry.source}.tsx`,
    implementation: entry.implementation,
    documentation: entry.href,
    tests: ['e2e/reference-patterns.spec.ts'],
    acceptance: 'pending' as const,
  })),
  ...['sidebar-01/index', 'demo-sidebar'].map((name) => ({
    source: `references/solid-ui-main/apps/docs/src/registry/block/${name}.tsx`,
    implementation: `apps/playground/src/demos/${name.split('/')[0]}.tsx`,
    documentation: `/blocks/compositions/${name.split('/')[0]}`,
    tests: ['e2e/responsive-preview.spec.ts'],
    acceptance: 'pending' as const,
  })),
]
for (const entry of references) {
  const file = path.join(root, entry.source)
  if (!existsSync(file)) {
    const prior = previousReferences.find(
      (item) => item.source === entry.source,
    )
    entry.digest = prior?.digest
    entry.controls = prior?.controls
    continue
  }
  const source = readFileSync(file, 'utf8')
  entry.digest = createHash('sha256').update(source).digest('hex')
  entry.controls = [
    ...source.matchAll(
      /<(?:Button|button|input|select|textarea|[A-Z][\w.]*(?:Item|Trigger|Select|Input|Switch|Checkbox|Tab|Menu))\b[^>]*>/g,
    ),
  ].map((match) => ({
    line: source.slice(0, match.index).split('\n').length,
    element: /^<([\w.]+)/.exec(match[0])?.[1] ?? '',
    source: match[0],
  }))
}
write(referenceFile, `${JSON.stringify(references, null, 2)}\n`)

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
