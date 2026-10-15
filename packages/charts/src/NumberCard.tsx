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
  positive: 'var(--ink-green-7)',
  negative: 'var(--ink-red-7)',
  neutral: 'var(--ink-gray-6)',
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
  const showDelta = () =>
    !isEmpty() && Boolean(deltaText() || props.deltaCaption)

  return (
    <figure
      data-slot="number-card"
      class={props.class}
      aria-label={props['aria-label'] ?? props.title}
      style={{
        margin: '0',
        padding: '12px',
        border: '1px solid var(--outline-gray-1)',
        'border-radius': '10px',
        background: 'var(--surface-elevation-1)',
        color: 'var(--ink-gray-9)',
      }}
    >
      <figcaption
        data-slot="number-card-title"
        style={{
          'font-size': '0.875rem',
          'line-height': '1.25rem',
          color: 'var(--ink-gray-6)',
        }}
      >
        {props.title}
      </figcaption>

      <Show when={props.error}>
        <div data-slot="number-card-error" role="status">
          {props.error}
        </div>
      </Show>
      <Show when={!props.error && props.loading}>
        <div data-slot="number-card-loading" role="status">
          Loading…
        </div>
      </Show>

      <Show when={!props.error && !props.loading}>
        <div
          data-slot="number-card-value"
          style={{
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
            <span data-slot="number-card-target"> / {targetText()}</span>
          </Show>
        </div>

        <Show when={isEmpty()}>
          <div data-slot="number-card-empty">No data</div>
        </Show>

        <Show when={showDelta()}>
          <div
            data-slot="number-card-delta"
            style={{
              color: TONE_COLOR[tone()],
              display: 'flex',
              gap: '4px',
              'font-size': '0.75rem',
              'line-height': '1rem',
            }}
          >
            <Show when={direction() !== 'flat'}>
              <span aria-hidden="true">{direction() === 'up' ? '▲' : '▼'}</span>
            </Show>
            <Show when={deltaText()}>
              <span data-slot="number-card-delta-value">{deltaText()}</span>
            </Show>
            <Show when={props.deltaCaption}>
              <span data-slot="number-card-caption">{props.deltaCaption}</span>
            </Show>
          </div>
        </Show>

        <Show when={showSparkline()}>
          <div
            data-slot="number-card-sparkline"
            aria-hidden="true"
            style={{ position: 'relative', width: '100%', height: '3rem' }}
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
            </Show>
          </div>
        </Show>
      </Show>
    </figure>
  )
}
