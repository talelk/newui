import { A, useLocation } from '@solidjs/router'
import { Icon } from '@talelk/newui-atoms'
import { createMemo, createSignal, type JSX, Show } from 'solid-js'
import { COMPONENTS, GROUPS } from '../generated/components'
import { ATOMIC, levelOf } from '../lib/atomic'
import { stripBase } from '../lib/base'
import { CatalogList } from '../lib/CatalogList'
import { groupEntries } from '../lib/catalog'
import { PageIntro } from '../shell/PageIntro'

/**
 * One atomic level's index: every entry filed under it, grouped by purpose.
 *
 * The same page serves `/atoms`, `/molecules`, `/organisms` and `/templates`.
 * The level comes from the path, the entries from the registry's `atomic` field,
 * and the intro from `lib/atomic.ts` — so "what is an organism" is answered in
 * one place. A component page's own sidebar reads the same field.
 */
export function ComponentsIndex(): JSX.Element {
  const location = useLocation()
  const level = () =>
    levelOf(stripBase(location.pathname).split('/')[1] ?? '') ?? 'atom'
  const meta = () => ATOMIC[level()]
  const [query, setQuery] = createSignal('')

  const visible = createMemo(() => {
    const needle = query().trim().toLowerCase()
    return COMPONENTS.filter(
      (entry) => entry.shipped && entry.atomic === level(),
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
      <PageIntro title={meta().label} description={meta().description} />

      <Show when={level() === 'organism'}>
        <section
          class="mb-6 flex flex-col gap-2"
          aria-label="Copyable site compositions"
        >
          <h2 class="text-section">Site compositions</h2>
          <p class="text-ink-gray-7">
            Copy the source; these are not package exports.
          </p>
          <div class="flex flex-wrap gap-4">
            <A
              href="/organisms/compositions/sidebar-01"
              class="text-ink-blue-link underline"
            >
              Grouped documentation sidebar
            </A>
            <A
              href="/organisms/compositions/demo-sidebar"
              class="text-ink-blue-link underline"
            >
              Application sidebar
            </A>
          </div>
        </section>
      </Show>

      <label class="relative mb-6 flex max-w-sm items-center">
        <span class="sr-only">Filter {meta().label.toLowerCase()}</span>
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
        href={(entry) => `${meta().href}/${entry.slug}`}
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
