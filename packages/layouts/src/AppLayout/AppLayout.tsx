import {
  type BreadcrumbItem,
  Breadcrumbs,
  cn,
  PageHeaderMobile,
  ResponsiveShell,
  ResponsiveShellMenu,
  Sidebar,
  SidebarCollapseToggle,
} from '@newui/ui'
import { createSignal, type JSX, onCleanup, onMount, Show } from 'solid-js'

/**
 * The application frame: a rail, a navigation column, a title block, and a
 * content area that scrolls inside the viewport rather than with it.
 *
 * This is the shape the example applications were each writing by hand — a
 * masthead, a sidebar that becomes a drawer, a page title with its actions, a
 * footer — with the differences being only what the *app* puts in the slots.
 * `ResponsiveShell` picks the frame; `AppLayout` says what goes where in it.
 *
 * **The slots are the API.** A layout that decided the brand, the header
 * controls or the footer would be an application, not a template: those are the
 * three things two apps never agree on. What they do agree on is the order —
 * breadcrumbs, title, description, actions — and that the content scrolls under
 * a header that does not.
 */

export interface AppLayoutProps {
  /** The page's own title. Rendered as the document's `h1`. */
  title: JSX.Element
  /** A muted line under the title: what this screen is for. */
  description?: JSX.Element
  /** The trail above the title. Omitted → no trail, and no reserved space. */
  breadcrumbs?: BreadcrumbItem[]
  /** The small line above the title, when a trail would be too much. */
  eyebrow?: JSX.Element
  /** Trailing controls of the title block, usually the primary action. */
  actions?: JSX.Element
  /** The narrow icon strip on the far left. */
  rail?: JSX.Element
  /** The navigation column. Docked beside the content, a drawer on a phone. */
  sidebar?: JSX.Element
  /** Pinned to the foot of the navigation column: a fold control, a link. */
  sidebarFooter?: JSX.Element
  /**
   * Let the navigation column fold to an icon rail. Default `true`; the fold is
   * offered only while docked, because a drawer of bare icons is no navigation.
   */
  foldable?: boolean
  /** Drawn at the start of the desktop header. */
  brand?: JSX.Element
  /** Trailing header controls: a colour scheme, an account. */
  headerActions?: JSX.Element
  /** The bar title on a phone. Defaults to `eyebrow`, then the breadcrumb. */
  mobileTitle?: JSX.Element
  /** Below the content, inside the scroller. */
  footer?: JSX.Element
  /** Accessible name of the navigation landmarks. */
  navLabel?: string
  class?: string
  children: JSX.Element
}

const DOCKED = '(min-width: 1024px)'

export function AppLayout(props: AppLayoutProps): JSX.Element {
  // Folded only while docked: below the breakpoint the same node is the drawer's
  // body, and a drawer of icon rails is no navigation at all.
  const [collapsed, setCollapsed] = createSignal(false)
  const [docked, setDocked] = createSignal(false)
  onMount(() => {
    const media = matchMedia(DOCKED)
    const sync = () => setDocked(media.matches)
    sync()
    media.addEventListener('change', sync)
    onCleanup(() => media.removeEventListener('change', sync))
  })
  const folded = () => docked() && collapsed()
  const foldable = () => props.foldable !== false

  const trailing = () =>
    props.mobileTitle ?? props.eyebrow ?? props.breadcrumbs?.at(-1)?.label

  return (
    <ResponsiveShell
      class={cn(
        'h-dvh bg-surface-gray-1 text-interface text-ink-gray-9',
        props.class,
      )}
      title={trailing()}
      label={props.navLabel ?? 'Navigation'}
      rail={
        <Show when={props.rail}>
          {/* The rail is a plain column (as in frappe-ui); the frame gives it
              its landmark so every item sits inside one. */}
          <nav aria-label="Apps" class="h-full shrink-0">
            {props.rail}
          </nav>
        </Show>
      }
      // A page with no navigation gets no column, no drawer and no menu button:
      // a sliver of empty sidebar is worse than none.
      sidebar={
        props.sidebar ? (
          <div
            class={cn(
              'flex min-h-0 min-w-0 flex-1 flex-col border-e border-outline-gray-1 bg-surface-sidebar p-3',
              'transition-[width] duration-300 ease-in-out motion-reduce:transition-none lg:flex-none',
              folded() ? 'lg:w-[4.5rem]' : 'lg:w-52',
            )}
          >
            <Sidebar
              ariaLabel={props.navLabel ?? 'Navigation'}
              width="100%"
              collapsedWidth="100%"
              collapsed={folded()}
              onCollapsedChange={setCollapsed}
              class="min-h-0 bg-surface-sidebar"
            >
              {props.sidebar}
              <div class="mt-auto flex shrink-0 flex-col pt-2">
                <Show when={foldable()}>
                  <div class="hidden lg:block">
                    <SidebarCollapseToggle />
                  </div>
                </Show>
                <Show when={props.sidebarFooter && !folded()}>
                  <div class="mt-1">{props.sidebarFooter}</div>
                </Show>
              </div>
            </Sidebar>
          </div>
        ) : undefined
      }
      header={
        <header class="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-outline-gray-1 bg-surface-elevation-1 px-4">
          <div class="flex min-w-0 items-center gap-2">{props.brand}</div>
          <div class="flex max-w-full flex-wrap items-center gap-2">
            {props.headerActions}
          </div>
        </header>
      }
      mobileHeader={
        <PageHeaderMobile
          title={trailing()}
          // The bar names the place; the page's own title below is the
          // document's `h1`. Two of them is one too many.
          titleAs="span"
          prefix={
            props.sidebar ? (
              <ResponsiveShellMenu label="Toggle workspace navigation" />
            ) : undefined
          }
          suffix={props.headerActions}
        />
      }
    >
      <main
        id="workspace-content"
        class="mx-auto flex w-full max-w-[1440px] flex-col gap-4 p-3 pb-24 sm:pb-8 md:p-4"
      >
        <a href="#workspace-content" class="sr-only focus:not-sr-only">
          Skip to workspace
        </a>
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div class="min-w-0">
            <Show when={props.breadcrumbs}>
              {(crumbs) => <Breadcrumbs items={crumbs()} />}
            </Show>
            <Show when={!props.breadcrumbs && props.eyebrow}>
              <p class="mb-1 text-caption text-ink-gray-6">{props.eyebrow}</p>
            </Show>
            <h1 class="mt-1 text-heading">{props.title}</h1>
            <Show when={props.description}>
              <p class="mt-2 max-w-2xl text-ink-gray-7">{props.description}</p>
            </Show>
          </div>
          <Show when={props.actions}>
            <div class="flex flex-wrap items-center gap-2">{props.actions}</div>
          </Show>
        </div>
        {props.children}
        <Show when={props.footer}>{props.footer}</Show>
      </main>
    </ResponsiveShell>
  )
}
