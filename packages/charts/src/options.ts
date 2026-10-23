import type { EChartsCoreOption } from 'echarts/core'
import {
  formatAxisValue,
  formatLabel,
  formatPercent,
  formatTimeAxisLabel,
  formatValue,
  inferTimeGrain,
  isTemporal,
  toDate,
  toNumber,
} from './format'
import type {
  AxisChartConfig,
  AxisChartSeriesConfig,
  ChartMark,
  ChartPalette,
  ChartPaletteName,
  ChartTokens,
  ChartValueFormatter,
  DonutChartConfig,
  DonutSlice,
  TimeGrain,
} from './types'
import { CHART_MARKS } from './types'

// ---------------------------------------------------------------------------
// Shared constants.
// ---------------------------------------------------------------------------

export const OTHERS_KEY = '__others__'
export const OTHERS_LABEL = 'Others'

export const AXIS_LABEL_FONT_SIZE = 12
export const DATA_LABEL_FONT_SIZE = 12
export const AXIS_LABEL_MARGIN = 8

export const DEFAULT_LINE_WIDTH = 2
/** A wash that shows the trend without swallowing the gridlines behind it. */
export const DEFAULT_FILL_OPACITY = 0.16

export const CHART_FONT_FAMILY =
  "'InterVar', ui-sans-serif, system-ui, sans-serif"

const BAR_MAX_WIDTH = 32
/** Slim bars with an airy gap between categories. */
const BAR_CATEGORY_GAP = '38%'
const BAR_RADIUS = 4
/** Big enough to hit with a pointer, small enough not to read as a scatter plot. */
const SYMBOL_SIZE = 6

const MARK_Z: Record<ChartMark, number> = { bar: 2, area: 3, line: 4 }

/** Gridlines and the category baseline are drawn as fine dots, not rules. */
export function dottedLine(width: number) {
  return { type: [width, width * 3], cap: 'round' as const, width }
}
const DOTTED_LINE = dottedLine(1)

/** The texture a broken line takes: long strokes with square ends. */
export function dashedLine(width: number) {
  return { type: [width * 3.5, width * 3], width }
}

// ---------------------------------------------------------------------------
// Deep merge: objects merge key by key, arrays and primitives replace.
// ---------------------------------------------------------------------------

export function mergeDeep<T>(base: T, override: unknown): T {
  if (Array.isArray(override)) return override as T
  if (override === null || typeof override !== 'object') {
    return (override === undefined ? base : override) as T
  }
  if (base === null || typeof base !== 'object' || Array.isArray(base)) {
    return override as T
  }

  const out: Record<string, unknown> = {
    ...(base as Record<string, unknown>),
  }
  for (const [key, value] of Object.entries(
    override as Record<string, unknown>,
  )) {
    out[key] = mergeDeep(out[key], value)
  }
  return out as T
}

// ---------------------------------------------------------------------------
// Colors.
// ---------------------------------------------------------------------------

function cycle(ramp: string[], count: number): string[] {
  return Array.from(
    { length: count },
    (_, i) => ramp[i % ramp.length] as string,
  )
}

/**
 * One color per thing drawn. An explicit list is handed out in the order it was
 * written and cycled once it runs out; a named ramp is sampled, dark to light,
 * except the categorical one, which is a set of unrelated hues and cycles.
 */
export function paletteColors(
  palette: ChartPalette | undefined,
  tokens: ChartTokens,
  count: number,
  fallback: ChartPaletteName = 'sequential',
): string[] {
  if (count <= 0) return []

  const explicit = Array.isArray(palette) ? palette : undefined
  if (explicit?.length) return cycle(explicit, count)

  const ramp = tokens.series
  if (!ramp.length) return []

  const name = typeof palette === 'string' ? palette : fallback
  if (name === 'categorical') return cycle(ramp, count)
  if (count === 1) return [ramp[0] as string]
  if (count > ramp.length) return cycle(ramp, count)

  const last = ramp.length - 1
  return Array.from(
    { length: count },
    (_, i) => ramp[Math.round((i * last) / (count - 1))] as string,
  )
}

