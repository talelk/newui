import { createMemo, For, type JSX, Show } from 'solid-js'
import {
  type DeltaTone,
  deltaDirection,
  deltaTone,
  formatCardDelta,
  formatCardValue,
} from './numberCardFormat'
import {
  sparklineAreaPath,
  sparklineBars,
  sparklineLinePath,
  sparklinePoints,
} from './sparkline'
import { useChartTokens } from './tokens'
import type { NumberCardProps } from './types'

// A page full of these should cost nothing but HTML: no echarts, sparkline
// included. The sparkline is drawn as an inline SVG (or boxes), so a card with
// no trend is plain text.

/** `preserveAspectRatio="none"` makes the horizontal unit meaningless, so the geometry is computed once. */
const VIEW_WIDTH = 100
const VIEW_HEIGHT = 100
/** Room for the 1.5px stroke at the series' peak and trough. */
const VIEW_INSET = 3

/**
 * The delta tones, as runtime custom properties rather than Tailwind classes:
 * the package ships no stylesheet, and a `var()` reference flips with the theme
 * exactly as a utility would.
 */
const TONE_COLOR: Record<DeltaTone, string> = {
  positive: 'var(--ink-green-8)',
  negative: 'var(--ink-red-8)',
  neutral: 'var(--ink-gray-7)',
}

const TONE_SURFACE: Record<DeltaTone, string> = {
  positive: 'var(--surface-green-2)',
  negative: 'var(--surface-red-2)',
  neutral: 'var(--surface-gray-2)',
}

