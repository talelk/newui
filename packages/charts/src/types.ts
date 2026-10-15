import type { JSX } from 'solid-js'

/**
 * The public vocabulary of `@newui/charts`, ported from `frappe-ui`'s chart
 * family. The prop shapes are kept close to the Vue originals so a chart reads
 * the same way; the mechanics are Solid.
 *
 * Two layers are declared here:
 *
 *  - the **props** a component takes (what a caller writes), and
 *  - the **config** the pure option builders take (what a component normalizes
 *    its props into). Keeping them separate is what lets `options.ts` be tested
 *    without a DOM, a component or echarts.
 */

export type ChartDir = 'ltr' | 'rtl'

/** What a series draws as. Every cartesian chart can hold every mark. */
export const CHART_MARKS = ['bar', 'line', 'area'] as const
export type ChartMark = (typeof CHART_MARKS)[number]

export type ChartPaletteName = 'sequential' | 'categorical' | 'diverging'

/**
 * Which ramp series colors come from, or an explicit list of colors to cycle.
 * Named ramps read the `--chart-*` tokens, so they follow the theme.
 */
export type ChartPalette = ChartPaletteName | string[]

/** Formats a measured value wherever it is printed. */
export type ChartValueFormatter = (value: number) => string

/** A category axis carries whatever the column holds, so its formatter takes any. */
export type ChartCategoryFormatter = (value: unknown) => string

/** Deep-merged into the generated echarts option as a last-resort escape hatch. */
export type EchartOptionsOverride = Record<string, unknown>

export type TimeGrain =
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'

export type DonutVariant = 'full' | 'half'

/** Plot-area colors as concrete strings, read back from the CSS custom properties. */
export type ChartTokens = {
  /** Root font scale, relative to 16px. Defaults to 1 for explicit token objects. */
  fontScale?: number
  /** The `--chart-1…8` categorical ramp. */
  series: string[]
  /** Gridlines: `--chart-grid`. */
  grid: string
  /** Axis lines and ticks: `--chart-axis`. */
  axis: string
  /** Axis labels: `--ink-gray-6`. */
  label: string
}

/** A visually-hidden table that carries a plot's data to a screen reader. */
export type ChartFallback = {
  columns: string[]
  rows: (string | number)[][]
}

// ---------------------------------------------------------------------------
// Per-series style. Every key is optional; the chart-level prop is the default.
// ---------------------------------------------------------------------------

export type SeriesStyle = {
  /** Display name. The series `name` stays the identity. */
  label?: string
  /** Takes this series out of the palette, e.g. to pin a brand color. */
  color?: string
  /** Mark this series draws as. Defaults to the chart component's own mark. */
  type?: ChartMark
  /** Which value axis this series is measured against. */
  axis?: 'y' | 'y2'
  /** Prints this series' values, for a unit that differs from its axis'. */
  format?: ChartValueFormatter
  /** Prints this series' value beside each of its marks. */
  showDataLabels?: boolean
  /** Groups series into separate stacks. Read only when `stacked` is on. */
  stackName?: string
  /** Breaks this series' line into a dash. */
  dashed?: boolean
  /** Marks every datapoint with a dot. */
  showDataPoints?: boolean
  /** Rounds the corners of the line instead of drawing straight segments. */
  smooth?: boolean
  /** Bridges gaps left by nulls. */
  connectNulls?: boolean
  /** Escape hatch: deep-merged into this series' echarts option. */
  echartOptions?: EchartOptionsOverride
}

// ---------------------------------------------------------------------------
// Axis charts: BarChart, LineChart, AreaChart.
// ---------------------------------------------------------------------------

export type ChartXAxisOptions = {
  /** Heads the axis, under its labels. */
  title?: string
  /**
   * Inferred: `'time'` when every value in the `x` column reads as a date,
   * `'category'` otherwise. `'value'` places each point at its own number.
   */
  type?: 'category' | 'time' | 'value'
  /** Label granularity on a time axis. Inferred from the spacing of the data. */
  timeGrain?: TimeGrain
  /** Prints each category label. */
  format?: ChartCategoryFormatter
  /** Escape hatch: deep-merged into this axis' echarts option. */
  echartOptions?: EchartOptionsOverride
}

