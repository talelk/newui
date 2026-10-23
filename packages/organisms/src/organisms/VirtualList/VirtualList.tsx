import { createVirtualizer } from '@tanstack/solid-virtual'
import { For, type JSX, Show, untrack } from 'solid-js'
import { DataState } from '../DataState'

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
  /** Replaces the list with the shared loading skeleton. */
  loading?: boolean
  /** Replaces the list with the shared error state. */
  error?: JSX.Element
  onRetry?: () => void
  emptyTitle?: JSX.Element
  emptyDescription?: JSX.Element
  emptyAction?: JSX.Element
  /** One row's content; the `li` and its position belong to the list. */
  children: (item: T, index: number) => JSX.Element
}

export function VirtualList<T>(props: VirtualListProps<T>): JSX.Element {
  let viewport: HTMLElement | undefined
  const virtualizer = createVirtualizer<HTMLElement, HTMLLIElement>({
    get count() {
      return props.items.length
    },
    getScrollElement: () => viewport ?? null,
    estimateSize: () => props.itemSize,
    // The virtualiser is created once; a changing overscan is not a supported
    // dynamic input, and reading it untracked says so.
    overscan: untrack(() => props.overscan) ?? 6,
  })

  const status = () =>
    props.loading
      ? ('loading' as const)
      : props.error
        ? ('error' as const)
        : props.items.length === 0
          ? ('empty' as const)
          : ('ready' as const)

  return (
    <section
      ref={viewport}
      aria-label={props.label}
      tabindex="0"
      style={{ height: props.height ?? '24rem' }}
      class="relative overflow-auto rounded-3 focus-visible:focus-ring"
      data-slot="virtual-list"
    >
      <Show
        when={status() === 'ready'}
        fallback={
          <DataState
            status={status()}
            skeleton="rows"
            rows={5}
            title={props.emptyTitle}
            description={props.emptyDescription}
            action={props.emptyAction}
            error={props.error}
            onRetry={props.onRetry}
          />
        }
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
                  height: `${props.itemSize}px`,
                  transform: `translateY(${row.start}px)`,
                }}
                aria-posinset={row.index + 1}
                aria-setsize={props.items.length}
              >
                {/* The virtualiser's count is the array's length, so the index
                    is a valid key for the mapped row. */}
                {props.children(props.items[row.index] as T, row.index)}
              </li>
            )}
          </For>
        </ul>
      </Show>
    </section>
  )
}
