import { A, type RouteSectionProps, useLocation } from '@solidjs/router'
import {
  createContext,
  createSignal,
  type JSX,
  onCleanup,
  onMount,
  Show,
  useContext,
} from 'solid-js'
import { BASE_PATH, stripBase } from '../lib/base'
import { Masthead } from './Masthead'
import { modalKeyDown } from './modal'
import type { NavItem } from './nav'
import { siblingsFor } from './nav'
import { SidebarNav } from './SidebarNav'

/**
 * The site frame: masthead, one section sidebar, the content column and the
 * prev/next footer.
 *
 * The sidebar is a slot because a section can bring its own. `/atoms/*`
 * renders `ComponentNav` — the full index, filter included — while everything
 * else renders the site tree. Only the components routes import the index, so
 * the home page does not pay for a list it never shows.
 *
 * The sidebar is part of the document grid rather than `fixed`, so the page has
 * one scrollbar: on a short page the nav scrolls away with the content, on a long
 * one it sticks.
 */
/**
 * The channel a page uses to supply its own "On this page" column.
 *
 * A route page cannot pass props up to its layout, so the layout holds a
 * slot and the page registers a thunk into it. The element itself is
 * constructed in the lazy page chunk — the shell only stores and calls the
 * thunk, so no component import enters the shell. A page-supplied TOC wins
 * over a layout-supplied one: the page knows its own headings.
 */
const TocContext = createContext<{
  register: (toc: () => JSX.Element) => () => void
}>()

/** Register this page's table of contents with the surrounding layout. */
export function usePageToc(toc: () => JSX.Element): void {
  const context = useContext(TocContext)
  if (!context) return
  onCleanup(context.register(toc))
}

