import type { EChartsCoreOption } from 'echarts/core'
import { formatLabel, toNumber } from './format'
import {
  AXIS_LABEL_FONT_SIZE,
  buildValueAxis,
  chartShell,
  DATA_LABEL_FONT_SIZE,
  mergeDeep,
  paletteColors,
} from './options'
import type {
  ChartPaletteName,
  ChartTokens,
  ChartValueAxisOptions,
  ChartValueFormatter,
  ScatterChartConfig,
  ScatterPoint,
  ScatterSeries,
} from './types'

// Plot, legend and readout all read the same `ScatterSeries[]`, so the point
// under the pointer can't disagree with the one the option drew.

export type ScatterOptionContext = {
  tokens: ChartTokens
  /** Series names the legend has switched off. Dropped from the option. */
  hiddenSeries?: string[]
  /** Prints the numbers the option itself prints, i.e. the two axis scales. */
  format?: {
    x?: ChartValueFormatter
    y?: ChartValueFormatter
  }
}

const SCATTER_PALETTE: ChartPaletteName = 'categorical'

/** Diameter of a point carrying no magnitude, and the floor of the bubble range. */
const MIN_SYMBOL_SIZE = 10
/** As wide as a bubble gets before it starts swallowing its neighbours. */
const MAX_SYMBOL_SIZE = 35

/** Points overlap by nature, so they have to read through each other. */
const SYMBOL_OPACITY = 0.75

/**
 * Room between the cloud and the axis lines. A symbol is centred on its
 * coordinate and clipped at the grid edge, so a point at the very top of the
 * scale would otherwise be drawn as a half circle sitting on the frame.
 */
const AXIS_INSET = '6%'

const BLANK_GROUP = '(Blank)'

/**
 * The points as they are drawn: rows coerced to a pair of coordinates, grouped
 * into series, and every magnitude mapped onto a symbol diameter. Grouping and
 * the size scale both run over the whole dataset, so a bubble means the same
 * thing in every group.
 */
export function buildScatterSeries(
  config: ScatterChartConfig,
  { tokens }: ScatterOptionContext,
): ScatterSeries[] {
  const rows = config.data ?? []
  const names: string[] = []
  const grouped = new Map<string, Omit<ScatterPoint, 'symbolSize'>[]>()
  const sizes: number[] = []

  for (const row of rows) {
    const x = toNumber(row[config.xColumn])
    const y = toNumber(row[config.yColumn])
    // A point is a pair of coordinates. With one of them missing there is
    // nowhere on the plot to put it.
    if (x === null || y === null) continue

    const name = seriesName(config, row)
    let points = grouped.get(name)
    if (!points) {
      points = []
      names.push(name)
      grouped.set(name, points)
    }

    const size = config.sizeColumn ? toNumber(row[config.sizeColumn]) : null
    if (size !== null) sizes.push(size)

    points.push({ x, y, size, label: pointLabel(config, row), row })
  }

  const scale = symbolSizeScale(sizes, Boolean(config.sizeColumn))
  const colors = paletteColors(
    config.palette,
    tokens,
    names.length,
    SCATTER_PALETTE,
  )

  return names.map((name, index) => ({
    name,
    label: formatLabel(name),
    color: colors[index] ?? '',
    points: (grouped.get(name) ?? []).map((point) => ({
      ...point,
      symbolSize: scale(point.size),
    })),
  }))
}

function seriesName(config: ScatterChartConfig, row: Record<string, unknown>) {
  if (!config.splitByColumn) return config.yColumn
  const value = row[config.splitByColumn]
  return value === null || value === undefined || value === ''
    ? BLANK_GROUP
    : String(value)
}

function pointLabel(
  config: ScatterChartConfig,
  row: Record<string, unknown>,
): string | undefined {
  if (!config.labelColumn) return undefined
  const value = row[config.labelColumn]
  return value === null || value === undefined ? undefined : String(value)
}

/** Magnitude to symbol diameter, over the magnitudes of the whole plot. */
function symbolSizeScale(sizes: number[], hasSizeColumn: boolean) {
  if (!hasSizeColumn) return () => MIN_SYMBOL_SIZE

  const scale = magnitudeScale(sizes)
  // A row whose magnitude is blank still reads x against y, so it draws — at
  // the floor, which is the size a plain scatter point has anyway.
  return (size: number | null) =>
    size === null ? MIN_SYMBOL_SIZE : scale(size)
}

function magnitudeScale(sizes: number[]) {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (const size of sizes) {
    if (size < min) min = size
    if (size > max) max = size
  }

  // One distinct magnitude says nothing about relative size. Drawing every
  // bubble at the floor would claim they are all the smallest there is, so the
  // whole column collapses onto the middle of the range instead.
  if (min === max) {
    const middle = (MIN_SYMBOL_SIZE + MAX_SYMBOL_SIZE) / 2
    return () => middle
  }

  const span = MAX_SYMBOL_SIZE - MIN_SYMBOL_SIZE
  return (size: number) => MIN_SYMBOL_SIZE + ((size - min) / (max - min)) * span
}

