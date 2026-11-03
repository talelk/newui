import { Icon } from '@talelk/newui-atoms'
import { button, cn } from '@talelk/newui-atoms/internal'
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
  /** Disables the trigger; the menu cannot be opened. */
  disabled?: boolean
  /** Merged into the trigger. */
  class?: string
}

/**
 * An options-based action menu — frappe-ui's `Dropdown`. A thin composition over
 * the compound `Menu` (same Zag `menu` machine): it renders the trigger and one
 * `Menu.Item` per option. Use `Menu` directly when the trigger or rows need to
 * be customised beyond `label`/`icon`/`danger`.
 *
 * The trigger is the shared Button recipe (`subtle` / `sm`, the frappe
 * default) applied to `Menu.Trigger`'s button element — `Menu.Trigger` owns
 * the Zag trigger props, so the recipe is composed as classes rather than
 * nesting a `Button` inside a button.
 */
export function Dropdown(props: DropdownProps): JSX.Element {
  const [local] = splitProps(props, [
    'options',
    'children',
    'onSelect',
    'disabled',
    'class',
  ])

  return (
    <Menu.Root onSelect={local.onSelect}>
      <Menu.Trigger
        data-slot="dropdown-trigger"
        disabled={local.disabled}
        class={cn(
          button({ variant: 'subtle', theme: 'gray', size: 'sm' }),
          local.class,
        )}
      >
        {local.children}
        <Icon
          icon="lucide-chevron-down"
          class="size-4 shrink-0 text-ink-gray-5"
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
