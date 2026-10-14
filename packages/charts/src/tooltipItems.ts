import { formatLabel, formatValue } from './format'
import type {
  AxisChartSeriesConfig,
  ChartTooltipColumn,
  ChartTooltipItem,
} from './types'

/**
 * What a series is called wherever it prints: its own label, else its name.
 * Ported from frappe-ui's `seriesData.ts`, where the legend, the tooltip and a
 * chart's own reading all read one label.
 */
export function seriesLabel(series: AxisChartSeriesConfig): string {
  return series.label ?? formatLabel(series.name)
}

export type TooltipItemsArgs = {
  /** The plotted row the pointer is over, in the config's wide shape. */
  row: Record<string, unknown>
  /** The series the chart draws, in drawing order. */
  series: AxisChartSeriesConfig[]
  /** Series the legend has switched off. Dropped from the readings. */
  hiddenSeries?: string[]
  /** Series colors, keyed by name. A missing entry leaves the swatch off. */
  colors?: Record<string, string | undefined>
  /** Prints a series value in the unit of the axis it is drawn against. */
  formatSeries?: (series: AxisChartSeriesConfig, value: number) => string
  /** Each series' share of its stack, for this row. Only a normalized plot sets it. */
  shares?: Map<string, (number | null)[]>
  /** The row's position, for reading `shares`. */
  index: number
  /** Row keys that print in the tooltip and nowhere else. */
  tooltipColumns?: ChartTooltipColumn[]
}

/**
 * The rows a shared tooltip prints for one plotted row. Series rows are ranked
 * by magnitude, biggest first. Context rows are drawn nowhere and usually in
 * another unit, so they keep the author's order and print after every series.
 */
export function buildTooltipItems(args: TooltipItemsArgs): ChartTooltipItem[] {
  return [...seriesItems(args), ...contextItems(args)]
}

/** A series row is ranked, so it carries a number by the time it is returned. */
type SeriesItem = ChartTooltipItem & { value: number; kind: 'series' }

function seriesItems(args: TooltipItemsArgs): ChartTooltipItem[] {
  const hidden = args.hiddenSeries ?? []

  return (
    args.series
      .filter((series) => !hidden.includes(series.name))
      .map((series): SeriesItem => {
        const value = Number(args.row[series.name])
        return {
          name: series.name,
          label: seriesLabel(series),
          color: args.colors?.[series.name],
          value,
          formattedValue: args.formatSeries
            ? args.formatSeries(series, value)
            : formatValue(value),
          // A normalized plot draws the share, so the tooltip is the only place
          // the measured number survives — it carries both.
          percent: args.shares?.get(series.name)?.[args.index] ?? undefined,
          kind: 'series',
        }
      })
      // A series that silently drops out of the tooltip reads as a bug, so a zero
      // stays. Only a blank cell is dropped.
      .filter((item) => !Number.isNaN(item.value))
      .sort((a, b) => b.value - a.value)
  )
}

function contextItems(args: TooltipItemsArgs): ChartTooltipItem[] {
  return (args.tooltipColumns ?? [])
    .map((column) => ({ column, value: args.row[column.name] }))
    .filter(
      ({ value }) => value !== null && value !== undefined && value !== '',
    )
    .map(({ column, value }) => ({
      name: column.name,
      label: column.label ?? formatLabel(column.name),
      value: typeof value === 'number' ? value : String(value),
      formattedValue: formatColumnValue(column, value),
      kind: 'context' as const,
    }))
}

function formatColumnValue(column: ChartTooltipColumn, value: unknown): string {
  if (
    column.format &&
    (typeof value === 'number' || typeof value === 'string')
  ) {
    return column.format(value)
  }
  return typeof value === 'number' ? formatValue(value) : String(value)
}