/** Series colors keyed by name, so a hidden series never shifts its neighbours. */
export function resolveSeriesColors(
  config: AxisChartConfig,
  tokens: ChartTokens,
): Record<string, string | undefined> {
  const assigned = paletteColors(
    config.palette,
    tokens,
    config.series.length,
    'sequential',
  )
  const colors: Record<string, string | undefined> = {}
  config.series.forEach((series, index) => {
    colors[series.name] = series.color || assigned[index]
  })
  return colors
}

// ---------------------------------------------------------------------------
// Axis charts.
// ---------------------------------------------------------------------------

/** The mark a series draws as, falling back to the chart's own when unreadable. */
export function resolveMark(
  series: AxisChartSeriesConfig,
  config: AxisChartConfig,
): ChartMark {
  const asked = series.type ?? config.type
  if (!CHART_MARKS.includes(asked)) return config.type
  if (config.horizontal && asked !== 'bar') return 'bar'
  return asked
}

export type ResolvedXAxis = {
  type: 'category' | 'time' | 'value'
  timeGrain?: TimeGrain
}

/**
 * What the x axis actually is, config and data taken together. An unset type
 * picks `'time'` for a column of dates and `'category'` otherwise; `'value'` is
 * only ever asked for, never inferred.
 */
export function resolveXAxis(
  config: AxisChartConfig,
  horizontal = false,
): ResolvedXAxis {
  const values = (config.data ?? []).map((row) => row[config.xAxis.key])
  const asked = config.xAxis.type
  const type =
    asked === 'value' && horizontal
      ? 'category'
      : (asked ?? (isTemporal(values) ? 'time' : 'category'))
  if (type !== 'time') return { type }
  return { type, timeGrain: inferTimeGrain(values) }
}

/**
 * The rows in the order the plot draws them, and only the rows it can place. A
 * scaled axis puts a point at its own x, so rows arriving out of order are
 * sorted, and a row whose x is not a number or a date is dropped.
 */
export function plotRows(
  config: AxisChartConfig,
  type: ResolvedXAxis['type'],
): Record<string, unknown>[] {
  const rows = config.data ?? []
  if (type === 'category') return rows

  const place =
    type === 'value'
      ? toNumber
      : (value: unknown) => toDate(value)?.getTime() ?? null
  const placed: { row: Record<string, unknown>; x: number }[] = []
  for (const row of rows) {
    const x = place(row[config.xAxis.key])
    if (x !== null) placed.push({ row, x })
  }
  return placed.sort((a, b) => a.x - b.x).map((entry) => entry.row)
}

export function hasSecondaryValueAxis(
  config: AxisChartConfig,
  horizontal = false,
): boolean {
  if (horizontal) return false
  return config.series.some((series) => series.axis === 'y2')
}

export function valueAxisIndex(
  series: AxisChartSeriesConfig,
  hasSecondary: boolean,
): number {
  return hasSecondary && series.axis === 'y2' ? 1 : 0
}

type PlottedSeries = {
  series: AxisChartSeriesConfig
  mark: ChartMark
  /** echarts `stack` key, or undefined for a series that stands on its own. */
  stack?: string
}

function plotSeries(config: AxisChartConfig): PlottedSeries[] {
  return config.series.map((series) => {
    const mark = resolveMark(series, config)
    return { series, mark, stack: stackKey(series, config, mark) }
  })
}

/** Marks stack among their own: a bar never stacks onto an area band. */
function stackKey(
  series: AxisChartSeriesConfig,
  config: AxisChartConfig,
  mark: ChartMark,
): string | undefined {
  if (!config.stacked || mark === 'line') return undefined
  return `${mark}:${series.stackName || 'stack'}`
}

export type StackShares = Map<string, (number | null)[]>

/**
 * Each series' share of its stack, row by row, keyed by series name. Empty for
 * a chart that is not normalized, and missing an entry for a series alone in
 * its stack — a series alone is its own whole, which says nothing.
 */
