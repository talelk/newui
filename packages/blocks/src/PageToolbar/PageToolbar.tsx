import { Button, Dropdown, type IconProp, PageHeader } from '@newui/ui'
import { type JSX, Show } from 'solid-js'

export interface PageToolbarAction {
  label: string
  /** A `lucide-*` string or a component (P11). */
  icon?: IconProp
  onClick?: () => void
}

export interface PageToolbarProps {
  title: JSX.Element
  /** Options for the ellipsis menu beside the title. Omitted → no menu. */
  menu?: PageToolbarAction[]
  /** The primary action — the one thing this screen is for. */
  action?: PageToolbarAction
  /** Anything else on the trailing edge, after the primary action. */
  children?: JSX.Element
  class?: string
}

/**
 * The page header: a title, an optional title menu, and the actions.
 *
 * Small, but it is the three details inside it that were being re-decided on
 * every screen: the title menu is an ellipsis *button* (a chevron next to a
 * title reads as a dropdown for the title, which is exactly what it is — but
 * the ellipsis is the convention), the primary action carries a leading `+` only
 * when it creates something, and the header is `PageHeader` rather than a bare
 * sticky div so it flips to the pinned mobile variant with the shell.
 */
export function PageToolbar(props: PageToolbarProps): JSX.Element {
  return (
    <PageHeader class={props.class}>
      <div class="flex min-w-0 items-center gap-1">
        <span class="truncate text-heading text-ink-gray-9">{props.title}</span>
        <Show when={props.menu}>
          {(menu) => (
            <Dropdown
              options={menu().map((entry) => ({
                label: entry.label,
                value: entry.label,
                ...(typeof entry.icon === 'string' ? { icon: entry.icon } : {}),
              }))}
              onSelect={(value) =>
                menu()
                  .find((entry) => entry.label === value)
                  ?.onClick?.()
              }
            >
              <span class="sr-only">Page actions</span>
            </Dropdown>
          )}
        </Show>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        {props.children}
        <Show when={props.action}>
          {(action) => (
            <Button
              variant="solid"
              theme="blue"
              iconLeft={action().icon ?? 'lucide-plus'}
              onClick={action().onClick}
            >
              {action().label}
            </Button>
          )}
        </Show>
      </div>
    </PageHeader>
  )
}
