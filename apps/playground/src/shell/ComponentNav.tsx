import { A, useLocation } from '@solidjs/router'
import { createMemo, createSignal, For, type JSX, Show } from 'solid-js'
import { COMPONENTS, GROUPS } from '../generated/components'
import { ATOMIC, type AtomicLevel } from '../lib/atomic'
import { stripBase } from '../lib/base'
import { groupEntries, matchesEntry } from '../lib/catalog'
import { FilterInput, NAV_ROW, NothingMatches } from './nav-ui'

/**
 * The section sidebar for a reference level: every entry filed under it,
 * grouped, with a filter.
 *
 * It lives inside those routes rather than in the site shell, because the shell
 * is on every route and this index is ~4 kB gzipped that only a reference page
 * can use.
 *
 * `level` is the only difference between the four sidebars — same filter, same
 * grouping, same active state. Which entries belong to a level is the
 * registry's `atomic` field, not a package check.
 */
export function ComponentNav(props: { level: AtomicLevel }): JSX.Element {
  const location = useLocation()
  const meta = () => ATOMIC[props.level]
  const [query, setQuery] = createSignal('')

  const visible = createMemo(() =>
    COMPONENTS.filter((entry) => entry.shipped && entry.atomic === props.level)
      .filter((entry) => matchesEntry(entry, query()))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name)),
  )

  const grouped = createMemo(() => groupEntries(visible(), GROUPS))
  const current = () => stripBase(location.pathname).split('/')[2] ?? ''

  return (
    <nav aria-label={meta().label} class="flex flex-col gap-4">
      <FilterInput
        label="Filter"
        placeholder="Filter…"
        value={query()}
        onInput={setQuery}
      />

      <ul class="flex flex-col gap-0.5">
        <li>
          <A
            href={meta().href}
            aria-current={
              stripBase(location.pathname) === meta().href ? 'page' : undefined
            }
            class={NAV_ROW}
          >
            All {meta().label.toLowerCase()}
          </A>
        </li>
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
                        href={`${meta().href}/${entry.slug}`}
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
