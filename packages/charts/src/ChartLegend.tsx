import { createSignal, For, type JSX, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import type { ChartLegendItem, ChartLegendProps } from './types'

/**
 * The row under a plot that names its series. Each entry is a toggle: pressing
 * it flips the series' visibility, and hovering or focusing it raises a
 * highlight so the caller can emphasise the matching marks.
 *
 * While one entry is highlighted the others dim, mirroring the emphasis the
 * caller applies to the marks — but only when a handler exists to act on it;
 * a legend nobody wired up stays at full strength.
 *
 * It takes the rows it needs rather than scrolling: a legend that scrolls hides
 * series names behind a gesture nobody makes.
 */
export function ChartLegend(props: ChartLegendProps): JSX.Element {
  const [highlighted, setHighlighted] = createSignal<string | null>(null)
  const interactive = () => Boolean(props.onToggle || props.onHighlight)

  return (
    <div
      data-slot="chart-legend"
      dir={props.dir}
      class={props.class}
      style={{
        display: 'flex',
        'flex-wrap': 'wrap',
        'align-items': 'center',
        'justify-content': 'center',
        'column-gap': '0.5rem',
        'row-gap': '0.125rem',
      }}
    >
      <For each={props.items}>
        {(item) => (
          <LegendEntry
            item={item}
            dimmed={
              interactive() &&
              highlighted() !== null &&
              highlighted() !== item.name
            }
            onToggle={props.onToggle}
            onHighlight={(name) => {
              setHighlighted(name)
              props.onHighlight?.(name)
            }}
          />
        )}
      </For>
    </div>
  )
}

function LegendEntry(props: {
  item: ChartLegendItem
  dimmed?: boolean
  onToggle?: (name: string) => void
  onHighlight?: (name: string | null) => void
}): JSX.Element {
  // The accessible name has to contain everything visible inside the button
  // (WCAG 2.5.3): the series label *and* the value hint.
  const toggleLabel = () => {
    const action = props.item.hidden ? 'Show' : 'Hide'
    const hint = props.item.hint ? ` ${props.item.hint}` : ''
    return `${action} ${props.item.label}${hint}`
  }

  const interactive = () => Boolean(props.onToggle)
  return (
    <Dynamic
      component={interactive() ? 'button' : 'span'}
      {...(interactive() ? { type: 'button' as const } : {})}
      data-slot="chart-legend-item"
      data-dimmed={props.dimmed || undefined}
      aria-pressed={interactive() ? !props.item.hidden : undefined}
      aria-label={interactive() ? toggleLabel() : undefined}
      onClick={
        interactive() ? () => props.onToggle?.(props.item.name) : undefined
      }
      onMouseEnter={() => props.onHighlight?.(props.item.name)}
      onMouseLeave={() => props.onHighlight?.(null)}
      onFocus={
        interactive() ? () => props.onHighlight?.(props.item.name) : undefined
      }
      onBlur={interactive() ? () => props.onHighlight?.(null) : undefined}
      style={{
        display: 'inline-flex',
        'align-items': 'center',
        gap: '0.375rem',
        padding: '4px 8px',
        'min-height': '28px',
        'font-size': '0.75rem',
        'line-height': '1rem',
        border: 'none',
        'border-radius': 'var(--radius-pill)',
        background: 'transparent',
        cursor: interactive() ? 'pointer' : 'default',
        color: 'var(--ink-gray-7)',
        opacity: props.dimmed ? '0.4' : undefined,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: '14px',
          height: '3px',
          'flex-shrink': '0',
          'border-radius': 'var(--radius-pill)',
          'background-color': props.item.color,
          opacity: props.item.hidden ? '0.3' : '1',
        }}
      />
      <span
        style={{
          'text-decoration': props.item.hidden ? 'line-through' : undefined,
        }}
      >
        {props.item.label}
        {/* The hint stays inside the label's text flow so the visible string
            ("Revenue 100") is one run — the accessible name has to contain it
            (WCAG 2.5.3), and `"Revenue100"` would not. */}
        <Show when={props.item.hint}>
          {' '}
          <span
            style={{
              color: 'var(--ink-gray-7)',
              'font-variant-numeric': 'tabular-nums',
            }}
          >
            {props.item.hint}
          </span>
        </Show>
      </span>
    </Dynamic>
  )
}
