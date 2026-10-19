import { For, type JSX, Show } from 'solid-js'
import type { ChartContainerProps } from './types'

/**
 * The shell every plot draws inside: the header, the value-axis titles, the
 * loading / error / empty states, the plot box and the legend row.
 *
 * It is structure, not chrome — the plot is supplied as `children`, and the
 * container sizes and states the box it goes in. The echarts-backed charts
 * render through it (`ChartBase`), and an app drawing its own plot uses it
 * directly, so the two share one shell rather than two that drift apart.
 *
 * The container reads runtime custom properties, so it follows the light/dark
 * axis without a second recipe; the package ships no stylesheet.
 */

/** The standard `sr-only` recipe, inline so the package needs no stylesheet. */
const SR_ONLY: JSX.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  'white-space': 'normal',
  'overflow-wrap': 'anywhere',
  'border-width': '0',
}

function cssHeight(height: number | string | undefined): string {
  if (height === undefined) return '100%'
  return typeof height === 'number' ? `${height}px` : height
}

/** The box a state overlay is pinned to, so the plot keeps its size under it. */
const OVERLAY: JSX.CSSProperties = {
  position: 'absolute',
  inset: '0',
}

export function ChartContainer(props: ChartContainerProps): JSX.Element {
  // A failed query is the thing to say, even while the next one is in flight
  // and even though a failed query returns no rows.
  const state = () =>
    props.error
      ? 'error'
      : props.loading
        ? 'loading'
        : props.empty
          ? 'empty'
          : 'ready'

  // The label heads an axis, so it goes wherever that axis does: over a
  // placeholder, a message or an empty card it is a title for a plot that is
  // not drawn.
  const showAxisTitles = () =>
    state() === 'ready' && Boolean(props.yAxisTitle || props.y2AxisTitle)
  const topAxisTitles = () =>
    showAxisTitles() && props.axisTitlePlacement !== 'bottom'
  const bottomAxisTitles = () =>
    showAxisTitles() && props.axisTitlePlacement === 'bottom'
  const hasHeader = () =>
    Boolean(props.title || props.subtitle || props.actions)
  // The pad stands in for the space a legend would have taken, so a
  // single-series chart sits in the card the way a multi-series one does.
  const padForLegend = () => !props.legend && !bottomAxisTitles()

  return (
    <div
      data-slot="chart-container"
      data-state={state()}
      dir={props.dir}
      class={props.class}
      style={{
        display: 'flex',
        'flex-direction': 'column',
        gap: '0.5rem',
        width: '100%',
        'min-width': '0',
        height: cssHeight(props.height),
      }}
    >
      <Show when={hasHeader()}>
        <div
          data-slot="chart-header"
          style={{
            display: 'flex',
            'align-items': 'flex-start',
            'justify-content': 'space-between',
            gap: '0.75rem',
            'padding-bottom': '0.625rem',
            'margin-bottom': '0.25rem',
            'border-bottom': '1px solid var(--outline-gray-1)',
          }}
        >
          <div style={{ 'min-width': '0' }}>
            <Show when={props.title}>
              <div
                data-slot="chart-title"
                style={{
                  'font-size': '1rem',
                  'font-weight': '600',
                  'line-height': '1.375',
                  color: 'var(--ink-gray-9)',
                  overflow: 'hidden',
                  'text-overflow': 'ellipsis',
                  'white-space': 'normal',
                  'overflow-wrap': 'anywhere',
                }}
              >
                {props.title}
              </div>
            </Show>
            <Show when={props.subtitle}>
              <div
                data-slot="chart-subtitle"
                style={{
                  'font-size': '0.75rem',
                  'line-height': '1rem',
                  'margin-top': '0.125rem',
                  color: 'var(--ink-gray-7)',
                  overflow: 'hidden',
                  'text-overflow': 'ellipsis',
                  'white-space': 'normal',
                  'overflow-wrap': 'anywhere',
                }}
              >
                {props.subtitle}
              </div>
            </Show>
          </div>
          <Show when={props.actions}>
            <div
              data-slot="chart-actions"
              style={{
                display: 'flex',
                'align-items': 'center',
                'flex-shrink': '0',
              }}
            >
              {props.actions}
            </div>
          </Show>
        </div>
      </Show>

      <Show when={topAxisTitles()}>
        <AxisTitles
          y={props.yAxisTitle}
          y2={props.y2AxisTitle}
          placement="top"
        />
      </Show>

      <div
        data-slot="chart-plot"
        style={{
          position: 'relative',
          'min-height': '0',
          flex: '1 1 0%',
          ...(padForLegend() ? { 'padding-bottom': '0.75rem' } : {}),
        }}
      >
        {/* The plot stays mounted through every state: unmounting it would
            dispose the echarts instance and re-init it on the way back. */}
        <div
          data-slot="chart-plot-content"
          style={{
            width: '100%',
            height: '100%',
            visibility: state() === 'ready' ? undefined : 'hidden',
          }}
        >
          {props.children}
        </div>

        <Show when={state() === 'loading'}>
          <div data-slot="chart-loading" style={OVERLAY}>
            {/* Announced by the container, so a caller's own placeholder does
                not have to carry the announcement with it. */}
            <span style={SR_ONLY} role="status">
              Loading chart
            </span>
            <Show
              when={props.loadingContent}
              fallback={
                /* Static skeleton bars: a pulse would need a stylesheet media
                   query to honour reduced motion, and this package ships none. */
                <div
                  aria-hidden="true"
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    'align-items': 'flex-end',
                    gap: '0.5rem',
                    padding: '1rem 0.25rem 0.25rem',
                    'box-sizing': 'border-box',
                  }}
                >
                  <For each={['45%', '70%', '55%', '85%', '62%', '78%', '50%']}>
                    {(height) => (
                      <div
                        style={{
                          flex: '1 1 0%',
                          height,
                          'border-radius': '0.375rem 0.375rem 0 0',
                          'background-color': 'var(--surface-gray-2)',
                        }}
                      />
                    )}
                  </For>
                </div>
              }
            >
              {props.loadingContent}
            </Show>
          </div>
        </Show>

        <Show when={state() === 'error'}>
          <div
            data-slot="chart-error"
            role="status"
            style={{
              ...OVERLAY,
              display: 'flex',
              'flex-direction': 'column',
              'align-items': 'center',
              'justify-content': 'center',
              gap: '0.5rem',
              'text-align': 'center',
            }}
          >
            <Show
              when={props.errorContent}
              fallback={
                <>
                  <span
                    style={{
                      'font-size': '0.875rem',
                      'font-weight': '500',
                      color: 'var(--ink-red-7)',
                    }}
                  >
                    Could not render this chart
                  </span>
                  <Show when={props.error}>
                    <span
                      style={{
                        'font-size': '0.75rem',
                        color: 'var(--ink-gray-7)',
                        'max-width': '24rem',
                      }}
                    >
                      {props.error}
                    </span>
                  </Show>
                </>
              }
            >
              {props.errorContent}
            </Show>
          </div>
        </Show>

        <Show when={state() === 'empty'}>
          <div
            data-slot="chart-empty"
            style={{
              ...OVERLAY,
              display: 'flex',
              'flex-direction': 'column',
              'align-items': 'center',
              'justify-content': 'center',
              gap: '0.5rem',
              'text-align': 'center',
            }}
          >
            <Show
              when={props.emptyContent}
              fallback={
                <>
                  {/* A placeholder reading keeps the card's rhythm: never a
                      blank plot under a live title. */}
                  <span
                    aria-hidden="true"
                    style={{
                      'font-size': '1.5rem',
                      'line-height': '2rem',
                      'font-weight': '600',
                      color: 'var(--ink-gray-7)',
                    }}
                  >
                    —
                  </span>
                  <span
                    style={{
                      'font-size': '0.75rem',
                      color: 'var(--ink-gray-7)',
                    }}
                  >
                    No data to show
                  </span>
                </>
              }
            >
              {props.emptyContent}
            </Show>
          </div>
        </Show>
      </div>

      <Show when={bottomAxisTitles()}>
        <AxisTitles
          y={props.yAxisTitle}
          y2={props.y2AxisTitle}
          placement="bottom"
        />
      </Show>

      <Show when={props.legend}>
        <div data-slot="chart-legend-row" style={{ 'margin-top': '0.5rem' }}>
          {props.legend}
        </div>
      </Show>
    </div>
  )
}

