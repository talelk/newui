import { TooltipComponent } from 'echarts/components'
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

// The lifecycle needs the SVG renderer, tooltip and label layout. Each wrapper
// registers its own mark and coordinate system, so a revenue chart never loads
// Sankey, heatmap, scatter or funnel engines. Raw useChart callers register any
// custom ECharts modules before mounting, just as with ECharts core itself.
echarts.use([TooltipComponent, LabelLayout, SVGRenderer])

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
  const [reducedMotion, setReducedMotion] = createSignal(false)
  const option = () =>
    reducedMotion() ? { ...opts.option(), animation: false } : opts.option()

  onMount(() => {
    const el = opts.element()
    if (!el) return

    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const syncMotion = () => setReducedMotion(motion?.matches ?? false)
    syncMotion()
    motion?.addEventListener('change', syncMotion)

    const instance = echarts.init(el, undefined, { renderer: 'svg' })
    setChart(instance)
    instance.setOption(untrack(option))
    opts.onInit?.(instance)

    const observer =
      typeof ResizeObserver === 'function'
        ? new ResizeObserver(() => instance.resize())
        : undefined
    observer?.observe(el)

    onCleanup(() => {
      motion?.removeEventListener('change', syncMotion)
      observer?.disconnect()
      instance.dispose()
      setChart(undefined)
    })
  })

  createEffect(() => {
    const instance = chart()
    if (!instance) return
    instance.setOption(option(), { notMerge: true })
  })

  return { chart }
}
