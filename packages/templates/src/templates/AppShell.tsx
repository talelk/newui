import {
  Button,
  createMediaQuery,
  UIProvider,
  useUI,
} from '@talelk/newui-atoms'
import { closeDialog, showDialog } from '@talelk/newui-atoms/internal'
import { type BreadcrumbItem, Breadcrumbs } from '@talelk/newui-molecules'
import { AppSidebar, type AppSidebarGroup } from '@talelk/newui-organisms'
import {
  createEffect,
  createSignal,
  type JSX,
  onCleanup,
  onMount,
  Show,
} from 'solid-js'

/**
 * The one application frame: a single, responsive, multi-section sidebar and
 * the page it opens. There is no separate app rail and no second mobile shell.
 *
 * At desktop width the sidebar docks and can collapse to icons. On a narrow
 * viewport the same sidebar becomes an expanded modal drawer; selection closes
 * it and focus returns to the menu trigger. The brand, tenant picker, menu data,
 * settings action and user menu are app-owned inputs, not an auth or tenancy
 * backend hidden in the template.
 */
export interface AppShellProps {
  /** Brand/logo at the top of the sidebar. */
  brand: JSX.Element
  /** Compact mark used when the sidebar is icon-only. Defaults to `brand`. */
  brandCollapsed?: JSX.Element
  /** Tenant/workspace switcher, usually a `Dropdown`. */
  tenant?: JSX.Element
  /** Compact tenant action when collapsed (usually the tenant logo). */
  tenantCollapsed?: JSX.Element
  /** Optional search/filter control, pinned above the scrolling menu. */
  sidebarSearch?: JSX.Element
  /** The labelled sections and icon rows of the one navigation sidebar. */
  navigation?: AppSidebarGroup[]
  /** Advanced navigation content, rendered inside the same sidebar. */
  navigationContent?: JSX.Element | (() => JSX.Element)
  /** Settings action pinned to the bottom of the sidebar. */
  settings?: JSX.Element
  /** User/account control pinned below settings. */
  account?: JSX.Element
  /** Compact account icon control, shown while collapsed. */
  accountCollapsed?: JSX.Element
  /** Controlled desktop icon-collapse state. Unset: shell owns it. */
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  /** Accessible names of the sidebar and mobile drawer. */
  navLabel?: string
  /** Main page title, rendered as the document's h1. */
  title: JSX.Element
  description?: JSX.Element
  breadcrumbs?: BreadcrumbItem[]
  actions?: JSX.Element
  /** Header actions shared by desktop and the mobile bar. */
  headerActions?: JSX.Element
  /** Title shown in the compact mobile bar. Defaults to `title`. */
  mobileTitle?: JSX.Element
  /** Content below the page heading. */
  children: JSX.Element
  /** Content below the page body, inside the page scroller. */
  footer?: JSX.Element
  class?: string
}

const DESKTOP = '(min-width: 1024px)'

