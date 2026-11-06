import type { ECharts } from 'echarts/core'
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  type JSX,
  onCleanup,
  untrack,
} from 'solid-js'
import {
  type AxisValues,
  brushCoords,
  brushFromEvent,
  buildBrushOption,
  buildZoomOption,
  valueIndex,
  windowCaption,
  windowCoords,
  windowedRows,
  zoomFromEvent,
  zoomStep,
} from './interactions'
import { axisFallback } from './normalize'
import { plotRows, resolveXAxis } from './options'
import type {
  AxisChartConfig,
  AxisChartProps,
  ChartBrushSelection,
  ChartFallback,
  ChartZoomWindow,
} from './types'

/**
 * The interaction layer LineChart, AreaChart and BarChart share: a zoom
 * window and a brush selection that live in signals, round-trip through the
 * option builder, and surface as data values on every callback.
 *
 * The rule it encodes: the option builder re-emits the current window and
 * areas on every build, so a `setOption(…, { notMerge: true })` rebuild —
 * any data change — restores the user's state instead of erasing it. Signal
 * writes from gestures deliberately do *not* rebuild the option (that would
 * interrupt the gesture); programmatic changes go through `dispatchAction`.
 */

type KeyAction = 'in' | 'out' | 'left' | 'right'

const KEY_ACTIONS: Record<string, KeyAction> = {
  '+': 'in',
  '=': 'in',
  '-': 'out',
  _: 'out',
  ArrowLeft: 'left',
  ArrowRight: 'right',
}

function sameWindow(
  a: ChartZoomWindow | undefined,
  b: ChartZoomWindow | undefined,
): boolean {
  if (!a || !b) return a === b
  return String(a.from) === String(b.from) && String(a.to) === String(b.to)
}

function sameSelection(
  a: ChartBrushSelection | null,
  b: ChartBrushSelection | null,
): boolean {
  if (!a || !b) return a === b
  return sameWindow(a, b)
}

/** The handle `createAxisInteractions` returns to the chart component. */
export type AxisInteractions = {
  /** Whether any interaction is wired, so the wrapper can add its chrome. */
  active: Accessor<boolean>
  /** Whether the plot should take keyboard focus. */
  zoomable: Accessor<boolean>
  /** The dataZoom/brush option fragments the current signals imply. */
  extras(): Record<string, unknown>
  /** Bind instance events. Called once, from `onInit`. */
  bind: (chart: ECharts) => void
  /** Keyboard zoom while the plot is focused. */
  onPlotKeyDown: (event: KeyboardEvent) => void
  /** The toolbar twin: two number inputs that enter the brush range. */
  toolbar: () => JSX.Element | undefined
  /** The fallback table narrowed to the current window, captioned. */
  fallbackFor: (base: ChartFallback) => ChartFallback
  /** The current window, for tests and for the app's own readout. */
  window: Accessor<ChartZoomWindow | undefined>
  /** The current brush selection, for tests and for the app's own readout. */
  selection: Accessor<ChartBrushSelection | null>
}

/**
 * A window that round-trips like the kit's other controls: controlled while
 * `zoom` is supplied, internal otherwise, with `onZoomChange` fired on every
 * user-initiated move.
 */
function createWindowSignal(
  props: AxisChartProps,
): [Accessor<ChartZoomWindow | undefined>, (next: ChartZoomWindow) => void] {
  const [internal, setInternal] = createSignal<ChartZoomWindow | undefined>()
  const value = () =>
    props.zoom !== undefined ? props.zoom : (internal() ?? props.defaultZoom)
  const set = (next: ChartZoomWindow) => {
    if (props.zoom === undefined) setInternal(() => next)
    props.onZoomChange?.(next)
  }
  return [value, set]
}

/**
 * Wire zoom, brush and double-click onto one axis chart. `config` is the
 * normalized chart config — the same memo the option builder reads.
 */
