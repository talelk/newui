import type { JSX } from 'solid-js'

/**
 * The wide-table scroll shell.
 *
 * A table wider than its column needs one focusable, labelled horizontal
 * scroller or keyboard users cannot reach the far columns. Every wide table in
 * the kit uses this one, with the shared header-row classes beside it.
 */
export interface ScrollTableProps {
  /** Names the region, e.g. `Deals table`. */
  label: string
  children: JSX.Element
}

export function ScrollTable(props: ScrollTableProps): JSX.Element {
  return (
    <section
      tabindex="0"
      aria-label={props.label}
      class="overflow-x-auto rounded-3 focus-visible:focus-ring"
    >
      {props.children}
    </section>
  )
}

/** The shared `<thead>` treatment for the examples' tables. */
export const TABLE_HEAD_CLASS =
  'border-y border-outline-gray-1 bg-surface-gray-1 text-caption text-ink-gray-7'
