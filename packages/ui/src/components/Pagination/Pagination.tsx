import * as zag from '@zag-js/pagination'
import {
  type Accessor,
  createContext,
  For,
  type JSX,
  type ParentComponent,
  Show,
  splitProps,
  useContext,
} from 'solid-js'
import { createId } from '../../lib/id'
import { cn, tv } from '../../lib/tv'
import { createZagApi, createZagContext } from '../../lib/zag'
import { Icon } from '../Icon'

type PaginationApi = ReturnType<typeof zag.connect>

const { context, useApi } = createZagContext<PaginationApi>('Pagination')

/**
 * The recipe size, shared with every part.
 *
 * Not on the machine: `size` is our vocabulary, not Zag's, and reading it from a
 * context is what lets `<Pagination.Pages />` be dropped in without the caller
 * having to repeat the size it already gave the root.
 */
const DEFAULT_SIZE: PaginationSize = 'sm'

const PaginationSizeContext = createContext<Accessor<{ size: PaginationSize }>>(
  () => ({ size: DEFAULT_SIZE }),
)

function useSize(): PaginationSize {
  return useContext(PaginationSizeContext)().size
}

export type PaginationSize = 'sm' | 'md' | 'lg'

/** Square hit areas, so the numbers and the arrows line up as one row. */
export const paginationItem = tv({
  base: 'grid shrink-0 cursor-pointer place-items-center rounded-4 text-base tabular-nums transition-colors outline-none focus-visible:focus-ring',
  variants: {
    size: {
      sm: 'size-6 min-w-6 px-1.5',
      md: 'size-7 min-w-7 px-2',
      lg: 'size-8 min-w-8 px-2.5',
    },
    state: {
      idle: 'text-ink-gray-7 hover:bg-surface-gray-2 hover:text-ink-gray-9',
      selected: 'bg-surface-gray-10 text-ink-base',
    },
    disabled: {
      true: 'cursor-not-allowed text-ink-gray-4 hover:bg-transparent',
      false: '',
    },
  },
  defaultVariants: { size: 'sm', state: 'idle', disabled: false },
})

export interface PaginationProps {
  size?: PaginationSize
  /** Current page, 1-based. */
  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void
  /**
   * The number of **rows**, not pages — Zag derives the page count from this and
   * `pageSize`. Naming it after the rows is what keeps a caller from passing a
   * page count here and getting half the pagination they expected.
   */
  count?: number
  /** Rows per page. */
  pageSize?: number
  /** Page buttons either side of the current one. Default `1`. */
  siblingCount?: number
  /** Page buttons pinned at each end. Default `1`. */
  boundaryCount?: number
  disabled?: boolean
  /** Accessible name for the `<nav>`. */
  'aria-label'?: string
  class?: string
  children?: JSX.Element
}

/**
 * A pager: `Root` · `PrevTrigger` · `Pages` · `NextTrigger` · `Range`.
 *
 * Zag's `pagination` machine owns the real work — which numbers show around the
 * current page, when an ellipsis stands in for a gap, the `boundaryCount` /
 * `siblingCount` layout rule, the arrow-key map — so this is the recipe plus a
 * `Range` part, because "1–20 of 348" is arithmetic each caller otherwise gets
 * subtly wrong.
 *
 * The parts are separate so a table can put the numbers in a toolbar and the
 * range under a column header, which is where it usually belongs.
 */
