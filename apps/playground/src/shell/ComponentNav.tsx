import { A, useLocation } from '@solidjs/router'
import { createMemo, createSignal, For, type JSX, Show } from 'solid-js'
import { COMPONENTS, GROUPS } from '../generated/components'
import { groupEntries, matchesEntry } from '../lib/catalog'
import { FilterInput, NAV_ROW, NothingMatches } from './nav-ui'

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
      .filter((entry) => matchesEntry(entry, query()))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name)),
  )

  const grouped = createMemo(() => groupEntries(visible(), GROUPS))

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
      <FilterInput
        label="Filter"
        placeholder="Filter…"
        value={query()}
        onInput={setQuery}
      />

      <ul class="flex flex-col gap-0.5">
        <For each={overview()}>
          {(item) => (
            <li>
              <A
                href={item.href}
                aria-current={
                  location.pathname === item.href ? 'page' : undefined
                }
                class={NAV_ROW}
              >
                {item.title}
              </A>
            </li>
          )}
        </For>
      </ul>

      <Show
        when={grouped().length > 0}
        fallback={<NothingMatches query={query()} />}
      >
        <For each={grouped()}>
          {(section) => (
            <div class="flex flex-col gap-0.5">
              <h2 class="px-2 pt-1 text-xs-medium text-ink-gray-7">
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
                        class={NAV_ROW}
                      >
                        <span class="min-w-0 flex-1 truncate">
                          {entry.name}
                        </span>
                        <Show when={!entry.spec}>
                          <span class="shrink-0 text-xs text-ink-gray-7">
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
