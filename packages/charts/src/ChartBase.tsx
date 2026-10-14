import type { ECharts, EChartsCoreOption } from 'echarts/core'
import { type Accessor, For, type JSX, Show } from 'solid-js'
import { ChartContainer } from './ChartContainer'
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
}

/** The default plot height, when a chart names none. */
const DEFAULT_HEIGHT = 240

/** The standard `sr-only` recipe, inline so the package needs no stylesheet. */
const SR_ONLY: JSX.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  'white-space': 'nowrap',
  'border-width': '0',
}

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

  useChart({
    element: () => plot,
    option: () => props.option(),
    onInit: (chart) => props.onInit?.(chart),
  })

  return (
    <ChartContainer
      class={props.class}
      height={props.height ?? DEFAULT_HEIGHT}
      title={props.title}
      subtitle={props.subtitle}
      loading={props.loading}
      error={props.error}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div
          ref={(el) => {
            plot = el
          }}
          data-slot="chart-canvas"
          role="img"
          aria-label={props.label}
          style={{ width: '100%', height: '100%' }}
        />
        {props.overlay}
      </div>

      <Show when={props.fallback}>
        {(fallback) => <FallbackTable {...fallback()} />}
      </Show>
    </ChartContainer>
  )
}

function FallbackTable(props: ChartFallback): JSX.Element {
  return (
    <table data-slot="chart-fallback" style={SR_ONLY}>
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
