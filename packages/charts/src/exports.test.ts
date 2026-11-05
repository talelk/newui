/**
 * The public surface, asserted by name. One line per shipped symbol, so an
 * accidental `export *` growth fails here rather than reaching consumers.
 */
import { describe, expect, it } from 'vitest'
import * as charts from './index'

const PUBLIC = [
  // components
  'AreaChart',
  'BarChart',
  'CalendarHeatmapChart',
  'ChartCard',
  'ChartContainer',
  'ChartLegend',
  'ChartTooltip',
  'Dashboard',
  'DonutChart',
  'FunnelChart',
  'GaugeChart',
  'HeatmapChart',
  'LineChart',
  'NumberCard',
  'SankeyChart',
  'ScatterChart',
  'Sparkline',
  'ChartBase',
  // lifecycle
  'useChart',
  'useChartTokens',
  'readChartTokens',
  'readPaletteRamp',
  // option builders
  'buildAxisChartOption',
  'buildDonutChartOption',
  'buildDonutSlices',
  'buildStackShares',
  'resolveSeriesColors',
  'resolveMark',
  'resolveXAxis',
  'plotRows',
  'paletteColors',
  'mergeDeep',
  'hasSecondaryValueAxis',
  'valueAxisIndex',
  'chartShell',
  // funnel
  'buildFunnelStages',
  'buildFunnelOption',
  'funnelRamp',
  // heatmap
  'buildHeatmapMatrix',
  'buildHeatmapOption',
  'heatmapRampStops',
  'heatmapCategoryLabel',
  // calendar heatmap
  'buildCalendarHeatmapCalendar',
  'buildCalendarHeatmapOption',
  'calendarDayKey',
  'calendarHeatmapRamp',
  // gauge
  'buildGaugeOption',
  'METRIC_FONT_SIZE',
  // scatter
  'buildScatterSeries',
  'buildScatterOption',
  // sankey
  'buildSankeyGraph',
  'buildSankeyOption',
  // tooltip
  'buildTooltipItems',
  'seriesLabel',
  // formatting
  'formatValue',
  'formatPercent',
  'formatLabel',
  'formatAxisValue',
  'formatTimeAxisLabel',
  'inferTimeGrain',
  'isTemporal',
  'toDate',
  'toNumber',
  // number card
  'deltaDirection',
  'deltaTone',
  'formatCardValue',
  'formatCardDelta',
  'sparklinePoints',
  'sparklineLinePath',
  'sparklineAreaPath',
  'sparklineBars',
  // constants
  'OTHERS_KEY',
  'OTHERS_LABEL',
  'HEATMAP_RAMP_STOPS',
  'CHART_FONT_FAMILY',
]

describe('public surface', () => {
  it('exports every documented member', () => {
    for (const name of PUBLIC) {
      expect(charts, name).toHaveProperty(name)
    }
  })
})