/**
 * The value-axis titles, over the edge their axis is drawn on, so the row
 * mirrors with the plot in RTL. Pinned to the far end at the bottom: the near
 * end of a row chart is the category-label column, where a title would read as
 * a heading for it.
 */
function AxisTitles(props: {
  y?: string
  y2?: string
  placement: 'top' | 'bottom'
}): JSX.Element {
  return (
    <div
      data-slot="chart-axis-titles"
      style={{
        display: 'flex',
        'align-items': 'baseline',
        'justify-content':
          props.placement === 'bottom' ? 'flex-end' : 'space-between',
        gap: '0.75rem',
        'font-size': '0.6875rem',
        color: 'var(--ink-gray-7)',
        ...(props.placement === 'bottom' ? { 'margin-top': '-0.5rem' } : {}),
      }}
    >
      <span
        style={{
          overflow: 'hidden',
          'text-overflow': 'ellipsis',
          'white-space': 'normal',
          'overflow-wrap': 'anywhere',
        }}
      >
        {props.y}
      </span>
      <Show when={props.y2}>
        <span
          style={{
            overflow: 'hidden',
            'text-overflow': 'ellipsis',
            'white-space': 'normal',
            'overflow-wrap': 'anywhere',
          }}
        >
          {props.y2}
        </span>
      </Show>
    </div>
  )
}
