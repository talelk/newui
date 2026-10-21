import { VirtualList } from '@newui/organisms'
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
 * The virtualiser, the focusable scroll region and the ARIA row positions are
 * `@newui/organisms`; this keeps the row's own anatomy (who, what, which
 * record) and the card around it.
 */
export function ActivityList(props: { rows: ActivityRecord[] }): JSX.Element {
  return (
    <section
      aria-label="Activity stream"
      class="rounded-5 border border-outline-gray-1 bg-surface-elevation-1"
    >
      <div class="border-b border-outline-gray-1 p-3">
        <h2 class="text-section">Workspace activity</h2>
        <p class="text-caption text-ink-gray-7">
          {props.rows.length} records · Scroll to explore the complete feed.
        </p>
      </div>
      <VirtualList
        label="Task activity"
        items={props.rows}
        itemSize={72}
        height="440px"
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
    </section>
  )
}
