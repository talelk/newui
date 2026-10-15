import { BarChart as BarSeries, LineChart as LineSeries } from 'echarts/charts'
import { GridComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { createMemo, type JSX } from 'solid-js'
import { ChartBase } from './ChartBase'
import { axisFallback, axisFormat, normalizeAxisChart } from './normalize'
import { buildAxisChartOption } from './options'
import { useChartTokens } from './tokens'
import type { LineChartProps } from './types'

use([LineSeries, BarSeries, GridComponent])

/** A line chart: an axis chart whose unmarked series draw as lines. */
export function LineChart(props: LineChartProps): JSX.Element {
  const tokens = useChartTokens()
  const config = createMemo(() => normalizeAxisChart(props, 'line'))
  const option = createMemo(() =>
    buildAxisChartOption(config(), {
      tokens: tokens(),
      hiddenSeries: props.hiddenSeries,
      format: axisFormat(props),
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
      fallback={axisFallback(config())}
    />
  )
}
