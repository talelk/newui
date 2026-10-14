import {
  Icon,
  type IconProp,
  ScrollArea,
  Sidebar,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  type SidebarProps,
} from '@newui/ui'
import { For, type JSX, Show } from 'solid-js'

export interface AppSidebarItem {
  label: string
  icon?: IconProp
  /** A quiet trailing count — unread items, members, tickets. */
  count?: number
  active?: boolean
  onClick?: () => void
}

export interface AppSidebarGroup {
  /** Section heading, rendered as a `SidebarLabel` and dropped when absent. */
  label?: JSX.Element
  items: AppSidebarItem[]
}

export interface AppSidebarProps {
  title: JSX.Element
  subtitle?: JSX.Element
  logo?: IconProp
  showLogo?: boolean
  /** Rendered on the trailing edge of the header — a menu, usually. */
  headerActions?: JSX.Element
  groups: AppSidebarGroup[]
  width?: SidebarProps['width']
  class?: string
}

/**
 * The navigation sidebar an app screen opens with: a titled header, then
 * labelled groups of items with optional counts.
 *
 * Every reference screen opens this way, and each one was repeating the same
 * twenty lines of `SidebarHeader` + `SidebarLabel` + `SidebarItem` markup —
 * including the parts that are easy to get subtly wrong: the header is not
 * inside the scroll region, a count is a quiet suffix rather than a `Badge`, and
 * the label row is what gives a long list its structure.
 *
 * The scroll region is `ScrollArea` (the thin, auto-hiding overlay scrollbar)
 * rather than `overflow-y-auto`, so the sidebar does not show a permanent track
 * beside the page's own scrollbar.
 *
 * An item with no icon renders no leading slot at all: an empty flex child
 * would shift its label out of line with the items that have one.
 */
export function AppSidebar(props: AppSidebarProps): JSX.Element {
  return (
    <Sidebar width={props.width ?? '14rem'} class={props.class}>
      <SidebarHeader
        title={props.title}
        subtitle={props.subtitle}
        logo={props.logo}
        showLogo={props.showLogo}
        actions={props.headerActions}
      />
      <ScrollArea.Root class="min-h-0 flex-1">
        <ScrollArea.Viewport class="px-2 pt-0.5 pb-6">
          <For each={props.groups}>
            {(group, index) => (
              <div class={index() === 0 ? undefined : 'mt-4'}>
                <Show when={group.label}>
                  <SidebarLabel>{group.label}</SidebarLabel>
                </Show>
                <div class="flex flex-col gap-0.5">
                  <For each={group.items}>
                    {(item) => (
                      <SidebarItem
                        active={item.active}
                        onClick={item.onClick}
                        prefix={
                          <Show when={item.icon}>
                            {(icon) => <Icon icon={icon()} class="size-4" />}
                          </Show>
                        }
                        suffix={
                          <Show when={item.count}>
                            <span class="text-xs text-ink-gray-5">
                              {item.count}
                            </span>
                          </Show>
                        }
                      >
                        {item.label}
                      </SidebarItem>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar />
      </ScrollArea.Root>
    </Sidebar>
  )
}
