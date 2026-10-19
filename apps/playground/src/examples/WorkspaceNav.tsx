import { SidebarItem, useSidebar } from '@newui/ui'
import { For, type JSX, Show } from 'solid-js'

/**
 * The navigation list an application recipe carries in its sidebar.
 *
 * Rows are the library's `SidebarItem` — the same anatomy frappe-ui's
 * recipes compose. Inside the example frame they sit in a real `<Sidebar>`
 * root, so the list folds to a labelled icon rail with the frame (headings
 * and the footnote step aside; there is no room for prose in a rail).
 * Standalone use (Mail's in-page mailbox list) reads the context's expanded
 * default, so the same list simply never folds.
 *
 * In the reference each entry switches the *screen* — the demo implements
 * one screen, so selecting an entry moves the highlight there too, and the
 * comment at each call site says whether the recipe gives it a real effect
 * (Mail's mailboxes filter the inbox) or mirrors the reference's
 * single-screen demo (Deals' Notifications, Leads, Contacts…).
 */

export interface WorkspaceNavItem {
  label: string
  /** A `lucide-*` class. */
  icon: string
  count?: number
}

export function WorkspaceNav(props: {
  items: WorkspaceNavItem[]
  /** The selected entry. */
  value: string
  onChange: (label: string) => void
  /** Accessible name for the list. */
  label: string
  /** Visible heading above the list — the reference's `SidebarLabel`. */
  heading?: string
  /** Visible heading above the second run. Defaults to the group's own label. */
  group?: { label: string; items: WorkspaceNavItem[] }
  /** Muted text under the list — the reference's workspace footer. */
  footnote?: string
  class?: string
}): JSX.Element {
  const { collapsed } = useSidebar()
  const render = (
    items: WorkspaceNavItem[],
    heading: string | undefined,
    spaced: boolean,
  ): JSX.Element => (
    <>
      <Show when={heading && !collapsed()}>
        <p
          classList={{
            'px-2 pb-1 text-xs font-medium text-ink-gray-7': true,
            'pt-3': spaced,
          }}
        >
          {heading}
        </p>
      </Show>
      <For each={items}>
        {(item) => (
          <SidebarItem
            label={item.label}
            icon={item.icon}
            active={props.value === item.label}
            onClick={() => props.onChange(item.label)}
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
    </>
  )

  return (
    <nav
      aria-label={props.label}
      class={`flex flex-col gap-0.5 ${props.class ?? ''}`}
    >
      {render(props.items, props.heading, false)}
      <Show when={props.group}>
        {(group) => render(group().items, group().label, true)}
      </Show>
      <Show when={props.footnote && !collapsed()}>
        <p class="px-2 pt-3 text-xs text-ink-gray-7">{props.footnote}</p>
      </Show>
    </nav>
  )
}
