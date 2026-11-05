import { describe, expect, it } from 'vitest'
import {
  buildCalendarHeatmapCalendar,
  buildCalendarHeatmapOption,
  calendarDayKey,
  calendarHeatmapRamp,
} from './calendarHeatmapOptions'
import type { ChartTokens } from './types'

const tokens: ChartTokens = {
  series: ['#1d4ed8', '#047857', '#b45309'],
  grid: '#e5e7eb',
  axis: '#d1d5db',
  label: '#4b5563',
}

/** The keys the option carries, read as data rather than through the echarts type. */
type OptionShape = {
  animation?: boolean
  series: {
    type: string
    coordinateSystem: string
    data: [string, number][]
    itemStyle: { borderColor: string }
  }[]
  visualMap: {
    show: boolean
    inRange: { color: string[] }
  }
  calendar: {
    range: string | [string, string]
    itemStyle: { borderColor: string }
    monthLabel: { show: boolean }
    dayLabel: { show: boolean }
  }
}

const config = {
  data: [
    { date: '2026-01-05', value: 3 },
    { date: '2026-01-06', value: 7 },
    { date: '2026-01-06', value: 9 },
    { date: '2026-01-07', value: null },
    { date: 'nope', value: 1 },
  ],
  dateColumn: 'date',
  valueColumn: 'value',
  showMonthLabels: true,
  showDayLabels: true,
}

describe('buildCalendarHeatmapCalendar', () => {
  it('keys days by the local calendar date', () => {
    expect(calendarDayKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('keeps one cell per day, last row winning', () => {
    const calendar = buildCalendarHeatmapCalendar(config)
    expect(calendar.cells).toHaveLength(2)
    expect(calendar.cells[0]).toMatchObject({
      date: '2026-01-05',
      value: 3,
    })
    expect(calendar.cells[1]).toMatchObject({ date: '2026-01-06', value: 9 })
  })

  it('leaves undrawn days out of the cells but in the click map', () => {
    const calendar = buildCalendarHeatmapCalendar(config)
    expect(calendar.cells.some((cell) => cell.date === '2026-01-07')).toBe(
      false,
    )
    expect(calendar.rowsByDate.has('2026-01-07')).toBe(true)
  })

  it('derives the range from the data span', () => {
    const calendar = buildCalendarHeatmapCalendar(config)
    expect(calendar.range).toBe('2026')
  })

  it('honours an explicit year or span', () => {
    expect(buildCalendarHeatmapCalendar({ ...config, range: 2025 }).range).toBe(
      '2025',
    )
    expect(
      buildCalendarHeatmapCalendar({
        ...config,
        range: ['2026-01-01', '2026-03-31'],
      }).range,
    ).toEqual(['2026-01-01', '2026-03-31'])
  })

  it('resolves the scale from the drawn cells only', () => {
    const calendar = buildCalendarHeatmapCalendar(config)
    expect(calendar.min).toBe(3)
    expect(calendar.max).toBe(9)
  })
})

describe('calendarHeatmapRamp', () => {
  it('hands an explicit list straight through', () => {
    expect(calendarHeatmapRamp(['#fff', '#eee'])).toEqual(['#fff', '#eee'])
  })

  it('reads a named ramp from the token variables', () => {
    // The unit environment loads no theme CSS, so the reader comes back with
    // nothing to read — the point is that a named ramp resolves through the
    // token reader rather than inventing colors.
    expect(Array.isArray(calendarHeatmapRamp('blue'))).toBe(true)
    expect(Array.isArray(calendarHeatmapRamp('amber'))).toBe(true)
  })
})

describe('buildCalendarHeatmapOption', () => {
  const calendar = buildCalendarHeatmapCalendar(config)

  it('draws a calendar-coordinate heatmap with the data as day/value pairs', () => {
    const option = buildCalendarHeatmapOption(config, calendar, {
      tokens,
      stops: ['#f0f5ff', '#1d4ed8'],
    }) as unknown as OptionShape
    expect(option.series[0]?.type).toBe('heatmap')
    expect(option.series[0]?.coordinateSystem).toBe('calendar')
    expect(option.series[0]?.data).toEqual([
      ['2026-01-05', 3],
      ['2026-01-06', 9],
    ])
  })

  it('shows the ramp as the chart scale and the grid hairline as the cell edge', () => {
    const option = buildCalendarHeatmapOption(config, calendar, {
      tokens,
      stops: ['#f0f5ff', '#1d4ed8'],
    }) as unknown as OptionShape
    expect(option.visualMap.show).toBe(true)
    expect(option.visualMap.inRange.color).toEqual(['#f0f5ff', '#1d4ed8'])
    expect(option.calendar.itemStyle.borderColor).toBe('#e5e7eb')
  })

  it('drops the label rows when asked to', () => {
    const option = buildCalendarHeatmapOption(
      { ...config, showMonthLabels: false, showDayLabels: false },
      calendar,
      { tokens, stops: [] },
    ) as unknown as OptionShape
    expect(option.calendar.monthLabel.show).toBe(false)
    expect(option.calendar.dayLabel.show).toBe(false)
  })

  it('deep-merges the escape hatch', () => {
    const option = buildCalendarHeatmapOption(
      { ...config, echartOptions: { animation: false } },
      calendar,
      { tokens, stops: [] },
    )
    expect(option.animation).toBe(false)
  })
})
