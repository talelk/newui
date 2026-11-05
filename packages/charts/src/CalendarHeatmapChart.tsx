import { HeatmapChart as HeatmapSeries } from 'echarts/charts'
import {
  CalendarComponent,
  VisualMapContinuousComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { createMemo, type JSX, untrack } from 'solid-js'
import { ChartBase } from './ChartBase'
import {
  buildCalendarHeatmapCalendar,
  buildCalendarHeatmapOption,
  calendarHeatmapRamp,
} from './calendarHeatmapOptions'
import {
  calendarHeatmapFallback,
  normalizeCalendarHeatmapChart,
} from './normalize'
import { useChartTokens } from './tokens'
import type { CalendarHeatmapChartProps } from './types'

use([HeatmapSeries, CalendarComponent, VisualMapContinuousComponent])

/**
 * Activity per day, laid out as a year: a heatmap on the calendar coordinate
 * system, one cell per day, shaded along a single-hue ramp (the house blue, or
 * the amber warning ramp). Days with no reading stay undrawn rather than
 * reading as zero.
 *
 * A day click emits `onPointClick` with the day, its value and the row behind
 * it. What the click *does* — driving `cross`, opening a day — is the page's
 * business, not the chart's.
 */
export function CalendarHeatmapChart(
  props: CalendarHeatmapChartProps,
): JSX.Element {
  const tokens = useChartTokens()
  const config = createMemo(() => normalizeCalendarHeatmapChart(props))
  const calendar = createMemo(() => buildCalendarHeatmapCalendar(config()))
  const option = createMemo(() =>
    buildCalendarHeatmapOption(config(), calendar(), {
      tokens: tokens(),
      stops: calendarHeatmapRamp(config().palette),
      format: props.format,
    }),
  )

  // A day click is the read: the calendar is sampled at event time, not
  // tracked, so `untrack` states that intent to the reactivity linter.
  const emitClick = (params: unknown) => {
    const event = params as { componentType?: string; value?: unknown }
    if (event.componentType !== 'series' || !Array.isArray(event.value)) return
    const [date, value] = event.value as [unknown, unknown]
    const key = String(date)
    const reading = typeof value === 'number' ? value : null
    const row = untrack(() => calendar().rowsByDate.get(key)) ?? {}
    props.onPointClick?.({ date: key, value: reading, row })
  }

  return (
    <ChartBase
      option={option}
      label={props['aria-label'] ?? props.title ?? 'Calendar heatmap'}
      height={props.height}
      class={props.class}
      title={props.title}
      subtitle={props.subtitle}
      loading={props.loading}
      error={props.error}
      fallback={calendarHeatmapFallback(config(), calendar())}
      onInit={(chart) => {
        chart.on('click', emitClick)
      }}
    />
  )
}
