import { createMemo, type JSX } from 'solid-js'
import { ChartBase } from './ChartBase'
import { normalizeScatterChart, scatterFallback } from './normalize'
import { buildScatterOption } from './scatterOptions'
import { useChartTokens } from './tokens'
import type { ScatterChartProps } from './types'

/**
 * A scatter chart: one point per row, on a pair of value axes. Points group
 * into a series by `splitBy`, and a `size` column maps a magnitude onto the
 * symbol diameter. A row missing either coordinate is not drawn.
 */
export function ScatterChart(props: ScatterChartProps): JSX.Element {
  const tokens = useChartTokens()
  const config = createMemo(() => normalizeScatterChart(props))
  const option = createMemo(() =>
    buildScatterOption(config(), {
      tokens: tokens(),
      hiddenSeries: props.hiddenSeries,
      format: { x: props.xAxis?.format, y: props.yAxis?.format },
    }),
  )

  return (
    <ChartBase
      option={option}
      label={props['aria-label'] ?? props.title ?? 'Scatter chart'}
      height={props.height}
      class={props.class}
      title={props.title}
      subtitle={props.subtitle}
      loading={props.loading}
      error={props.error}
      fallback={scatterFallback(config())}
    />
  )
}
