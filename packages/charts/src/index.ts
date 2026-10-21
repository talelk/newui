/**
 * `@talelk/newui-charts` — Solid wrappers over echarts, drawn with the SVG renderer
 * and themed with the newui chart tokens.
 *
 * The barrel is curated (P14/P15): the components, the shared shell, the two
 * composables, the pure option builders and the formatting helpers a caller
 * needs to label a chart the way the library does.
 */

// Components
export { AreaChart } from './AreaChart'
export { BarChart } from './BarChart'
// The shared shell and the echarts lifecycle
export { ChartBase, type ChartBaseProps } from './ChartBase'
export { ChartCard } from './ChartCard'
export { ChartContainer } from './ChartContainer'
export { ChartLegend } from './ChartLegend'
export { ChartTooltip } from './ChartTooltip'
export { Dashboard } from './Dashboard'
export { DonutChart } from './DonutChart'
export { FunnelChart } from './FunnelChart'
// Formatting
export {
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
// Funnel
export {
  buildFunnelOption,
  buildFunnelStages,
  type FunnelOptionContext,
  funnelRamp,
} from './funnelOptions'
export { HeatmapChart } from './HeatmapChart'
// Heatmap
export {
  buildHeatmapMatrix,
  buildHeatmapOption,
  HEATMAP_RAMP_STOPS,
  type HeatmapOptionContext,
  heatmapCategoryLabel,
  heatmapRampStops,
} from './heatmapOptions'
export { LineChart } from './LineChart'
export { NumberCard } from './NumberCard'
// Props normalization (what a component hands the builder)
export {
  axisFallback,
  axisFormat,
  donutFallback,
  funnelFallback,
  heatmapFallback,
  normalizeAxisChart,
  normalizeDonutChart,
  normalizeFunnelChart,
  normalizeHeatmapChart,
  normalizeSankeyChart,
  normalizeScatterChart,
  sankeyFallback,
  scatterFallback,
} from './normalize'
// Number card
export {
  type DeltaDirection,
  type DeltaTone,
  deltaDirection,
  deltaTone,
  formatCardDelta,
  formatCardValue,
} from './numberCardFormat'
// Pure option builders — the testable core
export {
  AXIS_LABEL_FONT_SIZE,
  AXIS_LABEL_MARGIN,
  type AxisChartOptionContext,
  axisChartBase,
  buildAxisChartOption,
  buildAxisGrid,
  buildDonutChartOption,
  buildDonutSlices,
  buildStackShares,
  buildValueAxes,
  buildValueAxis,
  buildXAxis,
  CHART_FONT_FAMILY,
  chartShell,
  DATA_LABEL_FONT_SIZE,
  DEFAULT_FILL_OPACITY,
  DEFAULT_LINE_WIDTH,
  DEFAULT_MAX_SLICES,
  type DonutChartOptionContext,
  dashedLine,
  dottedLine,
  HALF_CENTER_Y,
  hasSecondaryValueAxis,
  mergeDeep,
  OTHERS_KEY,
  OTHERS_LABEL,
  paletteColors,
  plotRows,
  type ResolvedXAxis,
  resolveMark,
  resolveSeriesColors,
  resolveXAxis,
  type StackShares,
  valueAxisIndex,
} from './options'
export { SankeyChart } from './SankeyChart'
export { ScatterChart } from './ScatterChart'
// Sankey
export {
  buildSankeyGraph,
  buildSankeyOption,
  type SankeyOptionContext,
} from './sankeyOptions'
// Scatter
export {
  buildScatterOption,
  buildScatterSeries,
  type ScatterOptionContext,
} from './scatterOptions'
export {
  type SparklineBar,
  type SparklineBarOptions,
  type SparklineGeometryOptions,
  type SparklinePoint,
  sparklineAreaPath,
  sparklineBars,
  sparklineLinePath,
  sparklinePoints,
} from './sparkline'
// Tokens
export { EMPTY_TOKENS, readChartTokens, useChartTokens } from './tokens'
// Tooltip
export {
  buildTooltipItems,
  seriesLabel,
  type TooltipItemsArgs,
} from './tooltipItems'
// Types
export type {
  AreaChartProps,
  AxisChartConfig,
  AxisChartProps,
  AxisChartSeriesConfig,
  AxisTitlePlacement,
  BarChartProps,
  ChartCardProps,
  ChartCategoryFormatter,
  ChartContainerProps,
  ChartDir,
  ChartFallback,
  ChartLegendItem,
  ChartLegendProps,
  ChartMark,
  ChartPalette,
  ChartPaletteName,
  ChartTokens,
  ChartTooltipColumn,
  ChartTooltipFormatter,
  ChartTooltipItem,
  ChartTooltipProps,
  ChartTooltipSlotProps,
  ChartValueAxisOptions,
  ChartValueFormatter,
  ChartXAxisOptions,
  DashboardProps,
  DonutChartConfig,
  DonutChartProps,
  DonutSlice,
  DonutVariant,
  EchartOptionsOverride,
  FunnelChartConfig,
  FunnelChartProps,
  FunnelStage,
  HeatmapAxisOptions,
  HeatmapCell,
  HeatmapChartConfig,
  HeatmapChartProps,
  HeatmapMatrix,
  HeatmapPalette,
  LineChartProps,
  NumberCardProps,
  NumberCardSparkline,
  SankeyChartConfig,
  SankeyChartProps,
  SankeyGraph,
  SankeyLink,
  SankeyNode,
  SankeyNodeAlign,
  ScatterChartConfig,
  ScatterChartProps,
  ScatterPoint,
  ScatterSeries,
  SeriesStyle,
  TimeGrain,
} from './types'
export { type UseChartOptions, useChart } from './useChart'
