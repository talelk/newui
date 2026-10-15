import type { EChartsCoreOption } from 'echarts/core'
import { formatValue, toNumber } from './format'
import {
  AXIS_LABEL_FONT_SIZE,
  AXIS_LABEL_MARGIN,
  chartShell,
  DATA_LABEL_FONT_SIZE,
  mergeDeep,
  paletteColors,
} from './options'
import type {
  ChartCategoryFormatter,
  ChartPaletteName,
  ChartTokens,
  ChartValueFormatter,
  HeatmapCell,
  HeatmapChartConfig,
  HeatmapMatrix,
} from './types'

// Plot and the ramp scale in the chrome both read the same `HeatmapMatrix`, so
// the scale in the corner can't disagree with the fills.

export type HeatmapOptionContext = {
  tokens: ChartTokens
  /** Prints the value inside a cell. Defaults to a shortened number. */
  format?: ChartValueFormatter
  /** Prints the columns of the grid. Left out, echarts prints the category. */
  xFormat?: ChartCategoryFormatter
  /** Prints the rows of the grid. */
  yFormat?: ChartCategoryFormatter
}

/**
 * How many stops the ramp is handed to echarts as. The newui chart ramp is a
 * set of discrete token colors rather than a continuous gradient, so a heatmap
 * samples it: every cell takes the stop nearest its share of the scale, and
 * echarts blends between the stops the `visualMap` names.
 */
export const HEATMAP_RAMP_STOPS = 8

const HEATMAP_PALETTE: ChartPaletteName = 'sequential'

/** Gap between two cells, in px. Split either side of the shared edge. */
const CELL_BORDER_WIDTH = 2
const CELL_RADIUS = 2

const BLANK_CATEGORY = '(Blank)'

/**
 * The ramp the scale runs along, low end first. Asked for as a ramp rather than
 * as one color per cell: a heatmap interpolates between the stops.
 */
export function heatmapRampStops(
  config: HeatmapChartConfig,
  tokens: ChartTokens,
): string[] {
  return paletteColors(
    config.palette,
    tokens,
    HEATMAP_RAMP_STOPS,
    HEATMAP_PALETTE,
  )
}

/**
 * The stop a cell's share of the scale lands on. The ramp is discrete, so the
 * nearest stop is picked rather than an interpolation invented.
 */
function rampColor(stops: string[], t: number): string {
  if (!stops.length) return ''
  const clamped = Math.min(Math.max(t, 0), 1)
  const index = Math.round(clamped * (stops.length - 1))
  return stops[index] ?? ''
}

/**
 * Cells, categories and the resolved color scale. Categories come out in first
 * appearance order rather than sorted: heatmap axes are usually already
 * meaningful (hours, weekdays, stages), so the caller's row order decides.
 */
export function buildHeatmapMatrix(
  config: HeatmapChartConfig,
  { tokens }: HeatmapOptionContext,
): HeatmapMatrix {
  const rows = config.data ?? []
  const x = categoryAxis()
  const y = categoryAxis()

  // Keyed by coordinate, so two rows landing on the same cell leave one cell
  // rather than two stacked ones. The later row wins: a caller that did not
  // pre-aggregate is better served by a last-write-wins rule it can predict
  // than by a silent sum.
  const placed = new Map<string, Omit<HeatmapCell, 'color'>>()

  for (const row of rows) {
    // Categories are registered even when the value is missing: an hour with no
    // orders is still an hour, and dropping its column would close the gap.
    const xIndex = x.register(row[config.xColumn])
    const yIndex = y.register(row[config.yColumn])

    const value = toNumber(row[config.valueColumn])
    if (value === null) continue

    placed.set(`${xIndex}:${yIndex}`, {
      x: x.labels[xIndex] ?? '',
      y: y.labels[yIndex] ?? '',
      xIndex,
      yIndex,
      value,
      row,
    })
  }

  const unsized = [...placed.values()]
  const { min, max } = resolveScale(config, unsized)
  const stops = heatmapRampStops(config, tokens)
  const span = max - min

  const cells: HeatmapCell[] = unsized.map((cell) => ({
    ...cell,
    // A grid where every cell holds the same number has no scale to place them
    // on, so they all read as present rather than all as empty.
    color: rampColor(stops, span > 0 ? (cell.value - min) / span : 1),
  }))

  return {
    xCategories: x.labels,
    yCategories: y.labels,
    xValues: x.values,
    yValues: y.values,
    cells,
    min,
    max,
    stops,
  }
}

/**
 * One cut of the grid, collected as the rows are read.
 *
 * Values are keyed by label rather than held in a parallel array: the label is
 * all an echarts axis-label formatter is handed.
 */
function categoryAxis() {
  const labels: string[] = []
  const values = new Map<string, unknown>()
  const indexes = new Map<string, number>()

  return {
    labels,
    values,
    register(value: unknown): number {
      const label = categoryLabel(value)
      const existing = indexes.get(label)
      if (existing !== undefined) return existing
      indexes.set(label, labels.length)
      values.set(label, value)
      return labels.push(label) - 1
    },
  }
}

/**
 * The ends of the color scale. Config wins; the rest comes from the data,
 * except on a diverging ramp, where an unset end is mirrored from the larger
 * side so -4 in a -4..+12 series reads as deep as +4 does the other way.
 */
function resolveScale(
  config: HeatmapChartConfig,
  cells: { value: number }[],
): { min: number; max: number } {
  const values = cells.map((cell) => cell.value)
  const dataMin = values.length ? Math.min(...values) : 0
  const dataMax = values.length ? Math.max(...values) : 0

  if (config.palette === 'diverging') {
    const extent = Math.max(Math.abs(dataMin), Math.abs(dataMax))
    return {
      min: config.min ?? -extent,
      max: config.max ?? extent,
    }
  }

  return { min: config.min ?? dataMin, max: config.max ?? dataMax }
}

