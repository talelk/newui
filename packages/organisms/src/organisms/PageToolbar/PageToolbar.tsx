import { Button, type IconProp } from '@talelk/newui-atoms'
import { Dropdown } from '@talelk/newui-molecules'
import { For, type JSX, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'

export interface PageToolbarAction {
  label: string
  /** A `lucide-*` string or a component (P11). No icon is implied. */
  icon?: IconProp
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
}

export interface PageToolbarProps {
  title: JSX.Element
  /** Semantic level of the title. @default 1 */
  headingLevel?: 1 | 2 | 3 | 4
  /** Options for the ellipsis menu beside the title. Omitted → no menu. */
  menu?: PageToolbarAction[]
  /** Secondary actions, before the primary. */
  secondary?: PageToolbarAction[]
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
    <header
      class={`flex min-h-12 shrink-0 items-center justify-between gap-control-gap border-b border-outline-gray-1 bg-surface-base px-page-gutter-compact sm:px-page-gutter ${props.class ?? ''}`}
    >
      <div class="flex min-w-0 items-center gap-1">
        <Dynamic
          component={`h${props.headingLevel ?? 1}`}
          class="truncate text-heading text-ink-gray-9"
        >
          {props.title}
        </Dynamic>
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

      <div class="flex shrink-0 items-center gap-control-gap">
        {props.children}
        <Show when={props.secondary}>
          <For each={props.secondary}>
            {(action) => (
              <Button
                variant="outline"
                loading={action.loading}
                disabled={action.disabled}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
          </For>
        </Show>
        <Show when={props.action}>
          {(action) => (
            <Button
              variant="solid"
              theme="blue"
              iconLeft={action().icon}
              loading={action().loading}
              disabled={action().disabled}
              onClick={action().onClick}
            >
              {action().label}
            </Button>
          )}
        </Show>
      </div>
    </header>
  )
}
