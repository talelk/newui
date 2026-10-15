import { Icon } from '@newui/ui'
import { A, useLocation } from '@solidjs/router'
import { createMemo, createSignal, For, type JSX } from 'solid-js'
import { COMPONENTS, GROUPS } from '../generated/components'
import { CatalogIcon } from '../lib/CatalogIcon'
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
  const location = useLocation()
  const base = () => `/${location.pathname.split('/')[1] ?? 'components'}`
  const section = () =>
    base() === '/charts'
      ? 'Charts'
      : base() === '/editors'
        ? 'Editors'
        : 'Components'
  const [query, setQuery] = createSignal('')

  const visible = createMemo(() => {
    const needle = query().trim().toLowerCase()
    return COMPONENTS.filter(
      (entry) =>
        entry.shipped &&
        (base() === '/charts'
          ? entry.group === 'Charts'
          : base() === '/editors'
            ? entry.group === 'Editors'
            : entry.kind === 'component' && entry.package === '@newui/ui'),
    ).filter((entry) =>
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
        title={section()}
        description="Controls, demos and API contracts, grouped by purpose."
      />

      <label class="relative mb-6 flex max-w-sm items-center">
        <span class="sr-only">Filter components</span>
        <Icon
          icon="lucide-search"
          class="pointer-events-none absolute start-2.5 size-4 text-ink-gray-6"
        />
        <input
          type="search"
          value={query()}
          onInput={(event) => setQuery(event.currentTarget.value)}
          placeholder="Filter by name or group…"
          class="h-7 w-full rounded-4 border border-outline-gray-2 bg-surface-base ps-8 pe-2 text-base text-ink-gray-8 placeholder:text-ink-gray-6 focus-visible:focus-ring"
        />
      </label>

      <div class="flex flex-col gap-4">
        <For each={grouped()}>
          {(section) => (
            <section class="flex flex-col gap-3">
              <h2 class="text-section text-ink-gray-9">{section.group}</h2>
              <ul class="flex flex-col divide-y divide-outline-gray-1 rounded-5 border border-outline-gray-1">
                <For each={section.entries}>
                  {(entry) => (
                    <li>
                      <A
                        href={`${base()}/${entry.slug}`}
                        class="flex min-h-11 items-center gap-3 rounded-3 p-3 transition-colors hover:bg-surface-gray-2 focus-visible:focus-ring"
                      >
                        <CatalogIcon group={section.group} />
                        <span class="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-2">
                          <span class="truncate text-base-medium text-ink-gray-9">
                            {entry.name}
                          </span>
                          <span class="hidden min-w-0 flex-1 truncate text-caption text-ink-gray-6 md:block">
                            {entry.description}
                          </span>
                          <span class="shrink-0 text-xs text-ink-gray-6">
                            {entry.parts.length} part
                            {entry.parts.length === 1 ? '' : 's'}
                          </span>
                        </span>
                        <span class="hidden text-caption text-ink-gray-6 sm:block">
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