export type ChartValueAxisOptions = {
  /** Names what the axis measures. */
  title?: string
  /** Bottom of the scale. Defaults to a round number under the data. */
  min?: number
  /** Top of the scale. Defaults to a round number over the data. */
  max?: number
  /** Prints each tick label, and every value this axis carries elsewhere. */
  format?: ChartValueFormatter
  /** Escape hatch: deep-merged into this axis' echarts option. */
  echartOptions?: EchartOptionsOverride
}

export type AxisChartProps = {
  /** The rows to plot. One row is one position on the category axis. */
  data: Record<string, unknown>[]
  /** Column holding the category or time each point sits at. */
  x: string
  /** Value column(s) measured against the primary value axis. */
  y: string | string[]
  /** Value column(s) measured against the second value axis. */
  y2?: string | string[]
  /** Keyed by series identity: a `y` or `y2` column. */
  seriesConfig?: Record<string, SeriesStyle>
  /** Prints every series' value beside its marks. */
  showDataLabels?: boolean
  /** Rounds the corners of every line. Line and area series. */
  smooth?: boolean
  /** Marks every datapoint with a dot. Line and area series. */
  showDataPoints?: boolean
  /** Breaks every series' line into a dash. Line and area series. */
  dashed?: boolean
  /** Bridges gaps left by nulls. Line and area series. */
  connectNulls?: boolean
  /** Series the legend has switched off, by name. */
  hiddenSeries?: string[]
  /** Series sum on top of each other. `'normalized'` is the 100% stack. */
  stacked?: boolean | 'normalized'
  /** Ramp series colors are drawn from. Defaults to `'sequential'`. */
  palette?: ChartPalette
  /** The category axis: its title, how `x` reads, and label format. */
  xAxis?: ChartXAxisOptions
  /** The primary value axis: its title, its range, and how a value prints. */
  yAxis?: ChartValueAxisOptions
  /** The second value axis. Only drawn when `y2` names a column. */
  y2Axis?: ChartValueAxisOptions
  /** Heads the chart. */
  title?: string
  /** A second line under the title. */
  subtitle?: string
  /** Draws the placeholder in place of the reading. */
  loading?: boolean
  /** Puts the chart in its error state and prints this message. */
  error?: string | null
  /** Plot height. A number is px; a string is used verbatim. */
  height?: number | string
  /** Root class fallthrough, merged last (P10). */
  class?: string
  /** Accessible name for the plot. */
  'aria-label'?: string
  /** Forces layout direction; defaults to document direction. */
  dir?: ChartDir
  /** Escape hatch: deep-merged into the echarts option the props built. */
  echartOptions?: EchartOptionsOverride
}

export type BarChartProps = AxisChartProps & {
  /** Bars run left-to-right; the category axis moves to Y. Bars only. */
  horizontal?: boolean
}

/** A line chart is an axis chart whose unmarked series draw as lines. */
export type LineChartProps = AxisChartProps

/** An area chart is a line chart whose unmarked series carry a fill. */
export type AreaChartProps = AxisChartProps

/** What a component normalizes `AxisChartProps` into for the option builder. */
export type AxisChartConfig = {
  /** Mark for series that name none. */
  type: ChartMark
  data: Record<string, unknown>[]
  xAxis: {
    key: string
    type?: 'category' | 'time' | 'value'
    title?: string
    format?: ChartCategoryFormatter
    echartOptions?: EchartOptionsOverride
  }
  yAxis?: ChartValueAxisOptions
  y2Axis?: ChartValueAxisOptions
  series: AxisChartSeriesConfig[]
  stacked?: boolean | 'normalized'
  horizontal?: boolean
  dir?: ChartDir
  palette?: ChartPalette
  echartOptions?: EchartOptionsOverride
}

/** A `SeriesStyle` with the identity the option builder keys everything by. */
export type AxisChartSeriesConfig = SeriesStyle & {
  /** Key in each data row that holds this series' value, and its identity. */
  name: string
}

// ---------------------------------------------------------------------------
// DonutChart.
// ---------------------------------------------------------------------------

