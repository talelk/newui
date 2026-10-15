import { SankeyChart as SankeySeries } from 'echarts/charts'
import { use } from 'echarts/core'
import { createMemo, type JSX } from 'solid-js'
import { ChartBase } from './ChartBase'
import { normalizeSankeyChart, sankeyFallback } from './normalize'
import { buildSankeyOption } from './sankeyOptions'
import { useChartTokens } from './tokens'
import type { SankeyChartProps } from './types'

use([SankeySeries])

/**
 * A sankey chart: one band per row, from a source node to a target node. The
 * layout is the reading, so nodes are not draggable. A row that closes a cycle
 * in the flow is dropped: a band has to move in one direction.
 */
export function SankeyChart(props: SankeyChartProps): JSX.Element {
  const tokens = useChartTokens()
  const config = createMemo(() => normalizeSankeyChart(props))
  const option = createMemo(() =>
    buildSankeyOption(config(), {
      tokens: tokens(),
      format: props.format,
    }),
  )

  return (
    <ChartBase
      option={option}
      label={props['aria-label'] ?? props.title ?? 'Sankey chart'}
      height={props.height}
      class={props.class}
      title={props.title}
      subtitle={props.subtitle}
      loading={props.loading}
      error={props.error}
      fallback={sankeyFallback(config())}
    />
  )
}
