import { formatLabel } from './format'
import type {
  AxisChartConfig,
  AxisChartProps,
  AxisChartSeriesConfig,
  ChartFallback,
  ChartMark,
  ChartValueFormatter,
  DonutChartConfig,
  DonutChartProps,
  FunnelChartConfig,
  FunnelChartProps,
  HeatmapChartConfig,
  HeatmapChartProps,
  SankeyChartConfig,
  SankeyChartProps,
  ScatterChartConfig,
  ScatterChartProps,
  SeriesStyle,
} from './types'

// These normalizers are pure: a component calls them inside a `createMemo`, so
// the props they read are tracked by the caller. Their parameter is named
// `source` rather than `props` because `solid/reactivity` treats any variable
// named `props` as reactive and would flag these reads as untracked.

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

/** A series' own style, over the chart-level default it inherits. */
function mergeStyle(
  base: SeriesStyle,
  style: SeriesStyle | undefined,
): SeriesStyle {
  return { ...base, ...style }
}

/**
 * What a chart component hands the option builder: the props flattened into the
 * config, with the chart-level series defaults folded into each series. Pure,
 * so it is covered by the option-builder tests.
 */
export function normalizeAxisChart(
  source: AxisChartProps,
  type: ChartMark,
  horizontal = false,
): AxisChartConfig {
  const y = toArray(source.y)
  const y2 = toArray(source.y2)

  const defaults: SeriesStyle = {
    showDataLabels: source.showDataLabels,
    smooth: source.smooth,
    showDataPoints: source.showDataPoints,
    dashed: source.dashed,
    connectNulls: source.connectNulls,
  }

  const series: AxisChartSeriesConfig[] = [
    ...y.map((name) => ({
      ...mergeStyle(defaults, source.seriesConfig?.[name]),
      name,
    })),
    ...y2.map((name) => ({
      ...mergeStyle(defaults, source.seriesConfig?.[name]),
      name,
      axis: 'y2' as const,
    })),
  ]

  return {
    type,
    data: source.data,
    xAxis: {
      key: source.x,
      type: source.xAxis?.type,
      title: source.xAxis?.title,
      format: source.xAxis?.format,
      echartOptions: source.xAxis?.echartOptions,
    },
    yAxis: source.yAxis,
    y2Axis: source.y2Axis,
    series,
    stacked: source.stacked,
    horizontal,
    dir: source.dir,
    palette: source.palette,
    echartOptions: source.echartOptions,
  }
}

/** What a value prints when its series and its axis name no format. */
export function axisFormat(source: AxisChartProps): {
  y?: ChartValueFormatter
  y2?: ChartValueFormatter
} {
  return { y: source.yAxis?.format, y2: source.y2Axis?.format }
}

export function normalizeDonutChart(source: DonutChartProps): DonutChartConfig {
  return {
    data: source.data,
    categoryColumn: source.category,
    valueColumn: source.value,
    maxSlices: source.maxSlices,
    showDataLabels: source.showDataLabels,
    centerLabel: source.centerLabel,
    variant: source.variant,
    palette: source.palette,
    dir: source.dir,
    echartOptions: source.echartOptions,
  }
}

/** The rows of an axis chart as a table: the x column, then one column per series. */
export function axisFallback(config: AxisChartConfig): ChartFallback {
  const rows = config.data ?? []
  return {
    columns: [
      config.xAxis.key,
      ...config.series.map(
        (series) => series.label ?? formatLabel(series.name),
      ),
    ],
    rows: rows.map((row) => [
      stringify(row[config.xAxis.key]),
      ...config.series.map((series) => stringify(row[series.name])),
    ]),
  }
}

/** The slices of a donut as a table: category, then value. */
export function donutFallback(config: DonutChartConfig): ChartFallback {
  const rows = config.data ?? []
  return {
    columns: [config.categoryColumn, config.valueColumn],
    rows: rows.map((row) => [
      stringify(row[config.categoryColumn]),
      stringify(row[config.valueColumn]),
    ]),
  }
}

// ---------------------------------------------------------------------------
// Funnel, heatmap, scatter and sankey. Same two layers: a component normalizes
// its props into a config, and the config carries no formatters or chrome.
// ---------------------------------------------------------------------------

export function normalizeFunnelChart(
  source: FunnelChartProps,
): FunnelChartConfig {
  return {
    data: source.data,
    categoryColumn: source.category,
    valueColumn: source.value,
    palette: source.palette,
    dir: source.dir,
    echartOptions: source.echartOptions,
  }
}

/** The stages of a funnel as a table: category, then value. */
export function funnelFallback(config: FunnelChartConfig): ChartFallback {
  const rows = config.data ?? []
  return {
    columns: [config.categoryColumn, config.valueColumn],
    rows: rows.map((row) => [
      stringify(row[config.categoryColumn]),
      stringify(row[config.valueColumn]),
    ]),
  }
}

export function normalizeHeatmapChart(
  source: HeatmapChartProps,
): HeatmapChartConfig {
  return {
    data: source.data,
    xColumn: source.x,
    yColumn: source.y,
    valueColumn: source.value,
    min: source.min,
    max: source.max,
    showDataLabels: source.showDataLabels,
    palette: source.palette,
    dir: source.dir,
    echartOptions: source.echartOptions,
  }
}

/** The grid as a table: x, y, then the value. */
export function heatmapFallback(config: HeatmapChartConfig): ChartFallback {
  const rows = config.data ?? []
  return {
    columns: [config.xColumn, config.yColumn, config.valueColumn],
    rows: rows.map((row) => [
      stringify(row[config.xColumn]),
      stringify(row[config.yColumn]),
      stringify(row[config.valueColumn]),
    ]),
  }
}

export function normalizeScatterChart(
  source: ScatterChartProps,
): ScatterChartConfig {
  return {
    data: source.data,
    xColumn: source.x,
    yColumn: source.y,
    sizeColumn: source.size,
    splitByColumn: source.splitBy,
    labelColumn: source.label,
    showDataLabels: source.showDataLabels,
    xAxis: source.xAxis,
    yAxis: source.yAxis,
    palette: source.palette,
    dir: source.dir,
    echartOptions: source.echartOptions,
  }
}

/** The cloud as a table: x, y, the size when there is one, and the name. */
export function scatterFallback(config: ScatterChartConfig): ChartFallback {
  const rows = config.data ?? []
  const columns = [config.xColumn, config.yColumn]
  if (config.sizeColumn) columns.push(config.sizeColumn)
  if (config.labelColumn) columns.push(config.labelColumn)
  return {
    columns,
    rows: rows.map((row) => columns.map((column) => stringify(row[column]))),
  }
}

export function normalizeSankeyChart(
  source: SankeyChartProps,
): SankeyChartConfig {
  return {
    data: source.data,
    sourceColumn: source.source,
    targetColumn: source.target,
    valueColumn: source.value,
    vertical: source.vertical,
    nodeAlign: source.nodeAlign,
    palette: source.palette,
    echartOptions: source.echartOptions,
  }
}

/** The flow as a table: source, target, then the value. */
export function sankeyFallback(config: SankeyChartConfig): ChartFallback {
  const rows = config.data ?? []
  return {
    columns: [config.sourceColumn, config.targetColumn, config.valueColumn],
    rows: rows.map((row) => [
      stringify(row[config.sourceColumn]),
      stringify(row[config.targetColumn]),
      stringify(row[config.valueColumn]),
    ]),
  }
}

function stringify(value: unknown): string | number {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  return String(value)
}