export type DonutChartProps = {
  /** The rows to plot. One row is one slice, before the "Others" grouping. */
  data: Record<string, unknown>[]
  /** Row key holding the slice name. */
  category: string
  /** Row key holding the slice size. */
  value: string
  /**
   * How many slices the ring holds, "Others" included. Past that it keeps the
   * largest `maxSlices - 1` and sums the tail into "Others". Defaults to 9.
   */
  maxSlices?: number
  /** Slices the legend has switched off, by name. */
  hiddenSlices?: string[]
  /** Prints each slice's name and share beside the ring. */
  showDataLabels?: boolean
  /** Caption under the total in the middle. Defaults to the `value` key. */
  centerLabel?: string
  /** `'half'` draws the ring as a semicircle; only the geometry changes. */
  variant?: DonutVariant
  /** Prints the readout and the tooltip. */
  format?: ChartValueFormatter
  /** Defaults to `'categorical'`: slices are unrelated categories. */
  palette?: ChartPalette
  /** Heads the chart. */
  title?: string
  /** A second line under the title. */
  subtitle?: string
  /** Draws the placeholder in place of the reading. */
  loading?: boolean
  /** Puts the chart in its error state and prints this message. */
  error?: string | null
  /** Plot height. A number is px; a string is used verbatim. */
  height?: number | string
  /** Root class fallthrough, merged last (P10). */
  class?: string
  /** Accessible name for the plot. */
  'aria-label'?: string
  /** Forces layout direction; defaults to document direction. */
  dir?: ChartDir
  /** Escape hatch: deep-merged into the echarts option the props built. */
  echartOptions?: EchartOptionsOverride
}

export type DonutChartConfig = {
  data: Record<string, unknown>[]
  categoryColumn: string
  valueColumn: string
  maxSlices?: number
  showDataLabels?: boolean
  centerLabel?: string
  variant?: DonutVariant
  palette?: ChartPalette
  dir?: ChartDir
  echartOptions?: EchartOptionsOverride
}

/** One arc of the ring, after sorting, "Others" grouping and color assignment. */
export type DonutSlice = {
  /** Identity used by echarts and the legend. Unique within the ring. */
  name: string
  /** The category value as it should read; not unique. */
  label: string
  value: number
  /** Share of the *visible* total, so hiding a slice re-percentages the rest. */
  percent: number
  color: string
  hidden: boolean
  /** The row behind this slice, or every grouped row for "Others". */
  rows: Record<string, unknown>[]
  isOthers: boolean
}

// ---------------------------------------------------------------------------
// NumberCard.
// ---------------------------------------------------------------------------

export type NumberCardSparkline = {
  /** Oldest reading first. Gaps are skipped, not drawn as zero. */
  data: (number | null | undefined)[]
  /** The mark. `'area'` draws a line over a fill, `'line'` the stroke, `'bar'` bars. */
  type?: ChartMark
  /** Overrides the sequential-palette blue the sparkline is drawn in. */
  color?: string
}

export type NumberCardProps = {
  /** What the reading is, printed above the number. */
  title: string
  /** A string renders as given: the formatting props only apply to a number. */
  value: number | string | null
  /** Ink the reading is printed in. */
  color?: string
  /** Printed before the number, e.g. a currency sign. */
  prefix?: string
  /** Printed after the number, e.g. a unit. */
  suffix?: string
  /** What the reading is measured against, printed as a muted ` / target`. */
  target?: number | string
  /** Change against the comparison period. Sign drives the arrow. */
  delta?: number | null
  /** Unit printed before the delta, e.g. `'$'`. */
  deltaPrefix?: string
  /** Unit printed after the delta, e.g. `'%'`. */
  deltaSuffix?: string
  /** What the delta is measured against, e.g. `'vs last month'`. */
  deltaCaption?: string
  /** Flips the delta colors, for metrics like churn or cost. */
  negativeIsBetter?: boolean
  /** Prints the reading and the target. */
  format?: ChartValueFormatter
  /** Prints the delta. It takes the absolute value. */
  deltaFormat?: ChartValueFormatter
  /** A trend across the bottom of the card: shape only. */
  sparkline?: NumberCardSparkline
  /** Draws the placeholder in place of the reading. */
  loading?: boolean
  /** Switches the card into its error state and prints this message. */
  error?: string | null
  /** Root class fallthrough, merged last (P10). */
  class?: string
  /** Accessible name for the card. */
  'aria-label'?: string
}

// ---------------------------------------------------------------------------
// Shared shell: the chrome a plot draws inside, when it is not an echarts
// chart of its own (a dashboard tile, a chart an app draws itself).
// ---------------------------------------------------------------------------

