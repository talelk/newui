import { createMemo, type JSX } from 'solid-js'
import { ChartBase } from './ChartBase'
import { axisFallback, axisFormat, normalizeAxisChart } from './normalize'
import { buildAxisChartOption } from './options'
import { useChartTokens } from './tokens'
import type { BarChartProps } from './types'

/**
 * A bar chart: an axis chart whose unmarked series draw as bars. `horizontal`
 * moves the category axis to Y, and the bars then run left to right.
 */
export function BarChart(props: BarChartProps): JSX.Element {
  const tokens = useChartTokens()
  const config = createMemo(() =>
    normalizeAxisChart(props, 'bar', Boolean(props.horizontal)),
  )
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
      label={props['aria-label'] ?? props.title ?? 'Bar chart'}
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