export function AppShell(props: AppShellProps): JSX.Element {
  const desktop = createMediaQuery(DESKTOP)
  const ui = useUI()
  const [internalCollapsed, setInternalCollapsed] = createSignal(false)
  const [drawerOpen, setDrawerOpen] = createSignal(false)
  const drawerPortal =
    typeof document === 'undefined' ? undefined : document.createElement('div')
  const collapsed = () => props.collapsed ?? internalCollapsed()
  let drawer: HTMLDialogElement | undefined
  let trigger: HTMLButtonElement | undefined

  drawerPortal?.setAttribute('data-keep-drawer', '')

  onMount(() => {
    if (drawer && drawerPortal) drawer.append(drawerPortal)
  })

  const setCollapsed = (next: boolean) => {
    if (props.collapsed === undefined) setInternalCollapsed(next)
    props.onCollapsedChange?.(next)
  }

  const openDrawer = () => {
    setDrawerOpen(true)
    showDialog(drawer)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    if (drawer?.open) closeDialog(drawer)
  }

  createEffect(() => {
    if (desktop() && drawerOpen()) closeDrawer()
  })

  onCleanup(() => closeDialog(drawer))

  const sidebarProps = () => ({
    brand: props.brand,
    brandCollapsed: props.brandCollapsed,
    tenant: props.tenant,
    tenantCollapsed: props.tenantCollapsed,
    search: props.sidebarSearch,
    groups: props.navigation,
    children: props.navigationContent,
    settings: props.settings,
    account: props.account,
    accountCollapsed: props.accountCollapsed,
    ariaLabel: props.navLabel ?? 'Application navigation',
  })

  const title = () => props.mobileTitle ?? props.title

  return (
    <div
      data-slot="app-shell"
      class={`flex h-dvh min-h-0 overflow-hidden bg-surface-gray-1 text-interface text-ink-gray-9 ${props.class ?? ''}`}
    >
      <Show when={desktop()}>
        <div
          data-slot="app-shell-sidebar"
          class={`h-full shrink-0 overflow-hidden border-e border-outline-gray-1 bg-surface-sidebar transition-[width] duration-200 motion-reduce:transition-none ${collapsed() ? 'w-14' : 'w-64'}`}
        >
          <AppSidebar
            {...sidebarProps()}
            width="100%"
            collapsedWidth="100%"
            collapsed={collapsed()}
            onCollapsedChange={setCollapsed}
          />
        </div>
      </Show>

      <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Show when={!desktop() || props.headerActions}>
          <header
            data-slot="app-shell-header"
            class="flex min-h-12 shrink-0 items-center justify-between gap-control-gap border-b border-outline-gray-1 bg-surface-elevation-1 px-page-gutter-compact"
          >
            <div class="flex min-w-0 items-center gap-2">
              <Show when={!desktop()}>
                <button
                  ref={trigger}
                  type="button"
                  aria-label="Open application navigation"
                  aria-haspopup="dialog"
                  aria-expanded={drawerOpen()}
                  onClick={openDrawer}
                  class="grid size-9 shrink-0 place-items-center rounded-3 hover:bg-surface-gray-2 focus-visible:focus-ring"
                >
                  <span aria-hidden="true" class="lucide-menu size-4" />
                </button>
                <span class="min-w-0 truncate font-medium">{title()}</span>
              </Show>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              {props.headerActions}
            </div>
          </header>
        </Show>

        <main
          id="app-shell-content"
          data-slot="app-shell-content"
          class="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <a href="#app-shell-content" class="sr-only focus:not-sr-only">
            Skip to workspace
          </a>
          <div class="mx-auto flex w-full max-w-[1440px] flex-col gap-section-gap p-page-gutter-compact pb-8 md:p-page-gutter">
            <div class="flex flex-wrap items-end justify-between gap-4">
              <div class="min-w-0">
                <Show when={props.breadcrumbs}>
                  {(items) => <Breadcrumbs items={items()} />}
                </Show>
                <h1 class="mt-1 text-heading">{props.title}</h1>
                <Show when={props.description}>
                  <p class="mt-2 max-w-2xl text-ink-gray-7">
                    {props.description}
                  </p>
                </Show>
              </div>
              <Show when={props.actions}>
                <div class="flex flex-wrap items-center gap-2">
                  {props.actions}
                </div>
              </Show>
            </div>
            {props.children}
            <Show when={props.footer}>{props.footer}</Show>
          </div>
        </main>
      </div>

      <dialog
        ref={drawer}
        aria-label={props.navLabel ?? 'Application navigation'}
        data-slot="app-shell-drawer"
        onClose={() => {
          setDrawerOpen(false)
          trigger?.focus()
        }}
        onClick={(event) => {
          if (event.target === drawer) return closeDrawer()
          const target = event.target as Element
          const control = target.closest('a, button, [data-navigates]')
          if (control && !control.closest('[data-keep-drawer]')) closeDrawer()
        }}
        class="open:flex m-0 h-dvh max-h-none w-72 max-w-[calc(100vw-2rem)] flex-col overflow-y-auto border-e border-outline-gray-1 bg-surface-sidebar p-0 text-ink-gray-9 backdrop:bg-black-overlay-200"
      >
        <div class="flex shrink-0 justify-end border-b border-outline-gray-1 p-2">
          <Button variant="ghost" size="sm" onClick={closeDrawer}>
            Close navigation
          </Button>
        </div>
        <UIProvider dir={ui?.dir()} portalTarget={drawerPortal}>
          <AppSidebar
            {...sidebarProps()}
            width="100%"
            collapsedWidth="100%"
            collapsed={false}
            collapsible={false}
          />
        </UIProvider>
      </dialog>
    </div>
  )
}