export function Chrome(
  props: RouteSectionProps & {
    sidebar?: () => JSX.Element
    siblings?: NavItem[]
    /** The right-hand "On this page" column, `xl:` only. Rendered only when a layout supplies it. */
    toc?: () => JSX.Element
  },
): JSX.Element {
  const location = useLocation()
  const [collapsed, setCollapsed] = createSignal(false)
  const [pageToc, setPageToc] = createSignal<(() => JSX.Element) | undefined>(
    undefined,
  )
  const toc = () => pageToc() ?? props.toc
  const tocChannel = {
    register: (next: () => JSX.Element) => {
      setPageToc(() => next)
      return () => setPageToc(undefined)
    },
  }
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
    const shortcut = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'b') return
      if (!event.metaKey && !event.ctrlKey) return
      event.preventDefault()
      persist(!collapsed())
    }
    window.addEventListener('keydown', shortcut)
    onCleanup(() => {
      media.removeEventListener('change', close)
      window.removeEventListener('keydown', shortcut)
    })
  })
  /** Every path that folds the sidebar — the trigger, ⌘B — ends up here. */
  function persist(next: boolean) {
    setCollapsed(next)
    try {
      localStorage.setItem('newui-sidebar-collapsed', String(next))
    } catch {
      /* Storage is optional. */
    }
  }
  return (
    <TocContext.Provider value={tocChannel}>
      <div class="min-h-screen bg-surface-base text-ink-gray-9">
        <a href="#site-content" class="sr-only focus:not-sr-only">
          Skip to content
        </a>
        <Masthead
          title={
            props.siblings?.find(
              (item) => item.href === stripBase(location.pathname),
            )?.title
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
            class="sticky top-12 hidden h-[calc(100dvh-3rem)] shrink-0 flex-col overflow-hidden border-e border-outline-gray-1 lg:flex"
            classList={{ 'w-56': !collapsed(), 'w-12': collapsed() }}
          >
            <div class="flex h-9 shrink-0 items-center justify-between gap-1 ps-3 pe-1">
              <Show when={!collapsed()}>
                <span class="text-sm-medium text-ink-gray-7">
                  Documentation
                </span>
              </Show>
              <button
                type="button"
                aria-label={collapsed() ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-expanded={!collapsed()}
                onClick={() => persist(!collapsed())}
                class="ms-auto grid size-7 shrink-0 place-items-center rounded-3 text-ink-gray-6 hover:bg-surface-gray-2 hover:text-ink-gray-9 focus-visible:focus-ring"
              >
                <span
                  aria-hidden="true"
                  classList={{
                    'lucide-panel-left': true,
                    'size-4': true,
                    'rotate-180': collapsed(),
                  }}
                />
              </button>
            </div>
            <div class="min-h-0 flex-1 overflow-y-auto pb-4">
              <SidebarNav collapsed={collapsed()} context={props.sidebar} />
            </div>
          </aside>
          <main
            id="site-content"
            class="mx-auto min-w-0 max-w-[1440px] flex-1 px-4 py-6 lg:px-6"
          >
            <Show when={toc()}>
              {(activeToc) => (
                <details class="mb-6 rounded-card border border-outline-gray-1 bg-surface-elevation-1 px-3 py-2 xl:hidden">
                  <summary class="flex min-h-10 cursor-pointer items-center rounded-3 text-interface font-medium text-ink-gray-8 focus-visible:focus-ring">
                    On this page
                  </summary>
                  <div class="pb-2">{activeToc()()}</div>
                </details>
              )}
            </Show>
            {props.children}
            <PrevNext items={props.siblings} />
          </main>
          <Show when={toc()}>
            {(activeToc) => (
              <aside
                aria-label="On this page"
                class="sticky top-12 hidden h-[calc(100dvh-3rem)] w-56 shrink-0 overflow-y-auto px-4 py-6 xl:block"
              >
                {activeToc()()}
              </aside>
            )}
          </Show>
        </div>
        <dialog
          onKeyDown={modalKeyDown}
          ref={drawer}
          aria-label="Documentation navigation"
          onClose={() => menuButton?.focus()}
          onClick={(event) => {
            if (
              event.target === drawer ||
              (event.target as Element).closest('a, [data-navigates]')
            )
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
          {/* The drawer is never a rail: the desktop fold is a preference
              about a column beside the content, and a drawer of bare icons is
              no navigation at all. Passing `collapsed` here made the mobile
              menu inherit a desktop choice the reader cannot see the control
              for. */}
          <SidebarNav context={props.sidebar} />
        </dialog>
      </div>
    </TocContext.Provider>
  )
}

/** A page arrow, sized so the description line wraps beside it. */
function Arrow(props: { icon: string }): JSX.Element {
  return <span aria-hidden="true" class={`${props.icon} size-3`} />
}

function PrevNext(props: { items?: NavItem[] }): JSX.Element {
  const location = useLocation()
  const siblings = () => siblingsFor(stripBase(location.pathname), props.items)

  return (
    <Show when={siblings().previous || siblings().next}>
      <nav
        aria-label="More pages"
        class="mt-10 flex justify-between gap-3 border-t border-outline-gray-1 pt-6"
      >
        <Show when={siblings().previous}>
          {(previous) => (
            <A
              href={previous().href}
              class="flex min-w-0 flex-col gap-1 rounded-4 px-3 py-2 transition-colors hover:bg-surface-gray-2 focus-visible:focus-ring motion-reduce:transition-none"
            >
              <span class="flex items-center gap-1 text-caption text-ink-gray-7">
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
              class="ms-auto flex min-w-0 flex-col items-end gap-1 rounded-4 px-3 py-2 text-end transition-colors hover:bg-surface-gray-2 focus-visible:focus-ring motion-reduce:transition-none"
            >
              <span class="flex items-center gap-1 text-caption text-ink-gray-7">
                Next
                <Arrow icon="lucide-arrow-right" />
              </span>
              <span class="truncate text-base-medium text-ink-gray-9">
                {next().title}
              </span>
            </A>
          )}
        </Show>
      </nav>
    </Show>
  )
}

/** The documentation frame: the site tree in the sidebar. */
export function SiteLayout(
  props: RouteSectionProps & { toc?: () => JSX.Element },
): JSX.Element {
  return <Chrome {...props} toc={props.toc} />
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
        /\/fullscreen(?:$|\?)/.test(url.pathname)
      )
        return
      const path = url.pathname.startsWith(BASE_PATH)
        ? url.pathname.slice(BASE_PATH.length) || '/'
        : url.pathname
      if (
        !/^\/(?:$|docs(?:\/|$)|foundations(?:\/|$)|architecture(?:\/|$)|components(?:\/|$)|blocks(?:\/|$)|layouts(?:\/|$)|charts(?:\/|$)|editors(?:\/|$)|examples(?:\/|$))/.test(
          path,
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
