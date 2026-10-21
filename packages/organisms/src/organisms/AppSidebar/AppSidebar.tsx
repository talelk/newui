import { type IconProp, ScrollArea } from '@newui/atoms'
import { For, type JSX, Show } from 'solid-js'
import {
  Sidebar,
  SidebarCollapseToggle,
  SidebarItem,
  SidebarLabel,
  type SidebarProps,
  useSidebar,
} from '../Sidebar'

export interface AppSidebarItem {
  label: string
  icon?: IconProp
  count?: number
  active?: boolean
  route?: string
  href?: string
  onClick?: () => void
}

export interface AppSidebarGroup {
  label?: JSX.Element
  action?: JSX.Element
  items: AppSidebarItem[]
}

/**
 * The one navigation organism an application shell needs: identity and tenant
 * at the top, one grouped menu, then utilities and the account at the bottom.
 *
 * The shell controls `collapsed`; every item, including the two bottom slots,
 * stays in the same sidebar context and gets the icon tooltip behavior from
 * `SidebarItem`. `brandCollapsed` and `tenantCollapsed` let the app choose a
 * compact mark; if absent, the expanded slot itself is retained.
 */
export interface AppSidebarProps {
  brand: JSX.Element
  brandCollapsed?: JSX.Element
  tenant?: JSX.Element
  tenantCollapsed?: JSX.Element
  /** Optional fixed control below the tenant and above the scrolling groups. */
  search?: JSX.Element
  groups?: AppSidebarGroup[]
  /** Advanced navigation composition, still inside this single sidebar. */
  children?: JSX.Element | (() => JSX.Element)
  settings?: JSX.Element
  account?: JSX.Element
  accountCollapsed?: JSX.Element
  width?: SidebarProps['width']
  collapsedWidth?: SidebarProps['collapsedWidth']
  collapsed?: SidebarProps['collapsed']
  onCollapsedChange?: SidebarProps['onCollapsedChange']
  collapsible?: SidebarProps['collapsible']
  ariaLabel?: string
  class?: string
}

/**
 * Calls a render-function navigation slot *inside* the Sidebar provider.
 *
 * A JSX element created by the caller has already run its component functions
 * in the caller's context, so a custom menu that reads `useSidebar()` would
 * capture the default expanded value and never react to the shell collapse.
 * The function form defers evaluation until this component renders under the
 * provider.
 */
function AppSidebarContent(props: {
  content?: JSX.Element | (() => JSX.Element)
}): JSX.Element {
  return (
    <>{typeof props.content === 'function' ? props.content() : props.content}</>
  )
}

function AppSidebarIdentity(props: {
  brand: JSX.Element
  brandCollapsed?: JSX.Element
  tenant?: JSX.Element
  tenantCollapsed?: JSX.Element
}): JSX.Element {
  const { collapsed } = useSidebar()
  return (
    <>
      <div data-slot="app-sidebar-brand" class="shrink-0 px-2 pt-3 pb-2">
        <Show when={collapsed()} fallback={props.brand}>
          {props.brandCollapsed ?? props.brand}
        </Show>
      </div>
      <Show when={props.tenant}>
        <div
          data-slot="app-sidebar-tenant"
          data-keep-drawer
          class="shrink-0 px-2 pb-2"
        >
          <Show when={collapsed()} fallback={props.tenant}>
            {props.tenantCollapsed}
          </Show>
        </div>
      </Show>
    </>
  )
}

function AppSidebarFooter(props: {
  settings?: JSX.Element
  account?: JSX.Element
  accountCollapsed?: JSX.Element
  collapsible: boolean
}): JSX.Element {
  const { collapsed } = useSidebar()
  return (
    <div
      data-slot="app-sidebar-footer"
      class="mt-auto flex shrink-0 flex-col gap-1 px-2 pt-2 pb-2"
    >
      <Show when={props.collapsible}>
        <SidebarCollapseToggle />
      </Show>
      <Show when={props.settings}>{props.settings}</Show>
      <Show
        when={collapsed() && props.accountCollapsed}
        fallback={props.account}
      >
        {props.accountCollapsed}
      </Show>
    </div>
  )
}

export function AppSidebar(props: AppSidebarProps): JSX.Element {
  return (
    <Sidebar
      width={props.width ?? '16rem'}
      collapsedWidth={props.collapsedWidth ?? '3.5rem'}
      collapsed={props.collapsed}
      onCollapsedChange={props.onCollapsedChange}
      collapsible={props.collapsible}
      shortcut={false}
      ariaLabel={props.ariaLabel ?? 'Application navigation'}
      class={props.class}
    >
      <AppSidebarIdentity
        brand={props.brand}
        brandCollapsed={props.brandCollapsed}
        tenant={props.tenant}
        tenantCollapsed={props.tenantCollapsed}
      />

      <Show when={props.search}>
        <div data-slot="app-sidebar-search" class="shrink-0 px-2 pb-2">
          {props.search}
        </div>
      </Show>

      <ScrollArea.Root class="min-h-0 flex-1">
        <ScrollArea.Viewport class="px-2 pt-1 pb-3">
          <Show
            when={props.children}
            fallback={
              <For each={props.groups ?? []}>
                {(group, index) => (
                  <section
                    data-slot="app-sidebar-group"
                    class={index() === 0 ? undefined : 'mt-4'}
                  >
                    <Show when={group.label || group.action}>
                      <SidebarLabel divider action={group.action}>
                        {group.label}
                      </SidebarLabel>
                    </Show>
                    <div class="flex flex-col gap-0.5">
                      <For each={group.items}>
                        {(item) => (
                          <SidebarItem
                            active={item.active}
                            label={item.label}
                            icon={item.icon}
                            route={item.route}
                            href={item.href}
                            onClick={() => item.onClick?.()}
                            suffix={
                              item.count ? (
                                <span class="rounded-full bg-surface-gray-2 px-1.5 py-px text-caption tabular-nums text-ink-gray-7">
                                  {item.count}
                                </span>
                              ) : undefined
                            }
                          >
                            {item.label}
                          </SidebarItem>
                        )}
                      </For>
                    </div>
                  </section>
                )}
              </For>
            }
          >
            <AppSidebarContent content={props.children} />
          </Show>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar />
      </ScrollArea.Root>

      <AppSidebarFooter
        settings={props.settings}
        account={props.account}
        accountCollapsed={props.accountCollapsed}
        collapsible={props.collapsible !== false}
      />
    </Sidebar>
  )
}