function categoryLabel(value: unknown): string {
  return value === null || value === undefined || value === ''
    ? BLANK_CATEGORY
    : String(value)
}

/**
 * How one category reads. The formatter is handed the value the row carried,
 * because the label the category is keyed by has already lost a Date.
 *
 * A blank category prints as the blank marker whatever the formatter does with
 * it: `(Blank)` says the rows named no category, and a formatter reading a date
 * out of `undefined` would say something worse.
 */
export function heatmapCategoryLabel(
  format: ChartCategoryFormatter | undefined,
  values: Map<string, unknown>,
  label: string,
): string {
  if (!format || label === BLANK_CATEGORY) return label
  return format(values.get(label))
}

/**
 * The `axisLabel` keys that print a category, or none when no formatter was
 * given — echarts then prints the category itself.
 */
function categoryLabelFormatter(
  format: ChartCategoryFormatter | undefined,
  values: Map<string, unknown>,
) {
  if (!format) return {}
  return {
    formatter: (label: string) => heatmapCategoryLabel(format, values, label),
  }
}

export function buildHeatmapOption(
  config: HeatmapChartConfig,
  context: HeatmapOptionContext,
): EChartsCoreOption {
  const { tokens, format, xFormat, yFormat } = context
  const isRTL = config.dir === 'rtl'
  const matrix = buildHeatmapMatrix(config, context)
  const showDataLabels = Boolean(config.showDataLabels)

  const option = {
    ...chartShell(),
    // No `tooltip` key and no TooltipComponent: a heatmap has no axis pointer
    // worth drawing, and the plot is read cell by cell.
    grid: {
      top: 4,
      bottom: 0,
      left: 0,
      right: 4,
      outerBoundsMode: 'same',
      outerBoundsContain: 'all',
    },
    xAxis: {
      type: 'category',
      data: matrix.xCategories,
      // RTL reads right-to-left along the horizontal axis, as it does on every
      // other chart in here.
      inverse: isRTL,
      position: 'bottom',
      // A cell already fills its slot, so a rule under it locates nothing.
      splitLine: { show: false },
      splitArea: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        hideOverlap: true,
        margin: AXIS_LABEL_MARGIN,
        color: tokens.label,
        fontSize: AXIS_LABEL_FONT_SIZE * (tokens.fontScale ?? 1),
        ...categoryLabelFormatter(xFormat, matrix.xValues),
      },
    },
    yAxis: {
      type: 'category',
      data: matrix.yCategories,
      // echarts counts a category axis up from the bottom; a grid is read from
      // the top down, so the first category has to sit on the first row.
      inverse: true,
      position: isRTL ? 'right' : 'left',
      splitLine: { show: false },
      splitArea: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        hideOverlap: true,
        margin: AXIS_LABEL_MARGIN,
        color: tokens.label,
        fontSize: AXIS_LABEL_FONT_SIZE * (tokens.fontScale ?? 1),
        ...categoryLabelFormatter(yFormat, matrix.yValues),
      },
    },
    // Hidden: the ramp is explained by the chart's own scale. This one only
    // exists to map values onto colors.
    visualMap: {
      type: 'continuous',
      show: false,
      calculable: false,
      min: visualMapMin(matrix),
      max: matrix.max,
      inRange: { color: matrix.stops },
      seriesIndex: 0,
    },
    series: [
      {
        type: 'heatmap',
        name: config.valueColumn,
        // Drawn in the surface behind the plot rather than left out: a cell is
        // a filled rect, so the only way to separate two of them is a border.
        itemStyle: {
          borderRadius: CELL_RADIUS,
          borderWidth: CELL_BORDER_WIDTH,
          borderColor: tokens.grid,
        },
        // Hover only lifts the fill. A ring or a lift round one cell reads as an
        // outline drawn on the data, and a heatmap is read by comparing fills.
        emphasis: {
          focus: 'none',
          itemStyle: {
            borderColor: tokens.grid,
            borderWidth: CELL_BORDER_WIDTH,
            shadowBlur: 0,
            shadowColor: 'transparent',
          },
        },
        label: {
          show: showDataLabels,
          color: tokens.label,
          fontSize: DATA_LABEL_FONT_SIZE * (tokens.fontScale ?? 1),
          formatter: (params: { value?: unknown }) => {
            const value = cellValue(params)
            return format ? format(value) : formatValue(value, 1, true)
          },
        },
        // What makes `showDataLabels` mean "when they fit": a label with no room
        // collides with its neighbour, and the loser is dropped rather than
        // printed over the cell next door.
        labelLayout: { hideOverlap: true },
        data: matrix.cells.map((cell) => ({
          value: [cell.xIndex, cell.yIndex, cell.value],
        })),
      },
    ],
  }

  return mergeDeep(option, config.echartOptions) as EChartsCoreOption
}

/**
 * echarts needs a span to interpolate across. A flat grid has none, so the
 * bottom of the scale is dropped below the value every cell holds — which puts
 * all of them at the top of the ramp, the same place `buildHeatmapMatrix` puts
 * them.
 */
function visualMapMin(matrix: HeatmapMatrix): number {
  return matrix.max > matrix.min ? matrix.min : matrix.max - 1
}

function cellValue(params: { value?: unknown }): number {
  const value = params.value
  return Array.isArray(value) ? Number(value[2]) : Number(value)
}