export function buildStackShares(
  config: AxisChartConfig,
  hiddenSeries: string[] = [],
): StackShares {
  if (config.stacked !== 'normalized') return new Map()
  const visible = plotSeries(config).filter(
    (entry) => !hiddenSeries.includes(entry.series.name),
  )
  const { type } = resolveXAxis(config, Boolean(config.horizontal))
  return stackShares(config, visible, plotRows(config, type))
}

function stackShares(
  config: AxisChartConfig,
  visible: PlottedSeries[],
  rows: Record<string, unknown>[],
): StackShares {
  const shares: StackShares = new Map()
  if (config.stacked !== 'normalized') return shares

  const groups = new Map<string, PlottedSeries[]>()
  for (const entry of visible) {
    if (!entry.stack) continue
    groups.set(entry.stack, [...(groups.get(entry.stack) ?? []), entry])
  }

  for (const group of groups.values()) {
    if (group.length < 2) continue

    // Magnitudes, so a column that mixes signs still spans exactly 100 from its
    // lowest segment to its highest.
    const totals = rows.map((row) =>
      group.reduce(
        (sum, entry) => sum + Math.abs(toNumber(row[entry.series.name]) ?? 0),
        0,
      ),
    )

    for (const entry of group) {
      shares.set(
        entry.series.name,
        rows.map((row, index) => {
          const value = toNumber(row[entry.series.name])
          const total = totals[index]
          if (value === null || !total) return null
          return (value / total) * 100
        }),
      )
    }
  }

  return shares
}

/** The animation and type keys every chart in the family shares. */
export function chartShell() {
  return {
    animation: true,
    animationDuration: 500,
    animationDurationUpdate: 300,
    textStyle: { fontFamily: CHART_FONT_FAMILY },
  }
}

/** Option keys that hold for any cartesian chart, whatever it draws. */
export function axisChartBase(
  tokens: ChartTokens,
  axisPointer: 'shadow' | 'line',
) {
  return {
    ...chartShell(),
    tooltip: {
      trigger: 'axis',
      showContent: false,
      axisPointer: {
        z: 1,
        ...(axisPointer === 'shadow'
          ? {
              type: 'shadow',
              shadowStyle: { color: tokens.grid, opacity: 0.7 },
            }
          : { type: 'line', lineStyle: { color: tokens.axis, width: 1 } }),
      },
    },
  }
}

export function buildAxisGrid(opts: {
  horizontal: boolean
  xAxisTitle?: string
}) {
  const { horizontal, xAxisTitle } = opts
  return {
    top: 8,
    // Reserve the x-axis label band. With `bottom: 0` the temporal axis
    // renders its ticks outside the plot and they disappear.
    bottom: 40,
    containLabel: true,
    left: 2,
    right: xAxisTitle && horizontal ? 24 : 2,
    outerBoundsMode: 'same',
    outerBoundsContain: 'all',
  }
}

function xAxisLabelFormat(
  type: ResolvedXAxis['type'],
  format: ((value: unknown) => string) | undefined,
  timeGrain?: TimeGrain,
) {
  if (type === 'time') {
    return (value: unknown, _index: number, extra?: { level: number }) =>
      formatTimeAxisLabel(value, timeGrain, extra?.level ?? 0)
  }
  if (type === 'value') {
    return (value: number) => formatValue(value, 1, true)
  }
  if (format) return (value: unknown) => format(value)
  return (value: unknown) => formatAxisValue(value, type)
}

