import { Icon } from '@newui/ui'
import { A } from '@solidjs/router'
import { createMemo, createSignal, For, type JSX } from 'solid-js'
import { COMPONENTS, GROUPS } from '../generated/components'
import { PageIntro } from '../shell/PageIntro'

/**
 * The component index: every documented compound, grouped, filterable.
 *
 * The same data drives the sidebar. This page exists for the reader who arrives
 * without knowing a name yet — so it shows the *group*, the parts each component
 * ships, and whether it has a written contract, which is the difference between
 * "look at the props" and "there is a page of reasoning".
 */
export function ComponentsIndex(): JSX.Element {
  const [query, setQuery] = createSignal('')

  const visible = createMemo(() => {
    const needle = query().trim().toLowerCase()
    return COMPONENTS.filter((entry) => entry.shipped).filter((entry) =>
      needle === ''
        ? true
        : entry.name.toLowerCase().includes(needle) ||
          entry.group.toLowerCase().includes(needle),
    )
  })

  const grouped = createMemo(() =>
    GROUPS.map((group) => ({
      group,
      entries: visible().filter((entry) => entry.group === group),
    })).filter((section) => section.entries.length > 0),
  )

  return (
    <>
      <PageIntro
        title="Components"
        description="Every compound the library exports, grouped by what it is for. A page per component carries its demo, its prop tables and its contract."
      />

      <label class="relative mb-6 flex max-w-sm items-center">
        <span class="sr-only">Filter components</span>
        <Icon
          icon="lucide-search"
          class="pointer-events-none absolute start-2.5 size-4 text-ink-gray-5"
        />
        <input
          type="search"
          value={query()}
          onInput={(event) => setQuery(event.currentTarget.value)}
          placeholder="Filter by name or group…"
          class="h-8 w-full rounded-4 border border-outline-gray-2 bg-surface-base ps-8 pe-2 text-base text-ink-gray-8 placeholder:text-ink-gray-5 focus-visible:focus-ring"
        />
      </label>

      <div class="flex flex-col gap-10">
        <For each={grouped()}>
          {(section) => (
            <section class="flex flex-col gap-3">
              <h2 class="text-lg-medium text-ink-gray-9">{section.group}</h2>
              <ul class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                <For each={section.entries}>
                  {(entry) => (
                    <li>
                      <A
                        href={`/components/${entry.slug}`}
                        class="flex h-full flex-col gap-1 rounded-5 border border-outline-gray-2 p-3 transition-colors hover:border-outline-gray-3 hover:bg-surface-gray-2 focus-visible:focus-ring"
                      >
                        <span class="flex items-baseline justify-between gap-2">
                          <span class="truncate text-base-medium text-ink-gray-9">
                            {entry.name}
                          </span>
                          <span class="shrink-0 text-xs text-ink-gray-5">
                            {entry.parts.length} part
                            {entry.parts.length === 1 ? '' : 's'}
                          </span>
                        </span>
                        <span class="text-sm text-ink-gray-5">
                          {entry.spec ? 'Has a contract' : 'Props only'}
                        </span>
                      </A>
                    </li>
                  )}
                </For>
              </ul>
            </section>
          )}
        </For>
      </div>
    </>
  )
}
