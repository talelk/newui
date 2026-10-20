/**
 * The atomic classification, in one place.
 *
 * Atomic design asks a compositional question, not a packaging one: *how much
 * is this made of?* The kit already sorts by package (`ui`, `blocks`, `layouts`),
 * which is how it is built; this sorts by what a unit **is**, which is how it is
 * chosen. The two mostly agree — every block is an organism, every layout a
 * template — and the interesting cases are the ones where they don't.
 *
 * The rule, applied in this order:
 *
 *  - **template** — arranges a page: a shell or a page layout. It may contain
 *    everything below and is the thing a route mounts.
 *  - **organism** — a independent *region* of a page: a sidebar, a block, a
 *    chart widget, an editor, a full search surface. It owns state and usually
 *    has its own accessible name.
 *  - **atom** — one element or control, with no other kit component inside it:
 *    a button, a mark, an input, a label, the scroll viewport itself.
 *  - **molecule** — one interaction or small unit assembled from atoms: a field,
 *    a picker, a menu, a card, a list row, a dialog shell, a chart's legend.
 *
 * The lists below are the judgement calls; anything unlisted is a molecule,
 * because a component that composes at all is one. A page is not in the
 * registry: pages are the examples, counted from the catalog.
 */

export type AtomicLevel = 'atom' | 'molecule' | 'organism' | 'template'

export interface Classifiable {
  name: string
  kind: 'component' | 'block' | 'layout'
  group: string
}

/** One element or control; no other kit component inside. */
const ATOMS = new Set([
  'Avatar',
  'Badge',
  'Button',
  'Checkbox',
  'Divider',
  'Duration',
  'ErrorMessage',
  'FormLabel',
  'Icon',
  'KeyboardShortcut',
  'Progress',
  'ProgressCircle',
  'ScrollArea',
  'Skeleton',
  'Slider',
  'Spinner',
  'Switch',
  'TextInput',
  'Textarea',
  'Tooltip',
])

/**
 * Regions of a page, and the packages whose widgets are regions.
 *
 * Charts and editors ship from their own packages, so the *package* says
 * "component" where the composition says "organisms": a bar chart with axes,
 * a legend and a tooltip is a widget, and a rich-text editor is a surface.
 * Their scaffolding (`ChartBase`, `ChartLegend`, `ChartTooltip`, `ChartCard`,
 * `NumberCard`) stays molecular — those are parts of the widget.
 */
const ORGANISMS = new Set([
  'Sidebar',
  'MobileNav',
  'CommandPalette',
  'SettingsDialog',
  'AreaChart',
  'BarChart',
  'Dashboard',
  'DonutChart',
  'FunnelChart',
  'HeatmapChart',
  'LineChart',
  'SankeyChart',
  'ScatterChart',
  'CodeEditor',
  'Editor',
])

/** Page arrangement that lives in `@newui/ui` (the layouts do too, by kind). */
const TEMPLATES = new Set([
  'AppShell',
  'DesktopShell',
  'MobileShell',
  'ResponsiveShell',
])

export const ATOMIC_LEVELS: AtomicLevel[] = [
  'atom',
  'molecule',
  'organism',
  'template',
]

export function atomicOf(entry: Classifiable): AtomicLevel {
  if (entry.kind === 'layout') return 'template'
  if (entry.kind === 'block') return 'organism'
  if (TEMPLATES.has(entry.name)) return 'template'
  if (ORGANISMS.has(entry.name)) return 'organism'
  if (ATOMS.has(entry.name)) return 'atom'
  return 'molecule'
}

/** The classification, for the tests that pin it. */
export const CLASSIFICATION = { ATOMS, ORGANISMS, TEMPLATES }
