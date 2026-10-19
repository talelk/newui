import { Icon } from '@newui/ui'
import { useLocation } from '@solidjs/router'
import { createMemo, createSignal, type JSX, Show } from 'solid-js'
import { COMPONENTS, GROUPS } from '../generated/components'
import { CatalogList } from '../lib/CatalogList'
import { groupEntries } from '../lib/catalog'
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

  const grouped = createMemo(() => groupEntries(visible(), GROUPS))

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

      <CatalogList
        sections={grouped()}
        href={(entry) => `${base()}/${entry.slug}`}
        trailing={(entry) => (
          <>
            <Show when={entry.parts.length > 0}>
              <span class="shrink-0 text-xs text-ink-gray-7">
                {entry.parts.length} part{entry.parts.length === 1 ? '' : 's'}
              </span>
            </Show>
            <span class="hidden text-caption text-ink-gray-7 sm:block">
              {entry.spec ? 'Has a contract' : 'Props only'}
            </span>
          </>
        )}
      />
    </>
  )
}
