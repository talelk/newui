import { A, useLocation, useNavigate } from '@solidjs/router'
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  type JSX,
  on,
  Show,
} from 'solid-js'
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
 *
 * The sections are the ladder (ADR-0012) in reading order. Three details make
 * that legible rather than merely true: the registry count on each level, the
 * current level opened on arrival, and a level's own index replacing the site
 * tree once a reference section supplies one.
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

  // Arriving in a section opens it; leaving it does not close it, so the
  // reader's own folds survive navigation. Crucially this reacts to the
  // *pathname*, not to `expanded` — otherwise folding the section you are in
  // would immediately reopen it, and a section could never be closed.
  createEffect(
    on(
      () => location.pathname,
      () => {
        const title = current()?.title
        if (title)
          setExpanded((open) =>
            open.includes(title) ? open : [...open, title],
          )
      },
    ),
  )

  const isOpen = (title: string) => searching() || expanded().includes(title)

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
    ['Components', 'Blocks', 'Layouts', 'Charts', 'Editors'].includes(title)

  return (
    <>
      {/* One search per sidebar. The registry sections (Components, Blocks,
          Layouts, Charts, Editors) bring their own filter for their own names,
          and two fields stacked in one column is a question the reader has to
          answer before they can type. */}
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
                  aria-expanded={
                    props.collapsed ? undefined : isOpen(section.title)
                  }
                  onClick={() => {
                    // Opening a level takes you into it; closing it only
                    // closes it. (The row used to do both, so folding the
                    // section you were reading also navigated away.)
                    if (!isOpen(section.title))
                      navigate(section.items[0]?.href ?? '/')
                    toggle(section.title)
                  }}
                  data-navigates=""
                  data-active={
                    current()?.title === section.title ? '' : undefined
                  }
                  title={props.collapsed ? section.title : undefined}
                  aria-label={props.collapsed ? section.title : undefined}
                  aria-current={
                    props.collapsed && current()?.title === section.title
                      ? 'true'
                      : undefined
                  }
                  class={`${NAV_ROW} w-full text-start data-[active]:bg-surface-gray-2 data-[active]:text-ink-gray-9`}
                  classList={{
                    'justify-center px-0': props.collapsed === true,
                  }}
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
                    <Show when={section.count}>
                      {(count) => (
                        <span
                          aria-hidden="true"
                          class="shrink-0 text-xs tabular-nums text-ink-gray-6"
                        >
                          {count()}
                        </span>
                      )}
                    </Show>
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
