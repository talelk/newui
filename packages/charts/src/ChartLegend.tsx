import { For, type JSX, Show } from 'solid-js'
import type { ChartLegendItem, ChartLegendProps } from './types'

/**
 * The row under a plot that names its series. Each entry is a toggle: pressing
 * it flips the series' visibility, and hovering or focusing it raises a
 * highlight so the caller can emphasise the matching marks.
 *
 * It takes the rows it needs rather than scrolling: a legend that scrolls hides
 * series names behind a gesture nobody makes.
 */
export function ChartLegend(props: ChartLegendProps): JSX.Element {
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
        'column-gap': '0.25rem',
        'row-gap': '0.125rem',
      }}
    >
      <For each={props.items}>
        {(item) => (
          <LegendEntry
            item={item}
            onToggle={props.onToggle}
            onHighlight={props.onHighlight}
          />
        )}
      </For>
    </div>
  )
}

function LegendEntry(props: {
  item: ChartLegendItem
  onToggle?: (name: string) => void
  onHighlight?: (name: string | null) => void
}): JSX.Element {
  const toggleLabel = () =>
    `${props.item.hidden ? 'Show' : 'Hide'} ${props.item.label}`

  return (
    <button
      type="button"
      data-slot="chart-legend-item"
      aria-pressed={!props.item.hidden}
      aria-label={toggleLabel()}
      onClick={() => props.onToggle?.(props.item.name)}
      onMouseEnter={() => props.onHighlight?.(props.item.name)}
      onMouseLeave={() => props.onHighlight?.(null)}
      onFocus={() => props.onHighlight?.(props.item.name)}
      onBlur={() => props.onHighlight?.(null)}
      style={{
        display: 'inline-flex',
        'align-items': 'center',
        gap: '0.375rem',
        padding: '4px 8px',
        'min-height': '28px',
        'font-size': '0.75rem',
        'line-height': '1rem',
        border: 'none',
        'border-radius': '6px',
        background: 'transparent',
        cursor: 'pointer',
        color: 'var(--ink-gray-6)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: '0.5rem',
          height: '0.5rem',
          'border-radius': '9999px',
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
      </span>
      <Show when={props.item.hint}>
        <span style={{ color: 'var(--ink-gray-6)' }}>{props.item.hint}</span>
      </Show>
    </button>
  )
}