export const PaginationRoot: ParentComponent<PaginationProps> = (props) => {
  const [local] = splitProps(props, [
    'size',
    'page',
    'defaultPage',
    'onPageChange',
    'count',
    'pageSize',
    'siblingCount',
    'boundaryCount',
    'disabled',
    'aria-label',
    'class',
  ])

  /**
   * One accessor, shared with every part through the context. It returns an
   * object because `eslint-plugin-solid` reads a function returning a bare
   * reactive value as an eager read; the wrapper is the same shape `Tabs` uses.
   */
  const size = (): { size: PaginationSize } => ({ size: local.size ?? 'sm' })

  const { api } = createZagApi<PaginationApi>(zag.machine, zag.connect, () => ({
    id: createId('pagination'),
    page: local.page,
    defaultPage: local.defaultPage,
    count: local.count,
    pageSize: local.pageSize,
    siblingCount: local.siblingCount,
    boundaryCount: local.boundaryCount,
    disabled: local.disabled,
    type: 'button' as const,
    onPageChange: (details: { page: number }) =>
      local.onPageChange?.(details.page),
  }))

  return (
    <context.Provider value={api}>
      <PaginationSizeContext.Provider value={size}>
        <nav
          {...api().getRootProps()}
          aria-label={local['aria-label'] ?? 'Pagination'}
          data-slot="pagination"
          data-size={size().size}
          class={cn('flex items-center gap-1', local.class)}
        >
          {props.children}
        </nav>
      </PaginationSizeContext.Provider>
    </context.Provider>
  )
}

/** The recipe every part shares, so a page number and an arrow cannot drift. */
function itemClass(state: {
  size: PaginationSize
  selected?: boolean
  disabled?: boolean
}): string {
  return paginationItem({
    size: state.size,
    state: state.selected ? 'selected' : 'idle',
    disabled: Boolean(state.disabled),
  })
}

export const PaginationPrevTrigger: ParentComponent = () => {
  const api = useApi()
  const size = useSize()
  return (
    <button
      {...api().getPrevTriggerProps()}
      data-slot="pagination-prev"
      aria-label="Previous page"
      class={itemClass({
        size,
        disabled: api().previousPage === null,
      })}
    >
      <Icon icon="lucide-chevron-left" class="size-4" />
    </button>
  )
}

export const PaginationNextTrigger: ParentComponent = () => {
  const api = useApi()
  const size = useSize()
  return (
    <button
      {...api().getNextTriggerProps()}
      data-slot="pagination-next"
      aria-label="Next page"
      class={itemClass({
        size,
        disabled: api().nextPage === null,
      })}
    >
      <Icon icon="lucide-chevron-right" class="size-4" />
    </button>
  )
}

/**
 * The numbered pages, with the machine's own ellipses between them.
 *
 * `api().pages` is Zag's plan for the row (`ellipsis` | `page`), so the layout
 * rule lives in the machine rather than here — and the ellipsis keeps its
 * `getEllipsisProps` id, which is what stops two gaps in one row from colliding.
 */
export const PaginationPages: ParentComponent = () => {
  const api = useApi()
  const size = useSize()

  return (
    <For each={api().pages}>
      {(entry, index) => (
        <Show
          when={entry.type === 'page' && entry}
          fallback={
            <span
              {...api().getEllipsisProps({ index: index() })}
              data-slot="pagination-ellipsis"
              class="grid size-6 place-items-center text-ink-gray-6"
            >
              …
            </span>
          }
        >
          {(page) => (
            <button
              {...api().getItemProps({ type: 'page', value: page().value })}
              data-slot="pagination-page"
              aria-label={`Page ${page().value}`}
              class={itemClass({
                size,
                selected: api().page === page().value,
              })}
            >
              {page().value}
            </button>
          )}
        </Show>
      )}
    </For>
  )
}

/**
 * "1–20 of 348".
 *
 * Read off the machine rather than recomputed, so it cannot disagree with the
 * numbers beside it. One thing it *does* fix: Zag's `pageRange.start` is the
 * number of rows *before* this page (0 for the first page, 20 for the second),
 * so the human-facing first row is `start + 1`. That off-by-one is exactly what
 * this part exists to get right once.
 */
export const PaginationRange: ParentComponent<{ class?: string }> = (props) => {
  const api = useApi()
  const first = () => (api().count === 0 ? 0 : api().pageRange.start + 1)

  return (
    <span
      data-slot="pagination-range"
      class={cn('text-sm whitespace-nowrap text-ink-gray-6', props.class)}
    >
      {first()}–{api().pageRange.end} of {api().count}
    </span>
  )
}

export const Pagination = {
  Root: PaginationRoot,
  PrevTrigger: PaginationPrevTrigger,
  NextTrigger: PaginationNextTrigger,
  Pages: PaginationPages,
  Range: PaginationRange,
}
