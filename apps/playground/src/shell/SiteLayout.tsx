import { Icon } from '@newui/ui'
import { A, type RouteSectionProps, useLocation } from '@solidjs/router'
import { type JSX, Show } from 'solid-js'
import { COMPONENTS } from '../generated/components'
import { ComponentNav, OVERVIEW } from './ComponentNav'
import { Masthead } from './Masthead'
import type { NavItem } from './nav'
import { siblingsFor } from './nav'
import { SidebarNav } from './SidebarNav'

/**
 * The site frame: masthead, one section sidebar, the content column and the
 * prev/next footer.
 *
 * The sidebar is a slot because a section can bring its own. `/components/*`
 * renders `ComponentNav` — the full index, filter included — while everything
 * else renders the site tree. Only the components routes import the index, so
 * the home page does not pay for a list it never shows.
 *
 * The sidebar is part of the document grid rather than `fixed`, so the page has
 * one scrollbar: on a short page the nav scrolls away with the content, on a long
 * one it sticks.
 */
export function Chrome(
  props: RouteSectionProps & { sidebar: JSX.Element; siblings?: NavItem[] },
): JSX.Element {
  return (
    <div class="min-h-screen bg-surface-base text-ink-gray-9">
      <Masthead />
      <div class="mx-auto flex max-w-[1400px] gap-8 px-4 py-8 sm:px-6">
        <aside class="sticky top-12 hidden h-[calc(100dvh-3rem)] w-56 shrink-0 overflow-y-auto pb-10 lg:block">
          {props.sidebar}
        </aside>
        <main class="min-w-0 flex-1">
          {props.children}
          <PrevNext items={props.siblings} />
        </main>
      </div>
    </div>
  )
}

/** A page arrow, sized so the description line wraps beside it. */
function Arrow(props: { icon: string }): JSX.Element {
  return <Icon icon={props.icon} class="size-3" />
}

function PrevNext(props: { items?: NavItem[] }): JSX.Element {
  const location = useLocation()
  const siblings = () => siblingsFor(location.pathname, props.items)

  return (
    <Show when={siblings().previous || siblings().next}>
      <div class="mt-16 grid gap-3 border-t border-outline-gray-1 pt-6 sm:grid-cols-2">
        <Show when={siblings().previous}>
          {(previous) => (
            <A
              href={previous().href}
              class="group flex min-w-0 flex-col gap-0.5 rounded-5 border border-outline-gray-2 px-4 py-3 transition-colors hover:border-outline-gray-3 hover:bg-surface-gray-2 focus-visible:focus-ring"
            >
              <span class="flex items-center gap-1 text-xs text-ink-gray-5">
                <Arrow icon="lucide-arrow-left" />
                Previous
              </span>
              <span class="truncate text-base-medium text-ink-gray-9">
                {previous().title}
              </span>
            </A>
          )}
        </Show>
        <Show when={siblings().next}>
          {(next) => (
            <A
              href={next().href}
              class="group flex min-w-0 flex-col items-end gap-0.5 rounded-5 border border-outline-gray-2 px-4 py-3 text-end transition-colors hover:border-outline-gray-3 hover:bg-surface-gray-2 focus-visible:focus-ring sm:col-start-2"
            >
              <span class="flex items-center gap-1 text-xs text-ink-gray-5">
                Next
                <Arrow icon="lucide-arrow-right" />
              </span>
              <span class="truncate text-base-medium text-ink-gray-9">
                {next().title}
              </span>
            </A>
          )}
        </Show>
      </div>
    </Show>
  )
}

/** The documentation frame: the site tree in the sidebar. */
export function SiteLayout(props: RouteSectionProps): JSX.Element {
  return <Chrome {...props} sidebar={<SidebarNav />} />
}

/**
 * A reference section's frame: its own index in the sidebar, and a prev/next
 * that walks that section's list rather than dropping the reader back into the
 * site tree.
 */
function ReferenceLayout(
  props: RouteSectionProps & { kind: 'component' | 'block' },
): JSX.Element {
  const base = () => (props.kind === 'block' ? '/blocks' : '/components')
  const siblings = (): NavItem[] => [
    ...OVERVIEW[props.kind].map((item) => ({
      title: item.title,
      href: item.href,
    })),
    ...COMPONENTS.filter((entry) => entry.shipped && entry.kind === props.kind)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((entry) => ({
        title: entry.name,
        href: `${base()}/${entry.slug}`,
      })),
  ]

  return (
    <Chrome
      {...props}
      sidebar={<ComponentNav kind={props.kind} />}
      siblings={siblings()}
    />
  )
}

/** The components frame. */
export function ComponentsLayout(props: RouteSectionProps): JSX.Element {
  return <ReferenceLayout {...props} kind="component" />
}

/** The blocks frame. */
export function BlocksLayout(props: RouteSectionProps): JSX.Element {
  return <ReferenceLayout {...props} kind="block" />
}

/**
 * Routes with no site chrome: no masthead, no sidebar, no prev/next. A
 * pass-through on purpose — each of these pages already owns its full-viewport
 * container (the mobile recipe is `fixed inset-0`, the docs embed and the
 * harness page bring their own `min-h-screen`), so adding a wrapper here would
 * only stack a second full-height box whose background can disagree.
 */
export function BareLayout(props: RouteSectionProps): JSX.Element {
  // A fragment, not a bare `props.children`: returning the accessor directly
  // reads it outside a tracked scope.
  return <>{props.children}</>
}
