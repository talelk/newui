import { createMemo, type JSX } from 'solid-js'
import { ChartBase } from './ChartBase'
import { buildFunnelOption } from './funnelOptions'
import { funnelFallback, normalizeFunnelChart } from './normalize'
import { useChartTokens } from './tokens'
import type { FunnelChartProps } from './types'

/**
 * A funnel chart: one band per stage, in the order the rows arrive. The order
 * is the process, not the magnitude, so the stages are never sorted. Colors
 * default to the sequential ramp reversed, so the band deepens as the
 * population narrows.
 */
export function FunnelChart(props: FunnelChartProps): JSX.Element {
  const tokens = useChartTokens()
  const config = createMemo(() => normalizeFunnelChart(props))
  const option = createMemo(() =>
    buildFunnelOption(config(), {
      tokens: tokens(),
      format: props.format,
    }),
  )

  return (
    <ChartBase
      option={option}
      label={props['aria-label'] ?? props.title ?? 'Funnel chart'}
      height={props.height}
      class={props.class}
      title={props.title}
      subtitle={props.subtitle}
      loading={props.loading}
      error={props.error}
      fallback={funnelFallback(config())}
    />
  )
}
