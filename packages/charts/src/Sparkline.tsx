import { createMemo, For, type JSX, Show } from 'solid-js'
import { paletteColors } from './options'
import {
  sparklineAreaPath,
  sparklineBars,
  sparklineLinePath,
  sparklinePoints,
} from './sparkline'
import { SR_ONLY, useChartTokens } from './tokens'
import type { SparklineProps } from './types'

// The same 100×100 box the card stretches to its own width: the line as an SVG
// viewBox with `preserveAspectRatio="none"`, the bars as percentages of the
// band. `sparkline.ts` computes the geometry once; this component only draws
// it. No echarts: a page full of these should cost nothing but markup.

/** `preserveAspectRatio="none"` makes the horizontal unit meaningless. */
const VIEW_WIDTH = 100
const VIEW_HEIGHT = 100
/** Room for the 1.5px stroke at the series' peak and trough. */
const VIEW_INSET = 3

/** A full-width strip, at the height a trend line reads at. */
const DEFAULT_HEIGHT = '2rem'

/**
 * A trend with no axes: the shape of a series, drawn as plain SVG. The plot is
 * `aria-hidden` — a sparkline is decoration beside a reading, not the reading —
 * and the values it stands for ride in a visually-hidden summary.
 */
export function Sparkline(props: SparklineProps): JSX.Element {
  const tokens = useChartTokens()

  const mark = () => props.type ?? 'area'
  const color = () => {
    const tone = props.tone
    if (tone === 'ink') return 'currentColor'
    const [first] = paletteColors(tone, tokens(), 1)
    return first || 'currentColor'
  }

  const points = createMemo(() =>
    mark() !== 'bar'
      ? sparklinePoints(props.data, {
          width: VIEW_WIDTH,
          height: VIEW_HEIGHT,
          inset: VIEW_INSET,
        })
      : [],
  )
  const bars = createMemo(() =>
    mark() === 'bar'
      ? sparklineBars(props.data, {
          width: VIEW_WIDTH,
          height: VIEW_HEIGHT,
          inset: VIEW_INSET,
        })
      : [],
  )
  const hasShape = () => points().length > 0 || bars().length > 0
  const lastPoint = () => points()[points().length - 1]

  // The numbers behind the shape, for a reader that is given the trend as text
  // rather than as geometry.
  const summary = () => {
    const readings = (props.data ?? []).filter(
      (value): value is number =>
        typeof value === 'number' && Number.isFinite(value),
    )
    if (!readings.length) return 'No values.'
    const min = Math.min(...readings)
    const max = Math.max(...readings)
    const last = readings[readings.length - 1]
    return `${readings.length} values from ${min} to ${max}, ending at ${last}.`
  }

  const size = (value: number | string | undefined, fallback: string) =>
    typeof value === 'number' ? `${value}px` : (value ?? fallback)

  return (
    <>
      <Show when={props.error}>
        <div
          data-slot="sparkline-error"
          role="status"
          class={props.class}
          style={{
            'font-size': 'var(--text-caption)',
            color: 'var(--ink-red-7)',
          }}
        >
          {props.error}
        </div>
      </Show>
      <Show when={!props.error && props.loading}>
        <div
          data-slot="sparkline-loading"
          role="status"
          aria-label="Loading"
          class={props.class}
          style={{
            height: size(props.height, DEFAULT_HEIGHT),
            'border-radius': 'var(--radius-card)',
            background: 'var(--surface-gray-2)',
          }}
        />
      </Show>
      <Show when={!props.error && !props.loading}>
        <span
          data-slot="sparkline"
          class={props.class}
          style={{
            display: 'block',
            position: 'relative',
            width: size(props.width, '100%'),
            height: size(props.height, DEFAULT_HEIGHT),
          }}
        >
          <Show when={hasShape()}>
            <Show when={mark() === 'bar'}>
              <For each={bars()}>
                {(bar) => (
                  <div
                    data-slot="sparkline-bar"
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      left: `${bar.x}%`,
                      width: `${bar.width}%`,
                      height: `${bar.height}%`,
                      'background-color': color(),
                    }}
                  />
                )}
              </For>
            </Show>
            <Show when={mark() !== 'bar'}>
              <svg
                data-slot="sparkline-graph"
                viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
                preserveAspectRatio="none"
                aria-hidden="true"
                style={{ width: '100%', height: '100%' }}
              >
                <Show when={mark() === 'area'}>
                  <path
                    d={sparklineAreaPath(points(), VIEW_HEIGHT)}
                    fill={color()}
                    opacity={0.16}
                  />
                </Show>
                <path
                  d={sparklineLinePath(points())}
                  fill="none"
                  stroke={color()}
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  vector-effect="non-scaling-stroke"
                />
              </svg>
              {/* An HTML dot, not an SVG circle: `preserveAspectRatio="none"`
                would stretch a circle into an ellipse. */}
              <Show when={lastPoint()}>
                {(point) => (
                  <span
                    data-slot="sparkline-end"
                    style={{
                      position: 'absolute',
                      left: `calc(${point().x}% - 3px)`,
                      top: `calc(${point().y}% - 3px)`,
                      width: '6px',
                      height: '6px',
                      'border-radius': 'var(--radius-pill)',
                      'background-color': color(),
                      border: '1px solid var(--surface-elevation-1)',
                      'box-sizing': 'border-box',
                    }}
                  />
                )}
              </Show>
            </Show>
          </Show>
          <Show when={!hasShape()}>
            <span
              data-slot="sparkline-empty"
              style={{
                position: 'absolute',
                inset: '0',
                display: 'flex',
                'align-items': 'center',
                color: 'var(--ink-gray-7)',
                'font-size': 'var(--text-caption)',
              }}
            >
              —
            </span>
          </Show>
          <span style={SR_ONLY}>{summary()}</span>
        </span>
      </Show>
    </>
  )
}
