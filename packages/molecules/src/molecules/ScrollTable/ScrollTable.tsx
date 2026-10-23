import { tableHeadClass } from '@talelk/newui-atoms/internal'
import type { JSX, ParentComponent } from 'solid-js'

/**
 * The wide-table scroll shell.
 *
 * A table wider than its column needs one focusable, labelled horizontal
 * scroller or keyboard users cannot reach the far columns. Every wide table in
 * the kit uses this one, with `ScrollTableHead` for its header row.
 */
export interface ScrollTableProps {
  /** Names the region, e.g. `Deals table`. */
  label: string
  /** Keep the header row visible while the region scrolls vertically. */
  stickyHeader?: boolean
  children: JSX.Element
}

export function ScrollTable(props: ScrollTableProps): JSX.Element {
  return (
    <section
      tabindex="0"
      aria-label={props.label}
      data-slot="scroll-table"
      class={`overflow-x-auto rounded-3 focus-visible:focus-ring ${
        props.stickyHeader
          ? '[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-raised'
          : ''
      }`}
    >
      {props.children}
    </section>
  )
}

/** The shared `<thead>` treatment for the kit's tables. */
export const ScrollTableHead: ParentComponent = (props) => (
  <thead data-slot="scroll-table-head" class={tableHeadClass}>
    {props.children}
  </thead>
)
