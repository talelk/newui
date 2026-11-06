import { GaugeChart as GaugeSeries } from 'echarts/charts'
import { use } from 'echarts/core'
import { createMemo, type JSX } from 'solid-js'
import { ChartBase } from './ChartBase'
import { buildGaugeOption } from './gaugeOptions'
import { gaugeFallback, normalizeGaugeChart } from './normalize'
import { useChartTokens } from './tokens'
import type { GaugeChartProps } from './types'

use([GaugeSeries])

/**
 * One reading against one span, drawn as the house dial: a 1px track, a single
 * blue progress arc, the value centered in metric type. The palette is locked
 * to tokens — there is no `palette` prop to reach for, because a gauge is a
 * KPI read at a glance, not a place to decorate.
 */
export function GaugeChart(props: GaugeChartProps): JSX.Element {
  const tokens = useChartTokens()
  const config = createMemo(() => normalizeGaugeChart(props))
  const option = createMemo(() =>
    buildGaugeOption(config(), { tokens: tokens(), format: props.format }),
  )

  return (
    <ChartBase
      option={option}
      label={props['aria-label'] ?? props.title ?? 'Gauge chart'}
      height={props.height}
      class={props.class}
      title={props.title}
      subtitle={props.subtitle}
      loading={props.loading}
      error={props.error}
      group={props.group}
      fallback={gaugeFallback(config())}
    />
  )
}