export function buildXAxis(
  config: AxisChartConfig,
  tokens: ChartTokens,
  opts: {
    categories: unknown[]
    horizontal: boolean
    isRTL: boolean
    type: ResolvedXAxis['type']
    timeGrain?: TimeGrain
  },
) {
  const { categories, horizontal, isRTL, type, timeGrain } = opts

  const axis = {
    type,
    ...(type === 'value' ? { scale: true } : {}),
    // RTL reads right-to-left; a horizontal chart's categories run top down.
    inverse: horizontal ? true : isRTL,
    position: horizontal ? (isRTL ? 'right' : 'left') : 'bottom',
    ...(type === 'category' ? { data: categories, boundaryGap: true } : {}),
    name: config.xAxis.title ? formatLabel(config.xAxis.title) : undefined,
    nameLocation: 'end',
    nameGap: 8,
    nameTextStyle: {
      color: tokens.label,
      fontSize: AXIS_LABEL_FONT_SIZE * (tokens.fontScale ?? 1),
    },
    splitLine: { show: false },
    axisLine: { show: true, lineStyle: { color: tokens.grid, ...DOTTED_LINE } },
    axisTick: { show: false },
    axisLabel: {
      show: true,
      hideOverlap: true,
      ...(type === 'category' ? { showMaxLabel: true } : {}),
      margin: AXIS_LABEL_MARGIN,
      color: tokens.label,
      fontSize: AXIS_LABEL_FONT_SIZE * (tokens.fontScale ?? 1),
      formatter: xAxisLabelFormat(type, config.xAxis.format, timeGrain),
    },
  }

  return mergeDeep(axis, config.xAxis.echartOptions)
}

function valueAxisPosition(
  horizontal: boolean,
  isRTL: boolean,
  secondary: boolean,
) {
  if (horizontal) return 'bottom'
  if (isRTL) return secondary ? 'left' : 'right'
  return secondary ? 'right' : 'left'
}

export function buildValueAxis(
  axisConfig: AxisChartConfig['yAxis'],
  tokens: ChartTokens,
  opts: {
    horizontal: boolean
    isRTL: boolean
    secondary?: boolean
    /** Pinned to 0-100 for a normalized stack; see `stackShares`. */
    pinned?: boolean
  },
) {
  const { horizontal, isRTL, pinned } = opts
  const secondary = Boolean(opts.secondary)

  const axis = {
    type: 'value',
    inverse: horizontal ? isRTL : false,
    position: valueAxisPosition(horizontal, isRTL, secondary),
    // Both scales are picked so their ticks land on the same rows.
    alignTicks: secondary,
    min: pinned ? 0 : axisConfig?.min,
    max: pinned ? 100 : axisConfig?.max,
    name: axisConfig?.title ? formatLabel(axisConfig.title) : undefined,
    nameLocation: 'end',
    nameGap: 8,
    nameTextStyle: {
      color: tokens.label,
      fontSize: AXIS_LABEL_FONT_SIZE * (tokens.fontScale ?? 1),
    },
    splitLine: {
      show: !secondary,
      lineStyle: { color: tokens.grid, ...DOTTED_LINE },
    },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      show: true,
      hideOverlap: true,
      showMaxLabel: true,
      margin: AXIS_LABEL_MARGIN,
      color: tokens.label,
      fontSize: AXIS_LABEL_FONT_SIZE * (tokens.fontScale ?? 1),
      formatter: pinned
        ? (value: number) => formatPercent(value)
        : (axisConfig?.format ??
          ((value: number) => formatValue(value, 1, true))),
    },
  }

  return mergeDeep(axis, axisConfig?.echartOptions)
}

export function buildValueAxes(
  config: AxisChartConfig,
  tokens: ChartTokens,
  opts: {
    horizontal: boolean
    isRTL: boolean
    shares: StackShares
    hasSecondary: boolean
  },
) {
  const { horizontal, isRTL, shares, hasSecondary } = opts

  const pinnedOn = (index: number) =>
    shares.size > 0 &&
    config.series.some(
      (series) =>
        shares.has(series.name) &&
        valueAxisIndex(series, hasSecondary) === index,
    )

  const primary = buildValueAxis(config.yAxis, tokens, {
    horizontal,
    isRTL,
    pinned: pinnedOn(0),
  })
  if (!hasSecondary) return primary

  return [
    primary,
    buildValueAxis(config.y2Axis, tokens, {
      horizontal,
      isRTL,
      secondary: true,
      pinned: pinnedOn(1),
    }),
  ]
}

type EchartsLabelParams = { value?: unknown }

function pairValue(value: unknown, horizontal: boolean): unknown {
  if (Array.isArray(value)) return horizontal ? value[0] : value[1]
  return value
}

