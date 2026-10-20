import { cn } from '@newui/ui'
import { createVirtualizer } from '@tanstack/solid-virtual'
import { For, type JSX, splitProps, untrack } from 'solid-js'

/**
 * A bounded DOM for a long list.
 *
 * A feed of a thousand rows does not need a thousand nodes: this keeps about a
 * viewport's worth mounted and positions them, which is what makes the task
 * activity stream scroll to the end with fewer than thirty `li`s in the document.
 *
 * The scroll region is focusable on purpose — a region that scrolls and cannot
 * be reached from the keyboard cannot be read past its first screen (WCAG
 * 2.1.1), and that is the same contract `ScrollArea` documents. `Home`/`End`/
 * arrows scroll it natively once it has focus.
 *
 * Rows are fixed-height by design: a virtualiser that has to measure every row
 * to know where the next one starts defeats the point on the lists this is for.
 */
export interface VirtualListProps<T> {
  items: readonly T[]
  /** Accessible name of the scroll region. */
  label: string
  /** Row height in pixels. Fixed, so the total height is known up front. */
  itemSize: number
  /** The viewport's height as a CSS length. Default `24rem`. */
  height?: string
  /** Rows rendered beyond the viewport. Default `6`. */
  overscan?: number
  /** One row's content; the `li` and its position belong to the list. */
  children: (item: T, index: number) => JSX.Element
  class?: string
}

export function VirtualList<T>(props: VirtualListProps<T>): JSX.Element {
  const [local, rest] = splitProps(props, [
    'items',
    'label',
    'itemSize',
    'height',
    'overscan',
    'children',
    'class',
  ])
  let viewport: HTMLElement | undefined
  const virtualizer = createVirtualizer<HTMLElement, HTMLLIElement>({
    get count() {
      return local.items.length
    },
    getScrollElement: () => viewport ?? null,
    estimateSize: () => local.itemSize,
    // The virtualiser is created once; a changing overscan is not a supported
    // dynamic input, and reading it untracked says so.
    overscan: untrack(() => local.overscan) ?? 6,
  })

  return (
    <section
      {...rest}
      ref={viewport}
      aria-label={local.label}
      tabindex="0"
      style={{ height: local.height ?? '24rem' }}
      class={cn(
        'relative overflow-auto rounded-3 focus-visible:focus-ring',
        local.class,
      )}
      data-slot="virtual-list"
    >
      <ul
        class="relative m-0 list-none p-0"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        <For each={virtualizer.getVirtualItems()}>
          {(row) => (
            <li
              class="absolute inset-x-0 top-0"
              style={{
                height: `${local.itemSize}px`,
                transform: `translateY(${row.start}px)`,
              }}
              aria-posinset={row.index + 1}
              aria-setsize={local.items.length}
            >
              {/* The virtualiser's count is the array's length, so the index
                  is a valid key for the mapped row. */}
              {local.children(local.items[row.index] as T, row.index)}
            </li>
          )}
        </For>
      </ul>
    </section>
  )
}
