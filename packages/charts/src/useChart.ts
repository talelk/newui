import {
  BarChart as BarSeries,
  FunnelChart as FunnelSeries,
  HeatmapChart as HeatmapSeries,
  LineChart as LineSeries,
  PieChart as PieSeries,
  SankeyChart as SankeySeries,
  ScatterChart as ScatterSeries,
} from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapContinuousComponent,
} from 'echarts/components'
import type { ECharts, EChartsCoreOption } from 'echarts/core'
import * as echarts from 'echarts/core'
import { LabelLayout } from 'echarts/features'
import { SVGRenderer } from 'echarts/renderers'
import {
  type Accessor,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  untrack,
} from 'solid-js'

// Registered once for the whole package. Only the pieces these charts draw are
// pulled in, which is what keeps the unused half of echarts out of a bundle.
//
// SVG only: it keeps text selectable and crisp at any DPI, and — unlike the
// canvas renderer — it works under jsdom, so a component test can mount a chart.
echarts.use([
  BarSeries,
  LineSeries,
  PieSeries,
  FunnelSeries,
  HeatmapSeries,
  ScatterSeries,
  SankeySeries,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  // The continuous visual map only: a heatmap has no piecewise scale to draw.
  VisualMapContinuousComponent,
  LabelLayout,
  SVGRenderer,
])

export type UseChartOptions = {
  /** The plot element. Set by a ref before `onMount` runs. */
  element: Accessor<HTMLElement | undefined>
  /** Getter, not a value: its reactive dependencies drive `setOption`. */
  option: Accessor<EChartsCoreOption>
  /** Called once the instance exists, e.g. to bind events. */
  onInit?: (chart: ECharts) => void
}

/**
 * Initialises an echarts instance on `element` and disposes it on cleanup, so
 * no node, listener or zrender instance outlives the component. The option is
 * re-applied whenever its reactive dependencies change.
 */
export function useChart(opts: UseChartOptions): {
  chart: Accessor<ECharts | undefined>
} {
  const [chart, setChart] = createSignal<ECharts | undefined>()

  onMount(() => {
    const el = opts.element()
    if (!el) return

    const instance = echarts.init(el, undefined, { renderer: 'svg' })
    setChart(instance)
    instance.setOption(untrack(opts.option))
    opts.onInit?.(instance)

    const observer =
      typeof ResizeObserver === 'function'
        ? new ResizeObserver(() => instance.resize())
        : undefined
    observer?.observe(el)

    onCleanup(() => {
      observer?.disconnect()
      instance.dispose()
      setChart(undefined)
    })
  })

  createEffect(() => {
    const instance = chart()
    if (!instance) return
    instance.setOption(opts.option(), { notMerge: true })
  })

  return { chart }
}