/**
 * Whether the points print their own names. A scatter labels a point with what
 * it *is*, not with what it measures: both of its measures are already on the
 * axes, so printing one of them beside the symbol says nothing the plot did not.
 * That leaves the label column, and a chart naming none has nothing to print.
 */
function showLabels(config: ScatterChartConfig): boolean {
  return Boolean(config.showDataLabels && config.labelColumn)
}

export function buildScatterOption(
  config: ScatterChartConfig,
  context: ScatterOptionContext,
): EChartsCoreOption {
  const { tokens, hiddenSeries = [], format } = context
  const isRTL = config.dir === 'rtl'
  const series = buildScatterSeries(config, context)
  const visible = series.filter((entry) => !hiddenSeries.includes(entry.name))
  const labelled = showLabels(config)

  const option = {
    ...chartShell(),
    // No `tooltip` key and no TooltipComponent: a point is read on its own
    // rather than through an axis pointer.
    grid: {
      top: 8,
      bottom: 0,
      left: 2,
      right: 2,
      outerBoundsMode: 'same',
      outerBoundsContain: 'all',
    },
    xAxis: scatterAxis(config.xAxis, tokens, {
      horizontal: true,
      isRTL,
      format: format?.x,
      name: config.xAxis?.title,
    }),
    yAxis: scatterAxis(config.yAxis, tokens, {
      horizontal: false,
      isRTL,
      format: format?.y,
    }),
    series: visible.map((entry) =>
      buildSeries(entry, { tokens, isRTL, showLabels: labelled }),
    ),
  }

  return mergeDeep(option, config.echartOptions) as EChartsCoreOption
}

function buildSeries(
  entry: ScatterSeries,
  opts: { tokens: ChartTokens; isRTL: boolean; showLabels: boolean },
) {
  const { tokens, isRTL, showLabels } = opts

  return {
    type: 'scatter',
    name: entry.name,
    data: entry.points.map((point) => ({
      value: [point.x, point.y],
      symbolSize: point.symbolSize,
      // The point's own name, carried on the item because that is where echarts
      // reads a datapoint label from. A point whose label column is blank
      // carries an empty string, which draws nothing.
      ...(showLabels ? { name: point.label ?? '' } : {}),
    })),
    symbol: 'circle',
    itemStyle: { color: entry.color, opacity: SYMBOL_OPACITY, borderWidth: 0 },
    // A whole group lifts at a time, never a single point: a point only means
    // something against the cloud around it, and fading that cloud takes the
    // reading away.
    emphasis: { focus: 'series', blurScope: 'coordinateSystem' },
    // Left out entirely when nothing is labelled: a cloud that prints no names
    // carries no label option, and no layout pass over one.
    ...(showLabels
      ? {
          label: {
            show: true,
            // Beside the symbol rather than over it, on the side the text runs
            // towards.
            position: isRTL ? 'left' : 'right',
            color: tokens.label,
            fontSize: DATA_LABEL_FONT_SIZE * (tokens.fontScale ?? 1),
            // Stated rather than left to echarts, whose default for a cartesian
            // series prints the value: what the axes already say.
            formatter: (params: { name?: string }) => String(params.name ?? ''),
          },
          // Points overlap by nature, so their names would too. The cloud keeps
          // the names it has room for and drops the rest.
          labelLayout: { hideOverlap: true },
        }
      : {}),
  }
}

/**
 * One of the two value axes. `buildValueAxis` moves the scale to the bottom
 * edge when the chart is horizontal, so each axis here is built by handing it
 * the orientation that lands it on the right edge. Reusing it is what keeps a
 * scatter's gridlines, labels and min/max identical to the rest of the family.
 */
function scatterAxis(
  axis: ChartValueAxisOptions | undefined,
  tokens: ChartTokens,
  opts: {
    horizontal: boolean
    isRTL: boolean
    format?: ChartValueFormatter
    /** Axis title, for the axis that draws its own. */
    name?: string
  },
) {
  const { horizontal, isRTL, format, name } = opts

  const echartOptions = mergeDeep(
    {
      // A scatter is read for the shape of its cloud, so both scales follow the
      // data instead of anchoring to zero and squashing it into a corner.
      scale: true,
      boundaryGap: [AXIS_INSET, AXIS_INSET],
      ...(name
        ? {
            name: formatLabel(name),
            nameLocation: 'end',
            nameGap: 8,
            nameTextStyle: {
              color: tokens.label,
              fontSize: AXIS_LABEL_FONT_SIZE * (tokens.fontScale ?? 1),
            },
          }
        : {}),
      ...(format
        ? // Wrapped rather than handed over: echarts also passes the tick index.
          {
            axisLabel: { formatter: (value: unknown) => format(Number(value)) },
          }
        : {}),
    },
    axis?.echartOptions,
  )

  return buildValueAxis({ ...axis, echartOptions }, tokens, {
    horizontal,
    isRTL,
  })
}
