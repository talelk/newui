import { createVirtualizer } from '@tanstack/solid-virtual'
import { For, type JSX } from 'solid-js'

export interface ActivityRecord {
  id: string
  title: string
  status: string
  owner: string
}

/** A bounded DOM for large local feeds; the regular table remains available. */
export function ActivityList(props: { rows: ActivityRecord[] }): JSX.Element {
  let scrollElement: HTMLElement | undefined
  const virtualizer = createVirtualizer<HTMLElement, HTMLLIElement>({
    get count() {
      return props.rows.length
    },
    getScrollElement: () => scrollElement ?? null,
    estimateSize: () => 72,
    overscan: 6,
  })
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
      <section
        ref={scrollElement}
        aria-label="Task activity"
        tabindex="0"
        class="relative h-[440px] overflow-auto rounded-3 focus-visible:focus-ring"
        data-slot="virtual-activity"
      >
        <ul
          class="relative m-0 list-none p-0"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          <For each={virtualizer.getVirtualItems()}>
            {(item) => {
              const row = () => props.rows[item.index]
              return (
                <li
                  class="absolute inset-x-0 top-0 flex h-[72px] items-center gap-3 border-b border-outline-gray-1 px-4"
                  style={{ transform: `translateY(${item.start}px)` }}
                  aria-posinset={item.index + 1}
                  aria-setsize={props.rows.length}
                >
                  <span
                    class="grid size-8 shrink-0 place-items-center rounded-full bg-surface-blue-2 text-caption text-ink-blue-8"
                    aria-hidden="true"
                  >
                    {row()
                      ?.owner.split(' ')
                      .map((word) => word[0])
                      .join('')}
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="truncate font-medium">{row()?.title}</p>
                    <p class="text-caption text-ink-gray-7">
                      {row()?.owner} · {row()?.id}
                    </p>
                  </div>
                  <span class="text-caption text-ink-gray-7">
                    {row()?.status}
                  </span>
                </li>
              )
            }}
          </For>
        </ul>
      </section>
    </section>
  )
}
