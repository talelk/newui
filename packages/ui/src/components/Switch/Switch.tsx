import * as zag from '@zag-js/switch'
import { type JSX, Show, splitProps } from 'solid-js'
import { createId } from '../../lib/id'
import { cn } from '../../lib/tv'
import { createZagApi } from '../../lib/zag'
import { Icon, type IconProp } from '../Icon'

type SwitchApi = ReturnType<typeof zag.connect>
type SwitchSize = 'xs' | 'sm' | 'md'

export interface SwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  /** Size of the switch control. Defaults to `sm`. */
  size?: SwitchSize
  /**
   * Wraps the control and label in a clickable surface with hover, active and
   * focus states — useful for settings rows and menu items.
   */
  padded?: boolean
  /**
   * Position of the control relative to the label, along the inline axis
   * (RTL-aware). `start` is the leading side, `end` the trailing side. Defaults
   * to `end`, so the switch trails the label.
   */
  controlPosition?: 'start' | 'end'
  /**
   * Optional icon rendered alongside the label. A `lucide-*` string or a
   * component (P11).
   */
  icon?: IconProp
  label?: JSX.Element
  description?: JSX.Element
  name?: string
  class?: string
}

/**
 * A neutral switch: off is a light track, on is the deepest gray. The `theme`
 * axis is intentionally absent — a switch reads as a state, not a colour, so it
 * stays on the gray scale (P4's "components without a tone axis").
 */
export function Switch(props: SwitchProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'checked',
    'defaultChecked',
    'onCheckedChange',
    'disabled',
    'size',
    'padded',
    'controlPosition',
    'icon',
    'label',
    'description',
    'name',
    'class',
  ])

  const { api } = createZagApi<SwitchApi>(zag.machine, zag.connect, () => ({
    id: createId('switch'),
    checked: local.checked,
    defaultChecked: local.defaultChecked,
    disabled: local.disabled,
    name: local.name,
    onCheckedChange: (details: { checked: boolean }) =>
      local.onCheckedChange?.(details.checked),
  }))

  const size = () => local.size ?? 'sm'
  const controlPosition = () => local.controlPosition ?? 'end'
  const hasDetail = () => Boolean(local.description)

  const controlClasses = () => {
    const sizeClass =
      size() === 'md'
        ? 'h-5 w-8 border-[3px]'
        : size() === 'sm'
          ? 'h-4 w-[26px] border-2'
          : 'h-3.5 w-[24px] border-2'
    return cn(
      'relative inline-flex shrink-0 items-center rounded-full border-transparent transition-colors duration-100 ease-in-out',
      // Padded rows show the ring on the surface (`[&:has(:focus-visible)]`),
      // so the control's own ring is suppressed there.
      !local.padded && 'data-[focus-visible]:focus-ring',
      api().checked ? 'bg-surface-gray-10' : 'bg-surface-gray-4',
      api().disabled
        ? 'cursor-not-allowed bg-surface-gray-3'
        : api().checked
          ? 'hover:bg-surface-gray-9 active:bg-surface-gray-8 group-hover:bg-surface-gray-9'
          : 'hover:bg-surface-gray-5 active:bg-surface-gray-6 group-hover:bg-surface-gray-5',
      sizeClass,
    )
  }

  const thumbClasses = () =>
    cn(
      'pointer-events-none inline-block rounded-full bg-surface-base shadow ring-0 transition duration-100 ease-in-out',
      size() === 'md'
        ? 'size-3.5 data-[state=checked]:translate-x-3'
        : size() === 'sm'
          ? 'size-3 data-[state=checked]:translate-x-2.5'
          : 'size-2.5 data-[state=checked]:translate-x-2.5',
    )

  const labelClasses = () =>
    cn(
      'select-none text-base leading-tighter',
      local.disabled
        ? 'cursor-not-allowed text-ink-gray-4'
        : 'cursor-pointer text-ink-gray-8',
    )

  // Label first, switch trailing — the way Switch has always read. A leading
  // switch is opt-in via `controlPosition="start"`; `flex-row-reverse` keeps it
  // inline-axis aware, so it flips under RTL with no physical values.
  const groupClasses = () => {
    const start = controlPosition() === 'start'
    if (!local.label && !hasDetail()) return 'flex'
    if (hasDetail()) {
      return cn(
        'flex items-center',
        start ? 'flex-row-reverse justify-end' : 'justify-between',
        size() === 'md' ? 'gap-x-3.5' : 'gap-x-2.5',
      )
    }
    const classes = [
      'flex group items-center',
      start
        ? 'flex-row-reverse justify-end gap-x-2.5'
        : 'justify-between gap-x-3',
    ]
    if (!local.padded) {
      classes.push('rounded-4 py-1.5')
      classes.push(local.disabled ? 'cursor-not-allowed' : 'cursor-pointer')
    }
    return cn(...classes)
  }

  const containerClasses = () => {
    if (!local.padded) return undefined
    const sizeClass = hasDetail()
      ? size() === 'md'
        ? 'px-3 py-2'
        : size() === 'sm'
          ? 'px-2 py-1.5'
          : 'px-1.5 py-1.5'
      : size() === 'md'
        ? 'h-8 px-3'
        : size() === 'sm'
          ? 'h-7 px-2'
          : 'h-6 px-1.5'
    return cn(
      'group rounded-4 transition-colors',
      sizeClass,
      !hasDetail() && 'justify-center',
      controlPosition() === 'start' ? 'w-fit' : 'w-full',
      local.disabled
        ? 'cursor-not-allowed'
        : 'cursor-pointer hover:bg-surface-gray-3 active:bg-surface-gray-4 [&:has(:focus-visible)]:ring-2 [&:has(:focus-visible)]:ring-outline-gray-3',
    )
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the padded surface forwards clicks from its padding to the control; the row label is the real interactive element.
    // biome-ignore lint/a11y/useKeyWithClickEvents: the control stays keyboard-reachable through the hidden input.
    <div
      class={cn('flex flex-col', containerClasses(), local.class)}
      onClick={(event) => {
        if (!local.padded || local.disabled) return
        if ((event.target as HTMLElement).closest('[data-slot="switch"]'))
          return
        api().toggleChecked()
      }}
    >
      <label
        {...rest}
        {...api().getRootProps()}
        data-slot="switch"
        class={groupClasses()}
      >
        <div class="flex flex-col gap-1">
          <div class="flex items-center">
            <Show when={local.icon}>
              <Icon
                icon={local.icon}
                class="me-2 size-4 shrink-0 text-ink-gray-6"
              />
            </Show>
            <Show when={local.label}>
              <span
                {...api().getLabelProps()}
                data-slot="label"
                class={labelClasses()}
              >
                {local.label}
              </span>
            </Show>
          </div>
        </div>
        <span
          {...api().getControlProps()}
          data-slot="switch-control"
          class={controlClasses()}
        >
          <span
            {...api().getThumbProps()}
            data-slot="switch-thumb"
            class={thumbClasses()}
          />
        </span>
        <input
          {...api().getHiddenInputProps()}
          role="switch"
          aria-checked={api().checked ? 'true' : 'false'}
        />
      </label>
      <Show when={local.description}>
        <span
          class={cn(
            'text-p-sm text-ink-gray-6',
            // Align the helper under the label, not the switch, when the switch
            // leads the row (switch width + `gap-x`).
            controlPosition() === 'start' &&
              (size() === 'md'
                ? 'ps-[42px]'
                : size() === 'sm'
                  ? 'ps-9'
                  : 'ps-8'),
          )}
        >
          {local.description}
        </span>
      </Show>
    </div>
  )
}
