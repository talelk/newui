import { createMemo, type JSX } from 'solid-js'
import { ChartBase } from './ChartBase'
import { donutFallback, normalizeDonutChart } from './normalize'
import { buildDonutChartOption } from './options'
import { useChartTokens } from './tokens'
import type { DonutChartProps } from './types'

/**
 * A donut chart: one slice per row, biggest first, with the tail grouped into
 * "Others" past `maxSlices`. Colors default to the categorical ramp, because
 * slices are unrelated categories rather than steps of one magnitude.
 */
export function DonutChart(props: DonutChartProps): JSX.Element {
  const tokens = useChartTokens()
  const config = createMemo(() => normalizeDonutChart(props))
  const option = createMemo(() =>
    buildDonutChartOption(config(), {
      tokens: tokens(),
      hiddenSlices: props.hiddenSlices,
    }),
  )

  return (
    <ChartBase
      option={option}
      label={props['aria-label'] ?? props.title ?? 'Donut chart'}
      height={props.height}
      class={props.class}
      title={props.title}
      subtitle={props.subtitle}
      loading={props.loading}
      error={props.error}
      fallback={donutFallback(config())}
    />
  )
}