/** What a data label prints. A normalized series prints its share. */
function plottedLabel(value: unknown, ctx: SeriesContext): string {
  if (value === null || value === undefined) return ''
  const numeric = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(numeric)) return ''
  if (ctx.share) return formatPercent(numeric)
  return ctx.format ? ctx.format(numeric) : formatValue(numeric, 1, true)
}

type SeriesContext = {
  tokens: ChartTokens
  rows: Record<string, unknown>[]
  horizontal: boolean
  isRTL: boolean
  color: string | undefined
  yAxisIndex: number
  xValue: (row: Record<string, unknown>) => unknown
  carriesTip: (entry: PlottedSeries, rowIndex: number, value: number) => boolean
  format?: ChartValueFormatter
  share: (number | null)[] | null
}

/**
 * The corners at the far end of the bar from the baseline — the tip it grows
 * towards. A bar below zero grows the other way, so its tip is the other end.
 */
function borderRadius(
  value: number,
  horizontal: boolean,
  isRTL: boolean,
): number | number[] {
  if (!value) return 0

  if (!horizontal) {
    return value > 0
      ? [BAR_RADIUS, BAR_RADIUS, 0, 0]
      : [0, 0, BAR_RADIUS, BAR_RADIUS]
  }
  return value > 0 !== isRTL
    ? [0, BAR_RADIUS, BAR_RADIUS, 0]
    : [BAR_RADIUS, 0, 0, BAR_RADIUS]
}

function barLabelPosition(
  entry: PlottedSeries,
  horizontal: boolean,
  isRTL: boolean,
) {
  if (entry.stack) return 'inside'
  if (horizontal) return isRTL ? 'left' : 'right'
  return 'top'
}

/**
 * Whether a bar carries its column's rounded tip, asked per row: which segment
 * ends the column depends on the sign of the number in that row.
 */
function tipResolver(
  visible: PlottedSeries[],
  config: AxisChartConfig,
  rows: Record<string, unknown>[],
) {
  if (!config.stacked) return () => true
  const bars = visible.filter((entry) => entry.mark === 'bar')

  return (entry: PlottedSeries, rowIndex: number, value: number) => {
    if (!entry.stack) return true
    const outermost = bars
      .filter((other) => other.stack === entry.stack)
      .filter((other) =>
        sameDirection(toNumber(rows[rowIndex]?.[other.series.name]), value),
      )
      .at(-1)
    return outermost?.series.name === entry.series.name
  }
}

function sameDirection(a: number | null, b: number) {
  return a !== null && a !== 0 && a > 0 === b > 0
}

function buildBarSeries(entry: PlottedSeries, ctx: SeriesContext) {
  const { series } = entry
  const { rows, horizontal, isRTL, color, tokens, carriesTip, yAxisIndex } = ctx

  const data = rows.map((row, index) => {
    const at = ctx.xValue(row)
    const value = ctx.share
      ? (ctx.share[index] ?? null)
      : toNumber(row[series.name])
    const point = horizontal ? [value, at] : [at, value]
    const rounded =
      value !== null && carriesTip(entry, index, value)
        ? borderRadius(value, horizontal, isRTL)
        : 0
    return { value: point, itemStyle: { borderRadius: rounded } }
  })

  const position = barLabelPosition(entry, horizontal, isRTL)

  return {
    type: 'bar',
    name: series.name,
    data,
    yAxisIndex,
    z: MARK_Z.bar,
    stack: entry.stack,
    barMaxWidth: BAR_MAX_WIDTH,
    barCategoryGap: BAR_CATEGORY_GAP,
    itemStyle: { color },
    // No per-series emphasis: fading the others to read one costs more than it
    // says, and the axis pointer already reads out the category.
    emphasis: { disabled: true },
    label: {
      show: Boolean(series.showDataLabels),
      position,
      color: tokens.label,
      fontSize: DATA_LABEL_FONT_SIZE * (tokens.fontScale ?? 1),
      formatter: (params: EchartsLabelParams) =>
        plottedLabel(pairValue(params.value, horizontal), ctx),
    },
    labelLayout: { hideOverlap: true },
  }
}