export type ChartCardProps = {
  /** Draws the bordered surface. `false` leaves only the clipping box. */
  card?: boolean
  /** Forces layout direction; defaults to document direction. */
  dir?: ChartDir
  /** Root class fallthrough, merged last (P10). */
  class?: string
  /** The card's contents. The card supplies the surface and clips them. */
  children?: JSX.Element
}

/** One entry of a legend: a series' identity, its color and its visibility. */
export type ChartLegendItem = {
  /** Identity used to toggle and highlight, i.e. the series name. */
  name: string
  /** The series as it should read. */
  label: string
  color: string
  hidden?: boolean
  /** An optional trailing number, e.g. the series' total. */
  hint?: string
}

export type ChartLegendProps = {
  /** One entry per series, in the order they are drawn. */
  items: ChartLegendItem[]
  /** An entry was pressed: the named series' visibility flipped. */
  onToggle?: (name: string) => void
  /** The highlighted series, or null when the highlight clears. */
  onHighlight?: (name: string | null) => void
  /** Forces layout direction; defaults to document direction. */
  dir?: ChartDir
  /** Root class fallthrough, merged last (P10). */
  class?: string
}

export type DashboardProps = {
  /** Fixed column count. Omitted, the grid fits as many tiles as the width allows. */
  columns?: number
  /** Gap between tiles, as a number of px or a CSS length. Defaults to `1rem`. */
  gap?: number | string
  /** Root class fallthrough, merged last (P10). */
  class?: string
  /** The tiles: chart components, each drawing its own chrome. */
  children?: JSX.Element
}

// ---------------------------------------------------------------------------
// ChartContainer: the shell a plot draws inside. It is the chrome every chart
// shares — the header, the value-axis titles, the loading/error/empty states
// and the legend row — with the plot itself supplied as `children`. The
// echarts-backed charts render through it (`ChartBase`), and an app drawing its
// own plot uses it directly so the two match.
// ---------------------------------------------------------------------------

/** Edge of the plot the value-axis titles head. */
export type AxisTitlePlacement = 'top' | 'bottom'

export type ChartContainerProps = {
  /** Heads the card. Left out, the container draws no header row at all. */
  title?: string
  /** A second line under the title, e.g. the period the numbers cover. */
  subtitle?: string
  /**
   * Title of the primary value axis. The container draws it over the plot
   * rather than along the axis, where it would have to be turned sideways.
   */
  yAxisTitle?: string
  /** Title of the second value axis, drawn over the edge that axis sits on. */
  y2AxisTitle?: string
  /** Edge of the plot the value-axis titles head. Defaults to the top. */
  axisTitlePlacement?: AxisTitlePlacement
  /** Draws the placeholder in place of the plot, for data still on its way. */
  loading?: boolean
  /** Non-empty switches the container into its error state. */
  error?: string | null
  /** Draws the empty state: there is data, and it plots to nothing. */
  empty?: boolean
  /** Pins the container's height. A number is px; a string is used verbatim. */
  height?: number | string
  /** Draws the header row's trailing controls, e.g. a period picker. */
  actions?: JSX.Element
  /** Replaces the default loading placeholder, e.g. with a skeleton of its own. */
  loadingContent?: JSX.Element
  /** Replaces the default error message, e.g. to put a retry button beside it. */
  errorContent?: JSX.Element
  /** Replaces the default empty message. */
  emptyContent?: JSX.Element
  /** The row under the plot, e.g. a `ChartLegend` or a ramp scale. */
  legend?: JSX.Element
  /** Forces layout direction; defaults to document direction. */
  dir?: ChartDir
  /** Root class fallthrough, merged last (P10). */
  class?: string
  /** The plot itself, drawn into a box the container sizes and states. */
  children?: JSX.Element
}

// ---------------------------------------------------------------------------
// ChartTooltip: the reading a plot shows over a point.
// ---------------------------------------------------------------------------

/** Prints a `ChartTooltipColumn`. A column sits on no axis, so it takes no axis format. */
export type ChartTooltipFormatter = (value: number | string) => string

/** One `tooltipColumns` entry: a row key that prints in the tooltip and nowhere else. */
export type ChartTooltipColumn = {
  /** Row key. Also the label when none is given. */
  name: string
  label?: string
  /**
   * A column sits on no axis, so it takes no formatter from one. Left out, a
   * number prints with the default grouping and text prints as it stands.
   */
  format?: ChartTooltipFormatter
}

