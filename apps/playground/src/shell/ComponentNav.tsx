import { A, useLocation } from '@solidjs/router'
import { createMemo, createSignal, For, type JSX, Show } from 'solid-js'
import {
  COMPONENTS,
  type ComponentEntry,
  GROUPS,
} from '../generated/components'

export type NavKind = 'component' | 'block'

/**
 * The section sidebar for the reference pages: every entry of one kind,
 * grouped, with a filter.
 *
 * It lives inside those routes rather than in the site shell, because the shell
 * is on every route and this index is ~4 kB gzipped that only a reference page
 * can use. That is the same rule that keeps the home page at 52 kB: a page pays
 * for its own furniture.
 *
 * `kind` is the only difference between the components sidebar and the blocks
 * one — same filter, same grouping, same active state.
 */

/** The pages in each section that are not generated. */
export const OVERVIEW: Record<NavKind, { title: string; href: string }[]> = {
  component: [{ title: 'All components', href: '/components' }],
  block: [{ title: 'All blocks', href: '/blocks' }],
}

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

export function ComponentNav(props: { kind: NavKind }): JSX.Element {
  const location = useLocation()
  const base = () => `/${location.pathname.split('/')[1] ?? 'components'}`
  const [query, setQuery] = createSignal('')

  const visible = createMemo(() =>
    COMPONENTS.filter(
      (entry) =>
        entry.shipped &&
        entry.kind === props.kind &&
        (base() === '/charts'
          ? entry.group === 'Charts'
          : base() === '/editors'
            ? entry.group === 'Editors'
            : entry.package ===
              (props.kind === 'block' ? '@newui/blocks' : '@newui/ui')),
    )
      .filter((entry) => matches(entry, query().trim()))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name)),
  )

  const grouped = createMemo(() =>
    GROUPS.map((group) => ({
      group,
      entries: visible().filter((entry) => entry.group === group),
    })).filter((section) => section.entries.length > 0),
  )

  const current = () => location.pathname.split('/')[2] ?? ''
  const overview = () =>
    base() === '/charts' || base() === '/editors'
      ? [
          {
            title: base() === '/charts' ? 'All charts' : 'All editors',
            href: base(),
          },
        ]
      : OVERVIEW[props.kind]

  return (
    <nav
      aria-label={props.kind === 'block' ? 'Blocks' : 'Components'}
      class="flex flex-col gap-4"
    >
      <label class="relative flex items-center">
        <span class="sr-only">Filter</span>
        <span
          aria-hidden="true"
          class="lucide-search pointer-events-none absolute start-2.5 size-4 text-ink-gray-6"
        />
        <input
          type="search"
          value={query()}
          onInput={(event) => setQuery(event.currentTarget.value)}
          placeholder="Filter…"
          class="h-7 w-full rounded-3 border border-outline-gray-2 bg-surface-base ps-8 pe-2 text-base text-ink-gray-8 placeholder:text-ink-gray-6 focus-visible:focus-ring"
        />
      </label>

      <ul class="flex flex-col gap-0.5">
        <For each={overview()}>
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
          <p class="px-2 text-sm text-ink-gray-6">
            Nothing matches “{query()}”.
          </p>
        }
      >
        <For each={grouped()}>
          {(section) => (
            <div class="flex flex-col gap-0.5">
              <h2 class="px-2 text-xs font-medium tracking-wide text-ink-gray-6 uppercase">
                {section.group}
              </h2>
              <ul class="flex flex-col gap-0.5">
                <For each={section.entries}>
                  {(entry) => (
                    <li>
                      <A
                        href={`${base()}/${entry.slug}`}
                        aria-current={
                          current() === entry.slug ? 'page' : undefined
                        }
                        class="flex items-baseline gap-2 rounded-4 px-2 py-1 text-sm text-ink-gray-6 transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-9 aria-[current=page]:bg-surface-gray-2 aria-[current=page]:text-ink-gray-9"
                      >
                        <span class="min-w-0 flex-1 truncate">
                          {entry.name}
                        </span>
                        <Show when={!entry.spec}>
                          <span class="shrink-0 text-xs text-ink-gray-6">
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