/** Line and area are one echarts series type: an area is a line with a fill. */
function buildLineSeries(entry: PlottedSeries, ctx: SeriesContext) {
  const { series, mark } = entry
  const { rows, color, tokens, yAxisIndex, share } = ctx
  // echarts draws a line's labels on its symbols, so labels alone keep the
  // symbols but shrink them away.
  const labelsOnly = Boolean(series.showDataLabels && !series.showDataPoints)

  const data = rows.map((row, index) => [
    ctx.xValue(row),
    share ? (share[index] ?? null) : toNumber(row[series.name]),
  ])

  const base = {
    type: 'line',
    name: series.name,
    data,
    yAxisIndex,
    z: MARK_Z[mark],
    stack: entry.stack,
    // Nulls read as gaps: bridging them invents data that was never measured.
    connectNulls: Boolean(series.connectNulls),
    smooth: Boolean(series.smooth),
    showSymbol: Boolean(series.showDataPoints || series.showDataLabels),
    symbol: 'circle',
    symbolSize: labelsOnly ? 0 : SYMBOL_SIZE,
    itemStyle: { color },
    lineStyle: {
      color,
      width: DEFAULT_LINE_WIDTH,
      type: series.dashed ? dashedLine(DEFAULT_LINE_WIDTH).type : 'solid',
    },
    emphasis: { disabled: true },
    label: {
      show: Boolean(series.showDataLabels),
      position: 'top',
      color: tokens.label,
      fontSize: DATA_LABEL_FONT_SIZE * (tokens.fontScale ?? 1),
      formatter: (params: EchartsLabelParams) =>
        plottedLabel(pairValue(params.value, false), ctx),
    },
    labelLayout: { hideOverlap: true },
  }

  if (mark !== 'area') return base

  return { ...base, areaStyle: { color, opacity: DEFAULT_FILL_OPACITY } }
}

function buildSeries(entry: PlottedSeries, ctx: SeriesContext) {
  const base =
    entry.mark === 'bar'
      ? buildBarSeries(entry, ctx)
      : buildLineSeries(entry, ctx)
  return mergeDeep(base, entry.series.echartOptions)
}

function seriesFormatter(
  series: AxisChartSeriesConfig,
  format: AxisChartOptionContext['format'],
  horizontal: boolean,
): ChartValueFormatter | undefined {
  if (series.format) return series.format
  if (horizontal) return format?.y
  return series.axis === 'y2' ? (format?.y2 ?? format?.y) : format?.y
}

export type AxisChartOptionContext = {
  tokens: ChartTokens
  /** Series names the legend has switched off. Dropped from the option. */
  hiddenSeries?: string[]
  /** What a value prints when its series and its axis name no format. */
  format?: { y?: ChartValueFormatter; y2?: ChartValueFormatter }
}

/**
 * The one option path every cartesian chart takes. `config.type` is the mark a
 * series draws as unless it names its own, which is the only thing `BarChart`,
 * `LineChart` and `AreaChart` disagree about.
 */
