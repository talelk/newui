import { Icon } from '@newui/ui'
import { A, useLocation } from '@solidjs/router'
import { createMemo, createSignal, For, type JSX, Show } from 'solid-js'
import {
  COMPONENTS,
  type ComponentEntry,
  GROUPS,
} from '../generated/components'

/**
 * The section sidebar for `/components/*`: every documented component, grouped,
 * with a filter.
 *
 * It lives inside the components routes rather than in the site shell, because
 * the shell is on every route and this index is ~4 kB gzipped that only a
 * component page can use. That is the same rule that keeps the home page at
 * 48 kB: a page pays for its own furniture.
 */

/**
 * The pages in this section that are not generated: the index, and the two
 * hand-written reference pages. Listed first, because they are what to read
 * before browsing a single component.
 */
const OVERVIEW = [
  { title: 'All components', href: '/components' },
  { title: 'Anatomy & variants', href: '/components/atoms' },
  { title: 'Feedback & state', href: '/components/feedback' },
]

/** Name, group and part names are all fair game for the filter. */
function matches(entry: ComponentEntry, query: string): boolean {
  if (query === '') return true
  const needle = query.toLowerCase()
  return (
    entry.name.toLowerCase().includes(needle) ||
    entry.group.toLowerCase().includes(needle) ||
    entry.parts.some((part) => part.toLowerCase().includes(needle))
  )
}

export function ComponentNav(): JSX.Element {
  const location = useLocation()
  const [query, setQuery] = createSignal('')

  const visible = createMemo(() =>
    COMPONENTS.filter((entry) => entry.shipped).filter((entry) =>
      matches(entry, query().trim()),
    ),
  )

  const grouped = createMemo(() =>
    GROUPS.map((group) => ({
      group,
      entries: visible().filter((entry) => entry.group === group),
    })).filter((section) => section.entries.length > 0),
  )

  const current = () => location.pathname.split('/')[2] ?? ''

  return (
    <nav aria-label="Components" class="flex flex-col gap-4">
      <label class="relative flex items-center">
        <span class="sr-only">Filter components</span>
        <Icon
          icon="lucide-search"
          class="pointer-events-none absolute start-2 size-3.5 text-ink-gray-5"
        />
        <input
          type="search"
          value={query()}
          onInput={(event) => setQuery(event.currentTarget.value)}
          placeholder="Filter…"
          class="h-7 w-full rounded-4 border border-outline-gray-2 bg-surface-base ps-7 pe-2 text-sm text-ink-gray-8 placeholder:text-ink-gray-5 focus-visible:focus-ring"
        />
      </label>

      <ul class="flex flex-col gap-0.5">
        <For each={OVERVIEW}>
          {(item) => (
            <li>
              <A
                href={item.href}
                aria-current={
                  location.pathname === item.href ? 'page' : undefined
                }
                class="block rounded-4 px-2 py-1 text-sm text-ink-gray-6 transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-9 aria-[current=page]:bg-surface-gray-2 aria-[current=page]:text-ink-gray-9"
              >
                {item.title}
              </A>
            </li>
          )}
        </For>
      </ul>

      <Show
        when={grouped().length > 0}
        fallback={
          <p class="px-2 text-sm text-ink-gray-5">
            Nothing matches “{query()}”.
          </p>
        }
      >
        <For each={grouped()}>
          {(section) => (
            <div class="flex flex-col gap-0.5">
              <h2 class="px-2 text-xs font-medium tracking-wide text-ink-gray-5 uppercase">
                {section.group}
              </h2>
              <ul class="flex flex-col gap-0.5">
                <For each={section.entries}>
                  {(entry) => (
                    <li>
                      <A
                        href={`/components/${entry.slug}`}
                        aria-current={
                          current() === entry.slug ? 'page' : undefined
                        }
                        class="flex items-baseline gap-2 rounded-4 px-2 py-1 text-sm text-ink-gray-6 transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-9 aria-[current=page]:bg-surface-gray-2 aria-[current=page]:text-ink-gray-9"
                      >
                        <span class="min-w-0 flex-1 truncate">
                          {entry.name}
                        </span>
                        <Show when={!entry.spec}>
                          <span class="shrink-0 text-xs text-ink-gray-5">
                            api
                          </span>
                        </Show>
                      </A>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          )}
        </For>
      </Show>
    </nav>
  )
}
