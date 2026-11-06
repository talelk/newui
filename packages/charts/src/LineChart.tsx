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
import type { LineChartProps } from './types'

// The interaction components ride along: a line chart that zooms or brushes
// registers the same capabilities whether the props ask for them or not.
use([
  LineSeries,
  BarSeries,
  GridComponent,
  DataZoomComponent,
  DataZoomSliderComponent,
  BrushComponent,
])

/**
 * A line chart: an axis chart whose unmarked series draw as lines. With
 * `zoom`/`defaultZoom` it carries a range slider, keyboard zoom (the plot
 * takes focus; `+`/`-` zoom, arrows pan) and a fallback table that tracks the
 * visible window. With `brush` it draws a range selection whose data values
 * come back through `onBrushChange`.
 */
export function LineChart(props: LineChartProps): JSX.Element {
  const tokens = useChartTokens()
  const config = createMemo(() => normalizeAxisChart(props, 'line'))
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
      label={props['aria-label'] ?? props.title ?? 'Line chart'}
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
