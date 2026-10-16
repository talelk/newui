import { For, type JSX, Show } from 'solid-js'

/**
 * The navigation list an application recipe carries in its sidebar.
 *
 * It mirrors the reference recipes' `SidebarItem` lists: a glyph, a label, and a
 * quiet count where the reference has one. In the reference each entry switches
 * the *screen* — the demo implements one screen, so selecting an entry moves the
 * highlight there too, and the comment at each call site says whether the recipe
 * gives it a real effect (Mail's mailboxes filter the inbox) or mirrors the
 * reference's single-screen demo (Deals' Notifications, Leads, Contacts…).
 *
 * Plain markup rather than the library's `Sidebar`: these lists live inside the
 * example frame, which already owns the width, the border and the drawer, and the
 * frame is not the place to nest a second sidebar component.
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
  const render = (
    items: WorkspaceNavItem[],
    heading: string | undefined,
    spaced: boolean,
  ): JSX.Element => (
    <>
      <Show when={heading}>
        <p
          classList={{
            'px-2 pb-1 text-xs font-medium tracking-wide text-ink-gray-5 uppercase': true,
            'pt-3': spaced,
          }}
        >
          {heading}
        </p>
      </Show>
      <For each={items}>
        {(item) => (
          <button
            type="button"
            aria-current={props.value === item.label ? 'page' : undefined}
            onClick={() => props.onChange(item.label)}
            class="flex h-8 w-full items-center gap-2 rounded-3 px-2 text-start text-interface text-ink-gray-6 transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-9 focus-visible:focus-ring motion-reduce:transition-none aria-[current=page]:bg-surface-blue-2 aria-[current=page]:text-ink-blue-8"
          >
            <span aria-hidden="true" class={`${item.icon} size-4 shrink-0`} />
            <span class="min-w-0 flex-1 truncate">{item.label}</span>
            <Show when={item.count}>
              <span class="shrink-0 text-xs text-ink-gray-5">{item.count}</span>
            </Show>
          </button>
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
      <Show when={props.footnote}>
        <p class="px-2 pt-3 text-xs text-ink-gray-5">{props.footnote}</p>
      </Show>
    </nav>
  )
}