export function createAxisInteractions(
  config: Accessor<AxisChartConfig>,
  props: AxisChartProps,
): AxisInteractions {
  // The x column in draw order, with the axis it sits on: everything the
  // translations need, derived once from the same config the option reads.
  const plotted = createMemo(() => {
    const c = config()
    const { type } = resolveXAxis(c, Boolean(c.horizontal))
    const rows = plotRows(c, type)
    return {
      rows,
      axis: { values: rows.map((row) => row[c.xAxis.key]), type } as AxisValues,
    }
  })

  // Zoom and brush run along the x axis; a horizontal bar's categories live
  // on Y, where the slider and the lineX brush would be wrong. They are
  // ignored there rather than silently driving the value axis.
  const cartesian = () => !config().horizontal
  const zoomable = () =>
    cartesian() && (props.zoom !== undefined || props.defaultZoom !== undefined)
  const brushable = () => cartesian() && props.brush === true

  const [window, setWindow] = createWindowSignal(props)
  const [selection, setSelection] = createSignal<ChartBrushSelection | null>(
    null,
  )

  let instance: ECharts | undefined

  const dispatchWindow = (next: ChartZoomWindow) => {
    const coords = windowCoords(next, plotted().axis)
    instance?.dispatchAction({ type: 'dataZoom', ...coords })
  }

  const dispatchBrush = (next: ChartBrushSelection) => {
    instance?.dispatchAction({
      type: 'brush',
      areas: [brushCoords(next, plotted().axis)],
    })
  }

  // A controlled `zoom` is the source of truth: when the app moves it, the
  // instance follows through `dispatchAction`, not a rebuild.
  createEffect(() => {
    const controlled = props.zoom
    if (controlled === undefined || !instance) return
    if (sameWindow(untrack(window), controlled)) return
    dispatchWindow(controlled)
  })

  const onZoomEvent = (payload: unknown) => {
    const next = zoomFromEvent(payload, plotted().axis)
    if (!next || sameWindow(window(), next)) return
    setWindow(next)
  }

  const onBrushEvent = (payload: unknown) => {
    const next = brushFromEvent(payload, plotted().axis)
    if (sameSelection(selection(), next)) return
    setSelection(() => next)
    props.onBrushChange?.(next)
  }

  const onDoubleClick = (event: unknown) => {
    const params = event as { componentType?: string; dataIndex?: number }
    if (
      params.componentType !== 'series' ||
      typeof params.dataIndex !== 'number'
    )
      return
    const row = plotted().rows[params.dataIndex]
    if (!row) return
    props.onPointDblClick?.({
      x: row[config().xAxis.key] as number | string,
      row,
    })
  }

  const bind = (chart: ECharts) => {
    instance = chart
    if (zoomable()) chart.on('datazoom', onZoomEvent)
    if (brushable()) {
      chart.on('brushSelected', onBrushEvent)
      // The pointer twin of the toolbar: drag inside the plot to brush.
      chart.dispatchAction({
        type: 'takeGlobalCursor',
        key: 'brush',
        brushOption: { brushType: 'lineX', brushMode: 'single' },
      })
    }
    if (props.onPointDblClick) chart.on('dblclick', onDoubleClick)
    onCleanup(() => {
      instance = undefined
    })
  }

  const onPlotKeyDown = (event: KeyboardEvent) => {
    if (!zoomable()) return
    const action = KEY_ACTIONS[event.key]
    if (!action) return
    event.preventDefault()
    const next = zoomStep(window(), plotted().axis, action)
    if (sameWindow(window(), next)) return
    setWindow(next)
    dispatchWindow(next)
  }

  /** One edge of the brush, typed. The other edge stays where it is. */
  const commitBrushEdge = (edge: 'from' | 'to', index: number) => {
    const { values } = plotted().axis
    if (!values.length) return
    const clamped = Math.max(0, Math.min(values.length - 1, index))
    const current = selection()
    const other =
      edge === 'from'
        ? current
          ? valueIndex(values, current.to, plotted().axis.type)
          : values.length - 1
        : current
          ? valueIndex(values, current.from, plotted().axis.type)
          : 0
    const next: ChartBrushSelection = {
      from: values[Math.min(clamped, other)] as number | string,
      to: values[Math.max(clamped, other)] as number | string,
    }
    setSelection(() => next)
    props.onBrushChange?.(next)
    dispatchBrush(next)
  }

  const toolbar = () => {
    if (!brushable()) return undefined
    const indexFor = (edge: 'from' | 'to'): number | undefined => {
      const current = selection()
      if (!current) return undefined
      return valueIndex(
        plotted().axis.values,
        current[edge],
        plotted().axis.type,
      )
    }
    const input = (edge: 'from' | 'to'): JSX.Element => (
      <input
        type="number"
        data-slot="chart-brush-input"
        data-edge={edge}
        aria-label={`Brush ${edge} (index)`}
        min={0}
        step={1}
        value={indexFor(edge) ?? ''}
        style={{
          width: '4.5rem',
          padding: '0.125rem 0.375rem',
          'font-size': 'var(--text-caption)',
          color: 'var(--ink-gray-9)',
          background: 'var(--surface-1)',
          border: '1px solid var(--outline-gray-2)',
          'border-radius': 'var(--radius-control)',
        }}
        onInput={(event) => {
          const index = Number.parseInt(event.currentTarget.value, 10)
          if (Number.isNaN(index)) return
          commitBrushEdge(edge, index)
        }}
      />
    )
    return (
      <div
        data-slot="chart-brush-entry"
        style={{ display: 'flex', 'align-items': 'center', gap: '0.375rem' }}
      >
        {input('from')}
        <span style={{ color: 'var(--ink-gray-7)' }}>–</span>
        {input('to')}
      </div>
    )
  }

  const extras = () => {
    const option: Record<string, unknown> = {}
    // The window and the selection are gesture state: read untracked, so an
    // echo of `onZoomChange` never rebuilds the option mid-drag. Every build
    // re-emits whatever the signals hold, so a rebuild restores the state.
    if (zoomable())
      Object.assign(option, buildZoomOption(plotted().axis, untrack(window)))
    if (brushable())
      Object.assign(
        option,
        buildBrushOption(plotted().axis, untrack(selection)),
      )
    return option
  }

  const fallbackFor = (base: ChartFallback): ChartFallback => {
    if (!zoomable()) return base
    const current = window()
    if (!current) return base
    const { rows, axis } = plotted()
    const kept = windowedRows(rows, config().xAxis.key, current, axis)
    const table = axisFallback({ ...config(), data: kept })
    return {
      ...table,
      totalRows: rows.length,
      caption: windowCaption(current, rows.length),
    }
  }

  return {
    active: () =>
      zoomable() || brushable() || props.onPointDblClick !== undefined,
    zoomable,
    extras,
    bind,
    onPlotKeyDown,
    toolbar,
    fallbackFor,
    window,
    selection,
  }
}