/** One row of a tooltip, after formatting and ranking. */
export type ChartTooltipItem = {
  name: string
  label: string
  /** Left out by a `'context'` item: a swatch would claim a mark on the plot. */
  color?: string
  value: number | string
  formattedValue: string
  /** Share of the total, printed after the value. Only part-to-whole charts set it. */
  percent?: number
  /**
   * `'series'` is a value the plot draws. `'context'` is a reading it does not:
   * a `tooltipColumns` entry, or a funnel stage's conversion rate.
   */
  kind: 'series' | 'context'
}

/** What a custom tooltip body reads. */
export type ChartTooltipSlotProps = {
  /** Heads the readings, e.g. the category the pointer is over. */
  label?: string
  /** One entry per reading, in the order they should be read. */
  items: ChartTooltipItem[]
  /** The rows behind the reading, so a body can read a column the plot never drew. */
  rows: Record<string, unknown>[]
}

export type ChartTooltipProps = {
  /**
   * Draws the tooltip. It is measured before it is placed, so it flips at the
   * viewport edge rather than running off it.
   */
  open: boolean
  /** Viewport x of the point the tooltip hangs off, i.e. the pointer. */
  x: number
  /** Viewport y of the point the tooltip hangs off, i.e. the pointer. */
  y: number
  /** Heads the tooltip, e.g. the category the readings below it belong to. */
  label?: string
  /** One row per reading, in the order they should be read. */
  items: ChartTooltipItem[]
  /**
   * The rows behind the reading, handed to a custom body so it can read a column
   * the plot never drew. Empty when the pointer is over an aggregate that stands
   * for no single row.
   */
  rows?: Record<string, unknown>[]
  /** Replaces the whole tooltip body, headline row included. */
  children?: (slot: ChartTooltipSlotProps) => JSX.Element
  /** Forces layout direction; defaults to document direction. */
  dir?: ChartDir
  /** Root class fallthrough, merged last (P10). */
  class?: string
}

// ---------------------------------------------------------------------------
// FunnelChart.
// ---------------------------------------------------------------------------

export type FunnelChartProps = {
  /** One row per stage, in process order. Rows are drawn as they arrive. */
  data: Record<string, unknown>[]
  /** Row key holding the stage name. */
  category: string
  /** Row key holding how many reached the stage. */
  value: string
  /** Prints every number the funnel shows: the labels and the readout. */
  format?: ChartValueFormatter
  /** Defaults to `'sequential'`, deepest last, so color darkens as it narrows. */
  palette?: ChartPalette
  /** Heads the chart. */
  title?: string
  /** A second line under the title. */
  subtitle?: string
  /** Draws the placeholder in place of the reading. */
  loading?: boolean
  /** Puts the chart in its error state and prints this message. */
  error?: string | null
  /** Plot height. A number is px; a string is used verbatim. */
  height?: number | string
  /** Root class fallthrough, merged last (P10). */
  class?: string
  /** Accessible name for the plot. */
  'aria-label'?: string
  /** Forces layout direction; defaults to document direction. */
  dir?: ChartDir
  /** Escape hatch: deep-merged into the echarts option the props built. */
  echartOptions?: EchartOptionsOverride
}

export type FunnelChartConfig = {
  data: Record<string, unknown>[]
  categoryColumn: string
  valueColumn: string
  palette?: ChartPalette
  dir?: ChartDir
  echartOptions?: EchartOptionsOverride
}

