import type { EChartsCoreOption } from 'echarts/core'
import { toDate } from './format'
import { AXIS_LABEL_FONT_SIZE, chartShell, mergeDeep } from './options'
import { readPaletteRamp } from './tokens'
import type {
  CalendarHeatmapCalendar,
  CalendarHeatmapCell,
  CalendarHeatmapConfig,
  CalendarHeatmapPalette,
  ChartTokens,
  ChartValueFormatter,
} from './types'

// The calendar heatmap is a heatmap with a date axis instead of a category
// axis: one cell per day, shaded along a single-hue ramp. Everything the click
// handler needs — the range, the cells, the row behind each day — comes out of
// the same pure pass, so a click cannot disagree with what is drawn.

export type CalendarHeatmapOptionContext = {
  tokens: ChartTokens
  /** The ramp, low end first, read from the palette. */
  stops: string[]
  /** Prints the legend scale's ends. */
  format?: ChartValueFormatter
}

/**
 * The ramp the days shade along. `'blue'` is the house single-hue ramp,
 * `'amber'` the warning ramp; both come from the semantic surface steps, so
 * the ramp is tokens all the way down and flips with the theme. An explicit
 * list overrides both.
 */
export function calendarHeatmapRamp(
  palette: CalendarHeatmapPalette | undefined,
): string[] {
  if (Array.isArray(palette)) return palette
  return readPaletteRamp(palette === 'amber' ? 'amber' : 'blue')
}

/**
 * The day key echarts draws a cell under. Local fields, so a date parsed from
 * `YYYY-MM-DD` stays the day it names rather than shifting across the epoch.
 */
export function calendarDayKey(day: Date): string {
  const year = day.getFullYear()
  const month = `${day.getMonth() + 1}`.padStart(2, '0')
  const date = `${day.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${date}`
}

/**
 * The calendar as the plot and the click handler both read it: the range key
 * echarts lays the grid out on, one cell per day that carried a reading, and
 * every valid day's row — including the days drawn without one, so a click on
 * a blank cell still resolves.
 */
export function buildCalendarHeatmapCalendar(
  config: CalendarHeatmapConfig,
): CalendarHeatmapCalendar {
  const rowsByDate = new Map<string, Record<string, unknown>>()
  const values = new Map<string, number>()
  let first: Date | null = null
  let last: Date | null = null

  for (const row of config.data) {
    const day = toDate(row[config.dateColumn])
    if (!day) continue
    const key = calendarDayKey(day)
    if (!first || day < first) first = day
    if (!last || day > last) last = day
    rowsByDate.set(key, row)
    const value = Number(row[config.valueColumn])
    // Rows with no numeric value leave the day undrawn rather than inventing
    // a zero cell — the same rule the categorical heatmap follows.
    if (
      row[config.valueColumn] === null ||
      row[config.valueColumn] === undefined
    )
      continue
    if (!Number.isFinite(value)) continue
    values.set(key, value)
  }

  const cells: CalendarHeatmapCell[] = [...values.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, value]) => ({
      date,
      value,
      row: rowsByDate.get(date) ?? {},
    }))

  const found = [...values.values()]
  const min = found.length ? Math.min(...found) : 0
  const max = found.length ? Math.max(...found) : 0

  return {
    range: resolveRange(config.range, first, last),
    cells,
    rowsByDate,
    min,
    max,
  }
}

/**
 * The grid's span. A year is a year; otherwise the data's own first and last
 * day, so a quarter reads as a quarter rather than as a year with holes in it.
 */
function resolveRange(
  range: number | [string, string] | undefined,
  first: Date | null,
  last: Date | null,
): string | [string, string] {
  if (typeof range === 'number') return String(range)
  if (Array.isArray(range)) {
    const start = toDate(range[0])
    const end = toDate(range[1])
    if (start && end) return [calendarDayKey(start), calendarDayKey(end)]
  }
  if (!first || !last) return String(new Date().getFullYear())
  if (first.getFullYear() === last.getFullYear()) {
    return String(first.getFullYear())
  }
  return [calendarDayKey(first), calendarDayKey(last)]
}

/**
 * The echarts option: a calendar coordinate system, the days drawn by the
 * heatmap series, and a continuous `visualMap` showing the ramp as the
 * chart's own scale. No tooltip — the calendar is read day by day, and the
 * reading travels with the click.
 */
export function buildCalendarHeatmapOption(
  config: CalendarHeatmapConfig,
  calendar: CalendarHeatmapCalendar,
  context: CalendarHeatmapOptionContext,
): EChartsCoreOption {
  const { tokens } = context
  const showMonthLabels = config.showMonthLabels ?? true
  const showDayLabels = config.showDayLabels ?? true
  const label = {
    color: tokens.label,
    fontSize: AXIS_LABEL_FONT_SIZE * (tokens.fontScale ?? 1),
  }

  return mergeDeep(
    {
      ...chartShell(),
      visualMap: {
        type: 'continuous',
        show: true,
        calculable: false,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        itemWidth: 14,
        itemHeight: 8,
        min: calendar.min,
        max: calendar.max,
        inRange: { color: context.stops },
        seriesIndex: 0,
        text: ['More', 'Less'],
        textStyle: label,
        formatter: (value: number) =>
          context.format ? context.format(value) : String(value),
      },
      calendar: {
        range: calendar.range,
        cellSize: config.cellSize ?? 'auto',
        // The month names ride the top, the weekday names the left, and the
        // ramp scale the bottom — so the grid itself keeps the middle.
        top: 4,
        left: showDayLabels ? 40 : 8,
        right: 8,
        bottom: 36,
        // Cells sit edge to edge; the only separator is the hairline.
        itemStyle: { borderWidth: 1, borderColor: tokens.grid },
        splitLine: { show: true, lineStyle: { color: tokens.grid } },
        dayLabel: {
          show: showDayLabels,
          nameMap: 'EN',
          firstDay: 1,
          margin: 8,
          ...label,
        },
        monthLabel: {
          show: showMonthLabels,
          nameMap: 'EN',
          position: 'top',
          margin: 12,
          ...label,
        },
        yearLabel: { show: false },
      },
      series: [
        {
          type: 'heatmap',
          coordinateSystem: 'calendar',
          name: config.valueColumn,
          data: calendar.cells.map((cell) => [cell.date, cell.value]),
          itemStyle: { borderWidth: 1, borderColor: tokens.grid },
          // Hover only lifts the edge; the ramp carries the meaning, not the hover.
          emphasis: {
            itemStyle: { borderColor: tokens.axis, borderWidth: 1 },
          },
        },
      ],
    },
    config.echartOptions,
  ) as EChartsCoreOption
}
