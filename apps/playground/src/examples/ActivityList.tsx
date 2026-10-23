import { VirtualList } from '@talelk/newui-organisms'
import type { JSX } from 'solid-js'

export interface ActivityRecord {
  id: string
  title: string
  status: string
  owner: string
}

/**
 * The task feed: a bounded DOM over the thousand seeded records.
 *
 * The section heading belongs to the page's `Section`; this keeps the card and
 * the row anatomy (who, what, which record) while `VirtualList` owns the
 * virtualiser, the focusable scroll region, the ARIA row positions and the
 * shared loading, empty and error states.
 */
export function ActivityList(props: {
  rows: ActivityRecord[]
  loading?: boolean
  error?: JSX.Element
  onRetry?: () => void
  emptyTitle?: JSX.Element
  emptyDescription?: JSX.Element
  emptyAction?: JSX.Element
}): JSX.Element {
  return (
    <div class="overflow-hidden rounded-card border border-outline-gray-1 bg-surface-elevation-1">
      <VirtualList
        label="Task activity"
        items={props.rows}
        itemSize={72}
        height="440px"
        loading={props.loading}
        error={props.error}
        onRetry={props.onRetry}
        emptyTitle={props.emptyTitle}
        emptyDescription={props.emptyDescription}
        emptyAction={props.emptyAction}
      >
        {(row) => (
          <div class="flex h-full items-center gap-3 border-b border-outline-gray-1 px-4">
            <span
              class="grid size-8 shrink-0 place-items-center rounded-full bg-surface-blue-2 text-caption text-ink-blue-8"
              aria-hidden="true"
            >
              {row.owner
                .split(' ')
                .map((word) => word[0])
                .join('')}
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium">{row.title}</p>
              <p class="text-caption text-ink-gray-7">
                {row.owner} · {row.id}
              </p>
            </div>
            <span class="text-caption text-ink-gray-7">{row.status}</span>
          </div>
        )}
      </VirtualList>
    </div>
  )
}