export function buildAxisChartOption(
  config: AxisChartConfig,
  { tokens, hiddenSeries = [], format = {} }: AxisChartOptionContext,
): EChartsCoreOption {
  const isRTL = config.dir === 'rtl'
  const horizontal = Boolean(config.horizontal)
  const { type: xAxisType, timeGrain } = resolveXAxis(config, horizontal)
  const rows = plotRows(config, xAxisType)
  const colors = resolveSeriesColors(config, tokens)

  const plotted = plotSeries(config)
  const visible = plotted.filter(
    (entry) => !hiddenSeries.includes(entry.series.name),
  )
  // Read over *every* series: hiding the last bar should not swap the pointer
  // from a shade to a rule.
  const hasBars = plotted.some((entry) => entry.mark === 'bar')
  const categories = rows.map((row) => row[config.xAxis.key])
  const xValue = (row: Record<string, unknown>) =>
    xAxisType === 'value'
      ? toNumber(row[config.xAxis.key])
      : row[config.xAxis.key]

  const xColumnAxis = buildXAxis(config, tokens, {
    categories,
    horizontal,
    isRTL,
    type: xAxisType,
    timeGrain,
  })
  const hasSecondary = hasSecondaryValueAxis(config, horizontal)
  const shares = stackShares(config, visible, rows)
  const valueAxes = buildValueAxes(config, tokens, {
    horizontal,
    isRTL,
    shares,
    hasSecondary,
  })
  const carriesTip = tipResolver(visible, config, rows)

  const option = {
    ...axisChartBase(tokens, hasBars ? 'shadow' : 'line'),
    grid: buildAxisGrid({ horizontal, xAxisTitle: config.xAxis.title }),
    xAxis: horizontal ? valueAxes : xColumnAxis,
    yAxis: horizontal ? xColumnAxis : valueAxes,
    series: visible.map((entry) =>
      buildSeries(entry, {
        tokens,
        rows,
        horizontal,
        isRTL,
        color: colors[entry.series.name],
        yAxisIndex: valueAxisIndex(entry.series, hasSecondary),
        format: seriesFormatter(entry.series, format, horizontal),
        xValue,
        carriesTip,
        share: shares.get(entry.series.name) ?? null,
      }),
    ),
  }

  return mergeDeep(option, config.echartOptions) as EChartsCoreOption
}

// ---------------------------------------------------------------------------
// Donut.
// ---------------------------------------------------------------------------

export const DEFAULT_MAX_SLICES = 9
/** Below two there is nothing left to group into. */
const MIN_MAX_SLICES = 2

const DONUT_PALETTE: ChartPaletteName = 'categorical'

/** Wide enough a ring to read as a ring, with room for the center readout. */
const DONUT_RADIUS = ['64%', '90%']
const DONUT_RADIUS_WITH_LABELS = ['46%', '66%']
const HALF_RADIUS = ['74%', '100%']
const HALF_RADIUS_WITH_LABELS = ['54%', '80%']
/** Pushed down so the semicircle sits in the middle of the card. */
export const HALF_CENTER_Y = '75%'
/** Thin gap between slices, so neighbouring hues do not bleed together. */
const SLICE_PAD_ANGLE = 1.5
const SLICE_RADIUS = 4
/** How far the hovered slice grows out of the ring, in px. */
const EMPHASIS_SCALE = 4

export type DonutChartOptionContext = {
  tokens: ChartTokens
  /** Slice names the legend has switched off. Dropped from the ring. */
  hiddenSlices?: string[]
}

/**
 * The slices of a ring, in drawing order. Hidden slices stay in the list — the
 * legend still needs them, and dropping them would shift every color after.
 */
export function buildDonutSlices(
  config: DonutChartConfig,
  { tokens, hiddenSlices = [] }: DonutChartOptionContext,
): DonutSlice[] {
  const grouped = groupRows(config)
  const colors = paletteColors(
    config.palette,
    tokens,
    grouped.length,
    DONUT_PALETTE,
  )

  const visibleTotal = grouped.reduce(
    (sum, slice) =>
      hiddenSlices.includes(slice.name) ? sum : sum + slice.value,
    0,
  )

  return grouped.map((slice, index) => {
    const hidden = hiddenSlices.includes(slice.name)
    return {
      ...slice,
      color: colors[index] ?? '',
      hidden,
      percent: hidden || !visibleTotal ? 0 : (slice.value / visibleTotal) * 100,
    }
  })
}

type UnsizedSlice = Omit<DonutSlice, 'color' | 'hidden' | 'percent'>

