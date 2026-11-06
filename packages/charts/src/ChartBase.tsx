import type { ECharts, EChartsCoreOption } from 'echarts/core'
import {
  type Accessor,
  createEffect,
  For,
  type JSX,
  onCleanup,
  Show,
} from 'solid-js'
import { ChartContainer } from './ChartContainer'
import { joinChartGroup, leaveChartGroup, useChartGroupId } from './chartGroup'
import { SR_ONLY } from './tokens'
import type { ChartFallback } from './types'
import { useChart } from './useChart'

export interface ChartBaseProps {
  /** The echarts option to draw. A getter, so it re-applies reactively. */
  option: Accessor<EChartsCoreOption>
  /** Accessible name for the plot. */
  label: string
  /** Plot height. A number is px; a string is used verbatim. Defaults to 240px. */
  height?: number | string
  /** Root class fallthrough, merged last (P10). */
  class?: string
  /** Heads the chart. */
  title?: string
  /** A second line under the title. */
  subtitle?: string
  /** Draws the placeholder in place of the reading. */
  loading?: boolean
  /** Switches the chart into its error state. */
  error?: string | null
  /** A visually-hidden table carrying the data to a screen reader. */
  fallback?: ChartFallback
  /** Content layered over the plot, e.g. a donut's center readout. */
  overlay?: JSX.Element
  /** Called once the echarts instance exists. */
  onInit?: (chart: ECharts) => void
  /** Heads the header row, e.g. the brush-range entry when the plot brushes. */
  actions?: JSX.Element
  /**
   * Links this plot's highlight to every chart in the same group. Prefer the
   * namespaced id from `useChartGroup`; a chart inside its `Provider` needs
   * none.
   */
  group?: string
  /** Lets the plot take keyboard focus — set when an interaction needs it. */
  plotFocusable?: boolean
  /** Keyboard handler for the focused plot, e.g. zoom steps. */
  onPlotKeyDown?: (event: KeyboardEvent) => void
}

/** The default plot height, when a chart names none. */
const DEFAULT_HEIGHT = 240

/** The standard `sr-only` recipe, inline so the package needs no stylesheet. */
/**
 * The echarts-backed shell every chart renders into: the plot element, the
 * loading/error states and the accessible fallback, wrapped in the shared
 * `ChartContainer` that draws the title row and the state chrome.
 *
 * An echarts plot is a single SVG element with no per-datapoint nodes, so it is
 * not readable on its own. The plot carries `role="img"` and a name, and the
 * `fallback` table carries the same data as text for a reader that wants it.
 */
export function ChartBase(props: ChartBaseProps): JSX.Element {
  let plot: HTMLDivElement | undefined

  // The group can arrive from the `group` prop or from the enclosing
  // `useChartGroup` provider; the prop wins, the context is the default.
  const contextGroup = useChartGroupId()
  const groupId = () => props.group ?? contextGroup()
  let joinedId: string | undefined

  const { chart } = useChart({
    element: () => plot,
    option: () => props.option(),
    onInit: (instance) => props.onInit?.(instance),
  })

  // Join when the instance and the group both exist, re-tag when either
  // moves, and leave on unmount — disposal ends the linkage for this
  // instance, so nothing here needs a global `disconnect`.
  createEffect(() => {
    const instance = chart()
    const id = groupId()
    if (!instance) return
    if (joinedId === id) return
    if (joinedId) leaveChartGroup(joinedId, instance)
    if (id) joinChartGroup(id, instance)
    joinedId = id
  })
  onCleanup(() => {
    const instance = chart()
    if (joinedId && instance) leaveChartGroup(joinedId, instance)
    joinedId = undefined
  })

  return (
    <ChartContainer
      class={props.class}
      height={props.height ?? DEFAULT_HEIGHT}
      title={props.title}
      subtitle={props.subtitle}
      actions={props.actions}
      loading={props.loading}
      error={props.error}
      empty={
        props.fallback !== undefined &&
        (props.fallback.totalRows ?? props.fallback.rows.length) === 0
      }
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div
          ref={(el) => {
            plot = el
          }}
          data-slot="chart-canvas"
          role="img"
          aria-label={props.label}
          tabindex={props.plotFocusable ? 0 : undefined}
          style={{ width: '100%', height: '100%' }}
          onKeyDown={(event) => props.onPlotKeyDown?.(event)}
        />
        {props.overlay}
      </div>

      <Show when={!props.loading && !props.error && props.fallback}>
        {(fallback) => <FallbackTable {...fallback()} />}
      </Show>
    </ChartContainer>
  )
}

function FallbackTable(props: ChartFallback): JSX.Element {
  return (
    <table data-slot="chart-fallback" style={SR_ONLY}>
      <Show when={props.caption}>
        {(caption) => <caption>{caption()}</caption>}
      </Show>
      <thead>
        <tr>
          <For each={props.columns}>
            {(column) => <th scope="col">{column}</th>}
          </For>
        </tr>
      </thead>
      <tbody>
        <For each={props.rows}>
          {(row) => (
            <tr>
              <For each={row}>{(cell) => <td>{cell}</td>}</For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  )
}
