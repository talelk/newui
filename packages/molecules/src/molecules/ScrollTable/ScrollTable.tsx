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
  /**
   * Bound the region to a fixed viewport height (a CSS length) and let the
   * content scroll vertically. This is the hook a virtualised body needs:
   * the windowing scroller wants a viewport, not a page-sized box.
   */
  height?: string
  /** Receives the scroll-region element — the virtualiser's scroll element. */
  ref?: (el: HTMLElement) => void
  children: JSX.Element
}

export function ScrollTable(props: ScrollTableProps): JSX.Element {
  return (
    <section
      ref={(el: HTMLElement) => props.ref?.(el)}
      tabindex="0"
      aria-label={props.label}
      data-slot="scroll-table"
      style={props.height ? { height: props.height } : undefined}
      class={`overflow-x-auto rounded-control focus-visible:focus-ring ${
        props.height ? 'overflow-y-auto' : ''
      } ${
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
