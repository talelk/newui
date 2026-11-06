import { BarChart as BarSeries, LineChart as LineSeries } from 'echarts/charts'
import {
  BrushComponent,
  DataZoomComponent,
  DataZoomSliderComponent,
  GridComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { createMemo, type JSX } from 'solid-js'
import { createAxisInteractions } from './axisInteractions'
import { ChartBase } from './ChartBase'
import { axisFallback, axisFormat, normalizeAxisChart } from './normalize'
import { buildAxisChartOption } from './options'
import { useChartTokens } from './tokens'
import type { BarChartProps } from './types'

use([
  BarSeries,
  LineSeries,
  GridComponent,
  DataZoomComponent,
  DataZoomSliderComponent,
  BrushComponent,
])

/**
 * A bar chart: an axis chart whose unmarked series draw as bars. `horizontal`
 * moves the category axis to Y, and the bars then run left to right. Zoom,
 * brush and double-click work as on `LineChart`, except that a horizontal
 * chart's categories sit on the value-crossing axis, where the range
 * interactions do not apply.
 */
export function BarChart(props: BarChartProps): JSX.Element {
  const tokens = useChartTokens()
  const config = createMemo(() =>
    normalizeAxisChart(props, 'bar', Boolean(props.horizontal)),
  )
  const interactions = createAxisInteractions(config, props)
  const option = createMemo(() =>
    buildAxisChartOption(config(), {
      tokens: tokens(),
      hiddenSeries: props.hiddenSeries,
      format: axisFormat(props),
      interactions: interactions.extras(),
    }),
  )

  return (
    <ChartBase
      option={option}
      label={props['aria-label'] ?? props.title ?? 'Bar chart'}
      height={props.height}
      class={props.class}
      title={props.title}
      subtitle={props.subtitle}
      loading={props.loading}
      error={props.error}
      fallback={interactions.fallbackFor(axisFallback(config()))}
      actions={interactions.toolbar()}
      group={props.group}
      plotFocusable={interactions.zoomable()}
      onPlotKeyDown={interactions.onPlotKeyDown}
      onInit={interactions.bind}
    />
  )
}
