import { createEffect, createSignal, For, type JSX, Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import { formatPercent } from './format'
import type {
  ChartTooltipItem,
  ChartTooltipProps,
  ChartTooltipSlotProps,
} from './types'

/**
 * The reading a plot shows over a point. It is told whether it is open and
 * where it hangs; it owns neither, so the chart that draws the marks owns both.
 *
 * It teleports to the body and is `position: fixed`, so a card that clips its
 * plot cannot clip the tooltip; it is measured before it is placed, so it flips
 * at the viewport edge rather than running off it. It takes no focus and no
 * pointer: a tooltip follows the pointer and offers no press of its own.
 *
 * The surface reads runtime custom properties, so it follows the light/dark
 * axis; the package ships no stylesheet.
 */

/** How far the tooltip sits off the point it hangs on, in px. */
const OFFSET = 12

/** Keeps the flipped tooltip inside the viewport, never off its near edge. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

const SURFACE: JSX.CSSProperties = {
  position: 'fixed',
  'z-index': '100',
  'pointer-events': 'none',
  'max-width': '20rem',
  'border-radius': '0.5rem',
  border: '1px solid var(--outline-gray-1)',
  'background-color': 'var(--surface-elevation-2)',
  padding: '0.625rem 0.75rem',
  'box-shadow': 'var(--shadow-lg)',
}

export function ChartTooltip(props: ChartTooltipProps): JSX.Element {
  let el: HTMLDivElement | undefined
  const [position, setPosition] = createSignal({ left: '0px', top: '0px' })
  const [placed, setPlaced] = createSignal(false)

  const slot = (): ChartTooltipSlotProps => ({
    label: props.label,
    items: props.items,
    rows: props.rows ?? [],
  })

  // Measured after render rather than estimated: the body may be a caller's, so
  // its size is not knowable up front. It stays hidden until placed, because
  // `position` still holds the previous point and a visible tooltip would paint
  // there first.
  createEffect(() => {
    const open = props.open
    const x = props.x
    const y = props.y
    // Track the readings, so a new set re-measures.
    props.items

    if (!open) return
    if (typeof window === 'undefined') return

    setPlaced(false)
    const node = el
    if (!node) return

    const { width, height } = node.getBoundingClientRect()
    const flipX = x + OFFSET + width > window.innerWidth
    const flipY = y + OFFSET + height > window.innerHeight
    const left = flipX ? x - OFFSET - width : x + OFFSET
    const top = flipY ? y - OFFSET - height : y + OFFSET

    setPosition({
      left: `${clamp(left, 4, window.innerWidth - width - 4)}px`,
      top: `${clamp(top, 4, window.innerHeight - height - 4)}px`,
    })
    setPlaced(true)
  })

  return (
    <Show when={props.open && props.items.length > 0}>
      <Portal>
        <div
          ref={(node) => {
            el = node
          }}
          data-slot="chart-tooltip"
          role="tooltip"
          dir={props.dir}
          class={props.class}
          style={{
            ...SURFACE,
            ...position(),
            visibility: placed() ? 'visible' : 'hidden',
          }}
        >
          <Show when={props.children} fallback={<TooltipBody {...slot()} />}>
            {(body) => body()(slot())}
          </Show>
        </div>
      </Portal>
    </Show>
  )
}

function TooltipBody(props: ChartTooltipSlotProps): JSX.Element {
  const series = () => props.items.filter((item) => item.kind === 'series')
  const context = () => props.items.filter((item) => item.kind === 'context')

  return (
    <>
      <Show when={props.label}>
        <div
          data-slot="chart-tooltip-label"
          style={{
            'margin-bottom': '0.5rem',
            'padding-bottom': '0.375rem',
            'border-bottom': '1px solid var(--outline-gray-1)',
            'font-size': '0.75rem',
            'font-weight': '600',
            color: 'var(--ink-gray-9)',
          }}
        >
          {props.label}
        </div>
      </Show>

      <div
        style={{
          display: 'flex',
          'flex-direction': 'column',
          gap: '0.375rem',
        }}
      >
        <For each={series()}>{(item) => <SeriesRow item={item} />}</For>
      </div>

      {/* Context rows carry no swatch: a swatch says the reader can find this on
          the plot, and a context reading is drawn nowhere. The rule is what
          tells them apart from the series above. */}
      <Show when={context().length}>
        <div
          data-slot="chart-tooltip-context"
          style={{
            'margin-top': '0.5rem',
            'border-top': '1px solid var(--outline-gray-1)',
            'padding-top': '0.5rem',
            display: 'flex',
            'flex-direction': 'column',
            gap: '0.375rem',
          }}
        >
          <For each={context()}>{(item) => <ContextRow item={item} />}</For>
        </div>
      </Show>
    </>
  )
}

const ROW: JSX.CSSProperties = {
  display: 'flex',
  'align-items': 'center',
  'justify-content': 'space-between',
  gap: '1.25rem',
  'font-size': '0.75rem',
}

const TRUNCATE: JSX.CSSProperties = {
  overflow: 'hidden',
  'text-overflow': 'ellipsis',
  'white-space': 'nowrap',
}

function SeriesRow(props: { item: ChartTooltipItem }): JSX.Element {
  return (
    <div data-slot="chart-tooltip-item" style={ROW}>
      <span
        style={{
          display: 'flex',
          'min-width': '0',
          'align-items': 'center',
          gap: '0.5rem',
        }}
      >
        <span
          data-slot="chart-tooltip-swatch"
          aria-hidden="true"
          style={{
            width: '14px',
            height: '3px',
            'flex-shrink': '0',
            'border-radius': '9999px',
            'background-color': props.item.color,
          }}
        />
        <span style={{ ...TRUNCATE, color: 'var(--ink-gray-7)' }}>
          {props.item.label}
        </span>
      </span>
      <span
        style={{
          'flex-shrink': '0',
          'font-weight': '600',
          'font-variant-numeric': 'tabular-nums',
          color: 'var(--ink-gray-9)',
        }}
      >
        {props.item.formattedValue}
        <Show when={props.item.percent !== undefined}>
          <span style={{ color: 'var(--ink-gray-7)', 'font-weight': '400' }}>
            {' '}
            {formatPercent(props.item.percent ?? 0)}
          </span>
        </Show>
      </span>
    </div>
  )
}

function ContextRow(props: { item: ChartTooltipItem }): JSX.Element {
  return (
    <div data-slot="chart-tooltip-item" style={ROW}>
      <span style={{ ...TRUNCATE, color: 'var(--ink-gray-7)' }}>
        {props.item.label}
      </span>
      <span
        style={{
          'flex-shrink': '0',
          'font-variant-numeric': 'tabular-nums',
          color: 'var(--ink-gray-8)',
        }}
      >
        {props.item.formattedValue}
      </span>
    </div>
  )
}
