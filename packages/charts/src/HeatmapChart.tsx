import { createMemo, type JSX } from 'solid-js'
import { ChartBase } from './ChartBase'
import { buildHeatmapOption } from './heatmapOptions'
import { heatmapFallback, normalizeHeatmapChart } from './normalize'
import { useChartTokens } from './tokens'
import type { HeatmapChartProps } from './types'

/**
 * A heatmap: one cell per row, on a grid of two category axes. The cell fill
 * runs along the chart ramp, so a magnitude reads as a shade. Cells that share
 * a coordinate collapse to one, last row winning.
 */
export function HeatmapChart(props: HeatmapChartProps): JSX.Element {
  const tokens = useChartTokens()
  const config = createMemo(() => normalizeHeatmapChart(props))
  const option = createMemo(() =>
    buildHeatmapOption(config(), {
      tokens: tokens(),
      format: props.format,
      xFormat: props.xAxis?.format,
      yFormat: props.yAxis?.format,
    }),
  )

  return (
    <ChartBase
      option={option}
      label={props['aria-label'] ?? props.title ?? 'Heatmap chart'}
      height={props.height}
      class={props.class}
      title={props.title}
      subtitle={props.subtitle}
      loading={props.loading}
      error={props.error}
      fallback={heatmapFallback(config())}
    />
  )
}
