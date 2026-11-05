import { type JSX, Show } from 'solid-js'
import {
  type DeltaTone,
  deltaDirection,
  deltaTone,
  formatCardDelta,
  formatCardValue,
} from './numberCardFormat'
import { Sparkline } from './Sparkline'
import { CARD_SURFACE, useChartTokens } from './tokens'
import type { NumberCardProps } from './types'

// A page full of these should cost nothing but HTML: no echarts, sparkline
// included. The trend is the `Sparkline` component, so one implementation of
// the geometry serves the card and the standalone strip alike.

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
  // A named color is one explicit palette entry: the same override, handed to
  // the `Sparkline` in the vocabulary it takes.
  const sparklineTone = () =>
    props.sparkline?.color ? [props.sparkline.color] : undefined

  // A sparkline with nothing present is not a flat line; the card prints its
  // value instead and leaves the trend out.
  const showSparkline = () =>
    !isEmpty() &&
    (props.sparkline?.data ?? []).some(
      (value) => value !== null && value !== undefined && !Number.isNaN(value),
    )
  const showDelta = () => !isEmpty() && Boolean(deltaText())
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
        ...CARD_SURFACE,
        color: 'var(--ink-gray-9)',
      }}
    >
      <div
        style={{
          display: 'flex',
          'flex-wrap': 'wrap',
          'align-items': 'flex-start',
          'justify-content': 'space-between',
          gap: 'var(--spacing-control-gap)',
        }}
      >
        <figcaption
          data-slot="number-card-title"
          style={{
            flex: '1 1 auto',
            'min-width': '0',
            'font-size': 'var(--text-interface)',
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
              'border-radius': 'var(--radius-pill)',
              'background-color': TONE_SURFACE[tone()],
              color: TONE_COLOR[tone()],
              'font-size': 'var(--text-caption)',
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
            'font-size': 'var(--text-interface)',
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
                'border-radius': 'var(--radius-pill)',
                'background-color': 'var(--surface-gray-2)',
                overflow: 'hidden',
                'margin-bottom': '8px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${value()}%`,
                  'border-radius': 'var(--radius-pill)',
                  'background-color': color(),
                }}
              />
            </div>
          )}
        </Show>

        <Show when={isEmpty()}>
          <div
            data-slot="number-card-empty"
            style={{
              'font-size': 'var(--text-caption)',
              color: 'var(--ink-gray-7)',
            }}
          >
            Nothing here yet
          </div>
        </Show>

        <Show when={!isEmpty() && props.deltaCaption}>
          <div
            data-slot="number-card-caption"
            style={{
              'font-size': 'var(--text-caption)',
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
            <Sparkline
              data={props.sparkline?.data ?? []}
              type={mark()}
              tone={sparklineTone()}
              width="100%"
              height="100%"
            />
          </div>
        </Show>
      </Show>
    </figure>
  )
}