/** One stage of the funnel, after coercion and percentage arithmetic. */
export type FunnelStage = {
  index: number
  /** Identity of the stage: the category value as a string. */
  name: string
  /** The stage as it should read; `(Blank)` where the category is empty. */
  label: string
  value: number
  /** Share of the first stage, i.e. the conversion rate to here. 0-100. */
  percentOfFirst: number
  /** Share of the preceding stage. 0-100; the first stage's is 100. */
  percentOfPrevious: number
  row: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// HeatmapChart.
// ---------------------------------------------------------------------------

/**
 * Which continuous ramp cells are colored from, or an explicit list of stops.
 * Only the continuous ramps: a heatmap reads one measure across a scale, so the
 * categorical palette has nothing to say here.
 */
export type HeatmapPalette = 'sequential' | 'diverging' | string[]

/** One cut of the grid. Both are category axes, so both read the same way. */
export type HeatmapAxisOptions = {
  /** Prints each category. Takes the value the row carried. */
  format?: ChartCategoryFormatter
}

export type HeatmapChartProps = {
  /** One row per cell. Rows with no numeric value leave their cell undrawn. */
  data: Record<string, unknown>[]
  /** Row key holding the column a cell sits in. */
  x: string
  /** Row key holding the row a cell sits in. */
  y: string
  /** Row key holding the magnitude the cell is colored by. */
  value: string
  /** Bottom of the color scale. Defaults to the smallest value in the data. */
  min?: number
  /** Top of the color scale. Defaults to the largest value in the data. */
  max?: number
  /** The columns of the grid: the axis under it. */
  xAxis?: HeatmapAxisOptions
  /** The rows of the grid: the axis beside it. */
  yAxis?: HeatmapAxisOptions
  /** Prints each cell's value inside it. Labels with no room are dropped. */
  showDataLabels?: boolean
  /** Prints every number the grid shows: the cells and the scale ends. */
  format?: ChartValueFormatter
  /** Defaults to `'sequential'`; `'diverging'` centers the scale on zero. */
  palette?: HeatmapPalette
  /** Heads the chart. */
  title?: string
  /** A second line under the title. */
  subtitle?: string
  /** Draws the placeholder in place of the reading. */
  loading?: boolean
  /** Puts the chart in its error state and prints this message. */
  error?: string | null
  /** Plot height. A number is px; a string is used verbatim. */
  height?: number | string
  /** Root class fallthrough, merged last (P10). */
  class?: string
  /** Accessible name for the plot. */
  'aria-label'?: string
  /** Forces layout direction; defaults to document direction. */
  dir?: ChartDir
  /** Escape hatch: deep-merged into the echarts option the props built. */
  echartOptions?: EchartOptionsOverride
}

export type HeatmapChartConfig = {
  data: Record<string, unknown>[]
  xColumn: string
  yColumn: string
  valueColumn: string
  min?: number
  max?: number
  showDataLabels?: boolean
  palette?: HeatmapPalette
  dir?: ChartDir
  echartOptions?: EchartOptionsOverride
}

/** One drawn cell of the grid, after category indexing and color assignment. */
export type HeatmapCell = {
  /** The x category as it reads. */
  x: string
  /** The y category as it reads. */
  y: string
  xIndex: number
  yIndex: number
  value: number
  color: string
  row: Record<string, unknown>
}

/** The grid as the plot and the ramp scale both read it. */
export type HeatmapMatrix = {
  /** Columns, in the order the rows first mention them. */
  xCategories: string[]
  /** Rows, in the order the rows first mention them. Drawn top to bottom. */
  yCategories: string[]
  /** The value each x category was first named by, keyed by the category. */
  xValues: Map<string, unknown>
  /** As `xValues`, for the rows of the grid. */
  yValues: Map<string, unknown>
  cells: HeatmapCell[]
  /** Bottom of the color scale, config or data. */
  min: number
  /** Top of the color scale, config or data. */
  max: number
  /** The ramp the scale runs along, low end first. */
  stops: string[]
}

// ---------------------------------------------------------------------------
// ScatterChart.
// ---------------------------------------------------------------------------

export type ScatterChartProps = {
  /** One row per point. A row missing either coordinate draws nothing. */
  data: Record<string, unknown>[]
  /** Row key holding the horizontal measure. */
  x: string
  /** Row key holding the vertical measure. */
  y: string
  /** Row key holding the magnitude each point is sized by. */
  size?: string
  /** Splits the points into one series per distinct value. */
  splitBy?: string
  /** Row key holding the point's own name, which heads its readout. */
  label?: string
  /** Groups the legend has switched off, by name. */
  hiddenSeries?: string[]
  /** Prints the point's own name beside it. Needs `label` to have one. */
  showDataLabels?: boolean
  /** The horizontal scale. Both axes are value axes. */
  xAxis?: ChartValueAxisOptions
  /** The vertical scale. */
  yAxis?: ChartValueAxisOptions
  /** Defaults to `'categorical'`: the groups are unrelated categories. */
  palette?: ChartPalette
  /** Prints every number the chart shows. */
  format?: ChartValueFormatter
  /** Heads the chart. */
  title?: string
  /** A second line under the title. */
  subtitle?: string
  /** Draws the placeholder in place of the reading. */
  loading?: boolean
  /** Puts the chart in its error state and prints this message. */
  error?: string | null
  /** Plot height. A number is px; a string is used verbatim. */
  height?: number | string
  /** Root class fallthrough, merged last (P10). */
  class?: string
  /** Accessible name for the plot. */
  'aria-label'?: string
  /** Forces layout direction; defaults to document direction. */
  dir?: ChartDir
  /** Escape hatch: deep-merged into the echarts option the props built. */
  echartOptions?: EchartOptionsOverride
}

export type ScatterChartConfig = {
  data: Record<string, unknown>[]
  xColumn: string
  yColumn: string
  sizeColumn?: string
  splitByColumn?: string
  labelColumn?: string
  showDataLabels?: boolean
  xAxis?: ChartValueAxisOptions
  yAxis?: ChartValueAxisOptions
  palette?: ChartPalette
  dir?: ChartDir
  echartOptions?: EchartOptionsOverride
}

/** One drawn point, after coercion and size scaling. */
export type ScatterPoint = {
  x: number
  y: number
  /** The magnitude behind the symbol. Null when the chart has no size column. */
  size: number | null
  /** Symbol diameter in px: the magnitude mapped into the readable range. */
  symbolSize: number
  /** The point's own name, when the config names a label column. */
  label?: string
  row: Record<string, unknown>
}

/** One group of points, i.e. one value of `splitBy`. */
export type ScatterSeries = {
  /** The grouping value as it reads, or the y column when nothing groups. */
  name: string
  label: string
  color: string
  points: ScatterPoint[]
}

// ---------------------------------------------------------------------------
// SankeyChart.
// ---------------------------------------------------------------------------

/**
 * Where a node sits along the flow. `'justify'` pushes a node with no outgoing
 * flow to the far end, `'left'` and `'right'` pin every node to one end.
 */
export type SankeyNodeAlign = 'left' | 'right' | 'justify'

export type SankeyChartProps = {
  /** One row per flow, i.e. one band from a source node to a target node. */
  data: Record<string, unknown>[]
  /** Row key holding the node a flow leaves. */
  source: string
  /** Row key holding the node a flow arrives at. */
  target: string
  /** Row key holding how much flows along the link. */
  value: string
  /** Flow runs top to bottom, in rows of nodes. Defaults to left to right. */
  vertical?: boolean
  /** Where a node sits along the flow. Defaults to `'justify'`. */
  nodeAlign?: SankeyNodeAlign
  /** Prints every number the flow shows, i.e. what a band or node carries. */
  format?: ChartValueFormatter
  /** Defaults to `'categorical'`: nodes are unrelated categories. */
  palette?: ChartPalette
  /** Heads the chart. */
  title?: string
  /** A second line under the title. */
  subtitle?: string
  /** Draws the placeholder in place of the reading. */
  loading?: boolean
  /** Puts the chart in its error state and prints this message. */
  error?: string | null
  /** Plot height. A number is px; a string is used verbatim. */
  height?: number | string
  /** Root class fallthrough, merged last (P10). */
  class?: string
  /** Accessible name for the plot. */
  'aria-label'?: string
  /** Forces layout direction; defaults to document direction. */
  dir?: ChartDir
  /** Escape hatch: deep-merged into the echarts option the props built. */
  echartOptions?: EchartOptionsOverride
}

export type SankeyChartConfig = {
  data: Record<string, unknown>[]
  sourceColumn: string
  targetColumn: string
  valueColumn: string
  vertical?: boolean
  nodeAlign?: SankeyNodeAlign
  palette?: ChartPalette
  echartOptions?: EchartOptionsOverride
}

/** One node of the flow, after de-duplication and color assignment. */
export type SankeyNode = {
  /** The source or target value as it reads. Unique within the graph. */
  name: string
  /**
   * What passes through the node: the larger of what arrives and what leaves,
   * which is the side that decides how tall echarts draws it.
   */
  value: number
  color: string
}

/** One drawn link, i.e. one row of the data. */
export type SankeyLink = {
  source: string
  target: string
  value: number
  /** The source node's color, which is what the band is painted in. */
  color: string
  row: Record<string, unknown>
}

/** The flow as the plot and the labels both read it. */
export type SankeyGraph = {
  /** Nodes in the order the rows first mention them, source before target. */
  nodes: SankeyNode[]
  links: SankeyLink[]
}
