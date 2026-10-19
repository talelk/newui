import { A, useLocation, useNavigate } from '@solidjs/router'
import { createMemo, createSignal, For, type JSX, Show } from 'solid-js'
import { NAV, SECTION_ICONS, sectionFor } from './nav'
import { FilterInput, NAV_ROW, NothingMatches } from './nav-ui'

/**
 * The site's navigation.
 *
 * Markup, not the library's `Sidebar` — and that is a budget decision, not an
 * oversight: the shell renders on *every* route, so the parts it uses are paid
 * for by the home page. `routes.test.ts` pins it (`keeps visual components out
 * of the shared shell`); the library's sidebar, with its rail, tooltips and
 * machines, is what an app composes. What is shared between the two is the
 * design, not the code: same 8px rows, same icon-then-label shape, same
 * quiet-suffix counts.
 */

export function SidebarNav(props: {
  context?: () => JSX.Element
  /** The rail: icons only. Nothing but the section rows is drawn. */
  collapsed?: boolean
}): JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = createSignal('')
  const [expanded, setExpanded] = createSignal<string[]>(['Overview'])

  const current = () => sectionFor(location.pathname)
  const searching = () => query().trim() !== ''
  const results = createMemo(() => {
    const needle = query().trim().toLowerCase()
    return NAV.map((section) => ({
      section,
      items: section.items.filter(
        (item) =>
          item.title.toLowerCase().includes(needle) ||
          (item.description ?? '').toLowerCase().includes(needle),
      ),
    })).filter((entry) => entry.items.length > 0)
  })

  const isOpen = (title: string) =>
    searching() || expanded().includes(title) || current()?.title === title

  const toggle = (title: string) =>
    setExpanded((open) =>
      open.includes(title)
        ? open.filter((entry) => entry !== title)
        : [...open, title],
    )

  /** The filter is redundant where the section ships its own. */
  const showFilter = () => !hasContext(current()?.title ?? '')

  const hasContext = (title: string) =>
    !!props.context &&
    ['Components', 'Blocks', 'Charts', 'Editors'].includes(title)

  return (
    <>
      {/* One search per sidebar. The registry sections (Components, Blocks,
          Charts, Editors) bring their own filter for their own names, and two
          fields stacked in one column is a question the reader has to answer
          before they can type. */}
      <div
        class="mx-2 mb-1"
        hidden={showFilter() === false || props.collapsed === true}
      >
        <FilterInput
          label="Filter pages"
          placeholder="Filter pages"
          value={query()}
          onInput={setQuery}
        />
      </div>

      <Show
        when={!searching()}
        fallback={
          <div class="flex flex-col gap-3 px-2 pb-6">
            <For each={results()} fallback={<NothingMatches query={query()} />}>
              {(entry) => (
                <div class="flex flex-col gap-0.5">
                  <span class="px-2 pt-1 text-xs-medium text-ink-gray-7">
                    {entry.section.title}
                  </span>
                  <For each={entry.items}>
                    {(item) => <NavLink item={item} />}
                  </For>
                </div>
              )}
            </For>
          </div>
        }
      >
        <nav aria-label="Documentation" class="flex flex-col gap-0.5 px-2 pb-6">
          <For each={NAV}>
            {(section) => (
              <div class="flex flex-col gap-0.5">
                <button
                  type="button"
                  aria-expanded={isOpen(section.title)}
                  onClick={() => {
                    toggle(section.title)
                    navigate(section.items[0]?.href ?? '/')
                  }}
                  data-navigates=""
                  title={props.collapsed ? section.title : undefined}
                  aria-label={props.collapsed ? section.title : undefined}
                  class={`${NAV_ROW} w-full text-start`}
                  classList={{
                    'justify-center px-0': props.collapsed === true,
                  }}
                  aria-current={
                    current()?.title === section.title ? 'true' : undefined
                  }
                >
                  <span
                    aria-hidden="true"
                    class={`${SECTION_ICONS[section.title] ?? 'lucide-circle'} size-4 shrink-0`}
                  />
                  <Show when={!props.collapsed}>
                    <span class="min-w-0 flex-1 truncate">
                      {section.title === 'Internals'
                        ? 'Developer'
                        : section.title}
                    </span>
                    <span
                      aria-hidden="true"
                      class={`${isOpen(section.title) ? 'lucide-chevron-down' : 'lucide-chevron-right'} size-3.5 shrink-0 text-ink-gray-7`}
                    />
                  </Show>
                </button>

                <Show when={isOpen(section.title) && !props.collapsed}>
                  <div class="flex flex-col gap-0.5 ps-3.5">
                    <Show
                      when={hasContext(section.title)}
                      fallback={
                        <For each={section.items}>
                          {(item) => <NavLink item={item} />}
                        </For>
                      }
                    >
                      {props.context?.()}
                    </Show>
                  </div>
                </Show>
              </div>
            )}
          </For>
        </nav>
      </Show>
    </>
  )
}

/** Leaf rows are links: they are destinations, and a new tab should work. */
function NavLink(props: {
  item: { title: string; href: string; status?: 'new' | 'beta' }
}): JSX.Element {
  const location = useLocation()
  return (
    <A
      href={props.item.href}
      aria-current={location.pathname === props.item.href ? 'page' : undefined}
      class={NAV_ROW}
    >
      <span class="min-w-0 flex-1 truncate">{props.item.title}</span>
      <Show when={props.item.status}>
        {(status) => (
          <span class="shrink-0 rounded-3 bg-surface-gray-3 px-1 text-xs text-ink-gray-7">
            {status()}
          </span>
        )}
      </Show>
    </A>
  )
}
