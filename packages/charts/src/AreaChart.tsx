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
import type { AreaChartProps } from './types'

use([
  LineSeries,
  BarSeries,
  GridComponent,
  DataZoomComponent,
  DataZoomSliderComponent,
  BrushComponent,
])

/**
 * An area chart: a line chart whose unmarked series carry a fill. Zoom,
 * brush and double-click work exactly as they do on `LineChart`.
 */
export function AreaChart(props: AreaChartProps): JSX.Element {
  const tokens = useChartTokens()
  const config = createMemo(() => normalizeAxisChart(props, 'area'))
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
      label={props['aria-label'] ?? props.title ?? 'Area chart'}
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
