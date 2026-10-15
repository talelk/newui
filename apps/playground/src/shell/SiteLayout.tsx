import { A, type RouteSectionProps, useLocation } from '@solidjs/router'
import { createSignal, type JSX, onCleanup, onMount, Show } from 'solid-js'
import { Masthead } from './Masthead'
import { modalKeyDown } from './modal'
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
  props: RouteSectionProps & {
    sidebar?: () => JSX.Element
    siblings?: NavItem[]
  },
): JSX.Element {
  const location = useLocation()
  const [collapsed, setCollapsed] = createSignal(false)
  let drawer: HTMLDialogElement | undefined
  let menuButton: HTMLButtonElement | undefined
  onMount(() => {
    try {
      setCollapsed(localStorage.getItem('newui-sidebar-collapsed') === 'true')
    } catch {
      /* Storage is optional. */
    }
    const media = matchMedia('(min-width: 1024px)')
    const close = () => {
      if (media.matches) drawer?.close()
    }
    media.addEventListener('change', close)
    onCleanup(() => media.removeEventListener('change', close))
  })
  function collapse() {
    setCollapsed(!collapsed())
    try {
      localStorage.setItem('newui-sidebar-collapsed', String(collapsed()))
    } catch {
      /* Storage is optional. */
    }
  }
  return (
    <div class="min-h-screen bg-surface-base text-ink-gray-9">
      <a href="#site-content" class="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <Masthead
        title={
          props.siblings?.find((item) => item.href === location.pathname)?.title
        }
        menuRef={(element) => {
          menuButton = element
        }}
        onMenu={() => drawer?.showModal()}
      />
      <div class="flex">
        <aside
          data-slot="site-sidebar"
          data-collapsed={collapsed()}
          class="sticky top-12 hidden h-[calc(100dvh-3rem)] shrink-0 overflow-y-auto border-e border-outline-gray-1 p-2 lg:block"
          classList={{ 'w-56': !collapsed(), 'w-12': collapsed() }}
        >
          <button
            type="button"
            aria-label={collapsed() ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed()}
            onClick={collapse}
            class="mb-2 grid size-8 place-items-center rounded-3 text-ink-gray-6 hover:bg-surface-gray-2 focus-visible:focus-ring"
          >
            <span aria-hidden="true" class="lucide-panel-left size-4" />
          </button>
          <SidebarNav collapsed={collapsed()} context={props.sidebar} />
        </aside>
        <main
          id="site-content"
          class="mx-auto min-w-0 max-w-[1440px] flex-1 p-4 lg:p-6"
        >
          {props.children}
          <PrevNext items={props.siblings} />
        </main>
      </div>
      <dialog
        onKeyDown={modalKeyDown}
        ref={drawer}
        aria-label="Documentation navigation"
        onClose={() => menuButton?.focus()}
        onClick={(event) => {
          if (event.target === drawer || (event.target as Element).closest('a'))
            drawer?.close()
        }}
        class="site-drawer fixed inset-y-0 start-0 m-0 h-dvh max-h-none w-72 max-w-[calc(100vw-2rem)] overflow-y-auto border-e border-outline-gray-1 bg-surface-base p-3 text-ink-gray-9 backdrop:bg-surface-gray-7/50"
      >
        <button
          type="button"
          autofocus
          onClick={() => drawer?.close()}
          aria-label="Close navigation"
          class="mb-3 grid size-10 place-items-center rounded-3 focus-visible:focus-ring"
        >
          <span aria-hidden="true" class="lucide-x size-4" />
        </button>
        <SidebarNav context={props.sidebar} />
      </dialog>
    </div>
  )
}

/** A page arrow, sized so the description line wraps beside it. */
function Arrow(props: { icon: string }): JSX.Element {
  return <span aria-hidden="true" class={`${props.icon} size-3`} />
}

function PrevNext(props: { items?: NavItem[] }): JSX.Element {
  const location = useLocation()
  const siblings = () => siblingsFor(location.pathname, props.items)

  return (
    <Show when={siblings().previous || siblings().next}>
      <div class="mt-6 flex justify-between gap-3 border-t border-outline-gray-1 pt-3">
        <Show when={siblings().previous}>
          {(previous) => (
            <A
              href={previous().href}
              class="group flex min-w-0 items-center gap-2 rounded-3 px-2 py-1 text-interface hover:bg-surface-gray-2 focus-visible:focus-ring"
            >
              <span class="flex items-center gap-1 text-xs text-ink-gray-6">
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
              class="group ms-auto flex min-w-0 items-center gap-2 rounded-3 px-2 py-1 text-interface hover:bg-surface-gray-2 focus-visible:focus-ring"
            >
              <span class="flex items-center gap-1 text-xs text-ink-gray-6">
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
  return <Chrome {...props} />
}

/**
 * Routes with no site chrome: no masthead, no sidebar, no prev/next. A
 * pass-through on purpose — each of these pages already owns its full-viewport
 * container (the mobile recipe is `fixed inset-0`, the docs embed and the
 * harness page bring their own `min-h-screen`), so adding a wrapper here would
 * only stack a second full-height box whose background can disagree.
 */
export function BareLayout(props: RouteSectionProps): JSX.Element {
  onMount(() => {
    if (window.parent === window) return
    const navigateHost = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      const anchor = (event.target as Element).closest<HTMLAnchorElement>(
        'a[href]',
      )
      if (
        !anchor ||
        anchor.hasAttribute('download') ||
        anchor.target === '_blank'
      )
        return
      const href = anchor.getAttribute('href') ?? ''
      if (href.startsWith('#')) return
      const url = new URL(anchor.href, location.href)
      if (
        url.origin !== location.origin ||
        /\/(fullscreen|play)(?:$|\?)/.test(url.pathname)
      )
        return
      if (
        !/^\/(?:$|docs(?:\/|$)|foundations(?:\/|$)|components(?:\/|$)|blocks(?:\/|$)|charts(?:\/|$)|editors(?:\/|$)|examples(?:\/|$))/.test(
          url.pathname,
        )
      )
        return
      event.preventDefault()
      event.stopPropagation()
      window.parent.location.assign(url.href)
    }
    document.addEventListener('click', navigateHost, true)
    onCleanup(() => document.removeEventListener('click', navigateHost, true))
  })
  return <>{props.children}</>
}