export function NumberCard(props: NumberCardProps): JSX.Element {
  const tokens = useChartTokens()

  const isEmpty = () => props.value === null || props.value === undefined
  // Never empty: this line sets the height of the card's top block.
  const valueText = () => formatCardValue(props, props.value) || '—'
  const targetText = () =>
    isEmpty() ? '' : formatCardValue(props, props.target)
  const deltaText = () => formatCardDelta(props, props.delta)
  const direction = () => deltaDirection(props.delta)
  const tone = () => deltaTone(props.delta, props.negativeIsBetter)

  const mark = () => props.sparkline?.type ?? 'area'
  const color = () =>
    props.sparkline?.color ?? tokens().series[0] ?? 'currentColor'

  const points = createMemo(() =>
    mark() !== 'bar'
      ? sparklinePoints(props.sparkline?.data, {
          width: VIEW_WIDTH,
          height: VIEW_HEIGHT,
          inset: VIEW_INSET,
        })
      : [],
  )
  const bars = createMemo(() =>
    mark() === 'bar'
      ? sparklineBars(props.sparkline?.data, {
          width: VIEW_WIDTH,
          height: VIEW_HEIGHT,
          inset: VIEW_INSET,
        })
      : [],
  )
  const showSparkline = () =>
    !isEmpty() && (points().length > 0 || bars().length > 0)
  const showDelta = () => !isEmpty() && Boolean(deltaText())
  const lastPoint = () => points()[points().length - 1]
  // A progress bar only means something for two numbers and a positive goal.
  const progress = (): number | undefined => {
    if (typeof props.value !== 'number') return undefined
    if (typeof props.target !== 'number' || props.target <= 0) return undefined
    return Math.min(100, Math.max(0, (props.value / props.target) * 100))
  }

  return (
    <figure
      data-slot="number-card"
      class={props.class}
      aria-label={props['aria-label'] ?? props.title}
      style={{
        display: 'flex',
        'flex-direction': 'column',
        margin: '0',
        padding: 'var(--spacing-card-pad)',
        border: '1px solid var(--outline-gray-1)',
        'border-radius': 'var(--radius-card)',
        background: 'var(--surface-elevation-1)',
        color: 'var(--ink-gray-9)',
      }}
    >
      <div
        style={{
          display: 'flex',
          'flex-wrap': 'wrap',
          'align-items': 'flex-start',
          'justify-content': 'space-between',
          gap: '0.5rem',
        }}
      >
        <figcaption
          data-slot="number-card-title"
          style={{
            flex: '1 1 auto',
            'min-width': '0',
            'font-size': '0.875rem',
            'line-height': '1.25rem',
            'font-weight': '500',
            color: 'var(--ink-gray-7)',
            'overflow-wrap': 'break-word',
          }}
        >
          {props.title}
        </figcaption>
        <Show when={!props.error && !props.loading && showDelta()}>
          <span
            data-slot="number-card-delta"
            style={{
              display: 'inline-flex',
              'align-items': 'center',
              gap: '4px',
              'flex-shrink': '0',
              padding: '2px 6px',
              'border-radius': '9999px',
              'background-color': TONE_SURFACE[tone()],
              color: TONE_COLOR[tone()],
              'font-size': '0.75rem',
              'line-height': '1rem',
              'font-weight': '500',
              'font-variant-numeric': 'tabular-nums',
            }}
          >
            <Show when={direction() !== 'flat'}>
              <span aria-hidden="true">{direction() === 'up' ? '▲' : '▼'}</span>
            </Show>
            <span data-slot="number-card-delta-value">{deltaText()}</span>
          </span>
        </Show>
      </div>

      <Show when={props.error}>
        <div
          data-slot="number-card-error"
          role="status"
          style={{
            'margin-top': '8px',
            'font-size': '0.875rem',
            color: 'var(--ink-red-8)',
          }}
        >
          {props.error}
        </div>
      </Show>
      <Show when={!props.error && props.loading}>
        <div
          data-slot="number-card-loading"
          role="status"
          aria-label="Loading"
          style={{ 'margin-top': '8px' }}
        >
          <div
            aria-hidden="true"
            style={{
              height: 'var(--text-metric, 1.75rem)',
              'margin-bottom': progress() === undefined ? '0' : '8px',
              'border-radius': 'var(--radius-card)',
              background: 'var(--surface-gray-2)',
            }}
          />
          <Show when={progress() !== undefined}>
            <div
              aria-hidden="true"
              style={{
                height: '6px',
                'margin-bottom': '8px',
                'border-radius': 'var(--radius-pill)',
                background: 'var(--surface-gray-2)',
              }}
            />
          </Show>
          <div
            aria-hidden="true"
            style={{
              width: '60%',
              height: '1rem',
              'margin-top': '8px',
              'border-radius': 'var(--radius-pill)',
              background: 'var(--surface-gray-2)',
            }}
          />
          <Show when={props.sparkline}>
            <div
              aria-hidden="true"
              style={{
                height: '3rem',
                'margin-top': '8px',
                'border-radius': 'var(--radius-card)',
                background: 'var(--surface-gray-2)',
              }}
            />
          </Show>
        </div>
      </Show>

      <Show when={!props.error && !props.loading}>
        <div
          data-slot="number-card-value"
          style={{
            display: 'flex',
            'flex-wrap': 'wrap',
            'align-items': 'baseline',
            'column-gap': '4px',
            'font-size': 'var(--text-metric, 1.75rem)',
            'line-height': 'var(--text-metric--line-height, 2rem)',
            'font-weight': '600',
            'letter-spacing': '-0.025em',
            'font-variant-numeric': 'tabular-nums',
            'overflow-wrap': 'anywhere',
            margin: '8px 0',
            color: props.color && !isEmpty() ? props.color : undefined,
          }}
        >
          <span>{valueText()}</span>
          <Show when={targetText()}>
            <span
              data-slot="number-card-target"
              style={{
                'font-size': '1rem',
                'font-weight': '400',
                'white-space': 'nowrap',
                color: 'var(--ink-gray-7)',
              }}
            >
              / {targetText()}
            </span>
          </Show>
        </div>

        <Show when={progress()}>
          {(value) => (
            <div
              data-slot="number-card-progress"
              role="progressbar"
              aria-label={`${props.title} progress toward target`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(value())}
              style={{
                height: '6px',
                'border-radius': '9999px',
                'background-color': 'var(--surface-gray-2)',
                overflow: 'hidden',
                'margin-bottom': '8px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${value()}%`,
                  'border-radius': '9999px',
                  'background-color': color(),
                }}
              />
            </div>
          )}
        </Show>

        <Show when={isEmpty()}>
          <div
            data-slot="number-card-empty"
            style={{ 'font-size': '0.75rem', color: 'var(--ink-gray-7)' }}
          >
            No data
          </div>
        </Show>

        <Show when={!isEmpty() && props.deltaCaption}>
          <div
            data-slot="number-card-caption"
            style={{
              'font-size': '0.75rem',
              'line-height': '1rem',
              color: 'var(--ink-gray-7)',
            }}
          >
            {props.deltaCaption}
          </div>
        </Show>

        <Show when={showSparkline()}>
          <div
            data-slot="number-card-sparkline"
            aria-hidden="true"
            style={{
              position: 'relative',
              width: '100%',
              height: '3rem',
              'margin-top': 'auto',
              'padding-top': '8px',
              'box-sizing': 'content-box',
            }}
          >
            <Show when={mark() === 'bar'}>
              <For each={bars()}>
                {(bar) => (
                  <div
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
                    data-slot="number-card-sparkline-end"
                    style={{
                      position: 'absolute',
                      left: `calc(${point().x}% - 3px)`,
                      top: `calc(${point().y}% - 3px)`,
                      width: '6px',
                      height: '6px',
                      'border-radius': '9999px',
                      'background-color': color(),
                      border: '1px solid var(--surface-elevation-1)',
                      'box-sizing': 'border-box',
                    }}
                  />
                )}
              </Show>
            </Show>
          </div>
        </Show>
      </Show>
    </figure>
  )
}
