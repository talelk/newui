import { Icon } from '@newui/atoms'
import { cn } from '@newui/atoms/internal'
import { For, type JSX, Show, splitProps } from 'solid-js'
import { Menu } from '../Menu'

export interface DropdownOption {
  label: string
  value: string
  disabled?: boolean
  /** A `lucide-*` string or component, rendered before the label (P11). */
  icon?: string
  /** Renders the label in the danger tone (destructive actions). */
  danger?: boolean
}

export interface DropdownProps {
  /** The menu items. */
  options: DropdownOption[]
  /** The trigger's content (rendered inside a button). */
  children?: JSX.Element
  /** Called with the selected option's value. */
  onSelect?: (value: string) => void
  /** Merged into the trigger. */
  class?: string
}

/**
 * An options-based action menu — frappe-ui's `Dropdown`. A thin composition over
 * the compound `Menu` (same Zag `menu` machine): it renders the trigger and one
 * `Menu.Item` per option. Use `Menu` directly when the trigger or rows need to
 * be customised beyond `label`/`icon`/`danger`.
 */
export function Dropdown(props: DropdownProps): JSX.Element {
  const [local] = splitProps(props, [
    'options',
    'children',
    'onSelect',
    'class',
  ])

  return (
    <Menu.Root onSelect={local.onSelect}>
      <Menu.Trigger
        data-slot="dropdown-trigger"
        class={cn(
          // frappe's default trigger is a subtle gray `Button` (size `sm`):
          // `h-7 text-base px-2 rounded-4`, not a bordered input-like box.
          'inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-3 bg-surface-gray-2 px-2 text-base text-ink-gray-8 transition-colors',
          'hover:bg-surface-gray-3 active:bg-surface-gray-4',
          'focus-visible:focus-ring',
          'data-[state=open]:bg-surface-gray-4',
          local.class,
        )}
      >
        {local.children}
        <span
          class="lucide-chevron-down size-4 shrink-0 text-ink-gray-5"
          aria-hidden="true"
        />
      </Menu.Trigger>
      <Menu.Content data-slot="dropdown-content">
        <For each={local.options}>
          {(option) => (
            <Menu.Item value={option.value} disabled={option.disabled}>
              <Show when={option.icon}>
                <Icon
                  icon={option.icon}
                  class="size-4 shrink-0 text-ink-gray-6"
                />
              </Show>
              <span class={option.danger ? 'text-ink-red-7' : undefined}>
                {option.label}
              </span>
            </Menu.Item>
          )}
        </For>
      </Menu.Content>
    </Menu.Root>
  )
}