function groupRows(config: DonutChartConfig): UnsizedSlice[] {
  const rows = config.data ?? []

  const entries = rows
    .map((row) => ({ row, value: toNumber(row[config.valueColumn]) }))
    // A ring reads as parts of a whole, and a negative part has no arc to draw.
    .filter(
      (entry): entry is { row: Record<string, unknown>; value: number } =>
        entry.value !== null && entry.value >= 0,
    )
    // Biggest first: the ring, the legend and the tail all depend on this order.
    .sort((a, b) => b.value - a.value)

  const max = Math.max(MIN_MAX_SLICES, config.maxSlices ?? DEFAULT_MAX_SLICES)
  // One of the slots goes to "Others" itself.
  const keep = entries.length > max ? max - 1 : entries.length

  const seen = new Set<string>()
  const slices: UnsizedSlice[] = entries.slice(0, keep).map((entry) => {
    const label = categoryLabel(entry.row[config.categoryColumn])
    return {
      name: uniqueName(label, seen),
      label,
      value: entry.value,
      rows: [entry.row],
      isOthers: false,
    }
  })

  const overflow = entries.slice(keep)
  if (!overflow.length) return slices

  return [
    ...slices,
    {
      name: OTHERS_KEY,
      label: OTHERS_LABEL,
      value: overflow.reduce((sum, entry) => sum + entry.value, 0),
      rows: overflow.map((entry) => entry.row),
      isOthers: true,
    },
  ]
}

function categoryLabel(value: unknown): string {
  return value === null || value === undefined || value === ''
    ? '(Blank)'
    : String(value)
}

/**
 * Two rows can carry the same category value, and echarts addresses a slice by
 * name — so a repeat would highlight and hide both at once. The label keeps the
 * raw value; only the identity is made unique.
 */
function uniqueName(label: string, seen: Set<string>): string {
  let name = label
  let suffix = 2
  while (seen.has(name)) name = `${label} (${suffix++})`
  seen.add(name)
  return name
}

export function buildDonutChartOption(
  config: DonutChartConfig,
  context: DonutChartOptionContext,
): EChartsCoreOption {
  const { tokens } = context
  const isRTL = config.dir === 'rtl'
  const slices = buildDonutSlices(config, context)
  const visible = slices.filter((slice) => !slice.hidden)
  const labels = new Map(slices.map((slice) => [slice.name, slice.label]))
  const isHalf = config.variant === 'half'

  const option = {
    animation: true,
    animationDuration: 500,
    animationDurationUpdate: 300,
    textStyle: { fontFamily: CHART_FONT_FAMILY },
    // No `tooltip` key, and no TooltipComponent registered with it: a pie has no
    // axis pointer for echarts' tooltip to drive.
    series: [
      {
        type: 'pie',
        name: config.valueColumn,
        radius: isHalf
          ? config.showDataLabels
            ? HALF_RADIUS_WITH_LABELS
            : HALF_RADIUS
          : config.showDataLabels
            ? DONUT_RADIUS_WITH_LABELS
            : DONUT_RADIUS,
        center: ['50%', isHalf ? HALF_CENTER_Y : '50%'],
        // RTL reads the other way round the ring, as it does along an axis.
        clockwise: !isRTL,
        // Both halves sweep across the top, so the arc opens downward either way.
        ...(isHalf
          ? isRTL
            ? { startAngle: 0, endAngle: 180 }
            : { startAngle: 180, endAngle: 0 }
          : {}),
        padAngle: SLICE_PAD_ANGLE,
        itemStyle: { borderRadius: SLICE_RADIUS, borderWidth: 0 },
        avoidLabelOverlap: true,
        label: {
          show: Boolean(config.showDataLabels),
          color: tokens.label,
          fontSize: DATA_LABEL_FONT_SIZE * (tokens.fontScale ?? 1),
          lineHeight: 16 * (tokens.fontScale ?? 1),
          overflow: 'break',
          formatter: (params: { name?: string; percent?: number }) =>
            `${labels.get(params.name ?? '') ?? params.name} ${formatPercent(
              params.percent ?? 0,
            )}`,
        },
        labelLine: {
          show: Boolean(config.showDataLabels),
          length: 8,
          length2: 12,
          smooth: true,
          lineStyle: { width: 1, color: tokens.axis },
        },
        emphasis: {
          focus: 'self',
          blurScope: 'series',
          scaleSize: EMPHASIS_SCALE,
        },
        data: visible.map((slice) => ({
          name: slice.name,
          value: slice.value,
          itemStyle: { color: slice.color },
        })),
      },
    ],
  }

  return mergeDeep(option, config.echartOptions) as EChartsCoreOption
}
