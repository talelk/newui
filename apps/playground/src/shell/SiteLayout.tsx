import { Icon } from '@newui/ui'
import { A, type RouteSectionProps, useLocation } from '@solidjs/router'
import { type JSX, Show } from 'solid-js'
import { Masthead } from './Masthead'
import { siblingsFor } from './nav'
import { SidebarNav } from './SidebarNav'

/**
 * A page arrow. `Icon` rather than raw `<span class="lucide-*">` because the
 * description line needs to wrap beside it without the glyph stretching.
 */
function Arrow(props: { icon: string; class?: string }): JSX.Element {
  return <Icon icon={props.icon} class={props.class} />
}

function PrevNext(): JSX.Element {
  const location = useLocation()
  const siblings = () => siblingsFor(location.pathname)

  return (
    <div class="mt-16 grid gap-3 border-t border-outline-gray-1 pt-6 sm:grid-cols-2">
      <Show when={siblings().previous}>
        {(previous) => (
          <A
            href={previous().href}
            class="group flex min-w-0 flex-col gap-0.5 rounded-5 border border-outline-gray-2 px-4 py-3 transition-colors hover:border-outline-gray-3 hover:bg-surface-gray-2 focus-visible:focus-ring"
          >
            <span class="flex items-center gap-1 text-xs text-ink-gray-5">
              <Arrow icon="lucide-arrow-left" class="size-3" />
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
              <Arrow icon="lucide-arrow-right" class="size-3" />
            </span>
            <span class="truncate text-base-medium text-ink-gray-9">
              {next().title}
            </span>
          </A>
        )}
      </Show>
    </div>
  )
}

/**
 * The documentation frame: masthead, section sidebar, content column and the
 * prev/next footer.
 *
 * The sidebar is part of the document grid (not fixed) so the page has a single
 * scrollbar: on a short page the nav scrolls away with the content, on a long
 * one it sticks. Routes that must not have chrome — the docs embed, the
 * deterministic harness page, the full-screen mobile recipe — live outside this
 * layout and render `BareLayout` instead.
 *
 * Nested content arrives as `props.children`: @solidjs/router v1 removed
 * `<Outlet>` in favour of the section component receiving its child route.
 */
export function SiteLayout(props: RouteSectionProps): JSX.Element {
  return (
    <div class="min-h-screen bg-surface-base text-ink-gray-9">
      <Masthead />
      <div class="mx-auto flex max-w-[1400px] gap-8 px-4 py-8 sm:px-6">
        <aside class="sticky top-12 hidden h-[calc(100dvh-3rem)] w-56 shrink-0 overflow-y-auto pb-10 lg:block">
          <SidebarNav />
        </aside>
        <main class="min-w-0 flex-1">
          {props.children}
          <PrevNext />
        </main>
      </div>
    </div>
  )
}

/**
 * Routes with no site chrome: no masthead, no sidebar, no prev/next. A
 * pass-through on purpose — each of these pages already owns its full-viewport
 * container (the mobile recipe is `fixed inset-0`, the docs embed and the
 * harness page bring their own `min-h-screen`), so adding a wrapper here would
 * only stack a second full-height box whose background can disagree.
 */
export function BareLayout(props: RouteSectionProps): JSX.Element {
  // A fragment, not a bare `props.children`: the rule is right that returning
  // the accessor directly reads it outside a tracked scope.
  return <>{props.children}</>
}
