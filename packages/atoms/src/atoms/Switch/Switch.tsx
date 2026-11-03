import * as zag from '@zag-js/switch'
import { type JSX, Show, splitProps } from 'solid-js'
import { invalidToggle } from '../../lib/control-styles'
import { Field, FieldLabelContent, useField } from '../../lib/field'
import { createId } from '../../lib/id'
import { cn, tv } from '../../lib/tv'
import { createZagApi } from '../../lib/zag'
import { Icon, type IconProp } from '../Icon'

type SwitchApi = ReturnType<typeof zag.connect>
type SwitchSize = 'xs' | 'sm' | 'md'

// State is selectors, not JS branches: Zag stamps `data-state` /
// `data-disabled` on the control and thumb, and CSS reads them. Padded rows
// own the ring (focus-ring-within on the container), so the control's own
// focus ring only applies standalone (`padded: false`).
const switchControl = tv({
  base: [
    'relative inline-flex shrink-0 items-center rounded-pill border-transparent bg-surface-gray-4 transition-colors duration-fast ease-in-out motion-reduce:transition-none',
    'hover:bg-surface-gray-5 active:bg-surface-gray-6 group-hover:bg-surface-gray-5',
    'data-[state=checked]:bg-surface-gray-10 data-[state=checked]:hover:bg-surface-gray-9 data-[state=checked]:active:bg-surface-gray-8 data-[state=checked]:group-hover:bg-surface-gray-9',
    'data-[disabled]:cursor-not-allowed data-[disabled]:bg-surface-gray-3 data-[disabled]:hover:bg-surface-gray-3 data-[disabled]:group-hover:bg-surface-gray-3',
  ],
  variants: {
    size: {
      xs: 'h-3.5 w-6 border-2',
      sm: 'h-4 w-6.5 border-2',
      md: 'h-5 w-8 border-[3px]',
    },
    padded: {
      true: '',
      false: 'data-[focus-visible]:focus-ring',
    },
  },
  defaultVariants: { size: 'sm', padded: false },
})

const switchThumb = tv({
  base: 'pointer-events-none inline-block rounded-pill bg-surface-gray-10 shadow ring-0 transition duration-fast ease-in-out data-[state=checked]:bg-surface-base motion-reduce:transition-none',
  variants: {
    size: {
      xs: 'size-2.5 data-[state=checked]:translate-x-2.5',
      sm: 'size-3 data-[state=checked]:translate-x-2.5',
      md: 'size-3.5 data-[state=checked]:translate-x-3',
    },
  },
  defaultVariants: { size: 'sm' },
})

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
  id?: string
  error?: JSX.Element | false
  required?: boolean
  class?: string
}

/**
 * A neutral switch: off is a light track, on is the deepest gray. The `theme`
 * axis is intentionally absent — a switch reads as a state, not a colour, so it
 * stays on the gray scale (P4's "components without a tone axis").
 */
function SwitchControl(props: SwitchProps): JSX.Element {
  const field = useField()
  const machineId = createId('switch')
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
    'id',
    'error',
    'required',
  ])

  const { api } = createZagApi<SwitchApi>(zag.machine, zag.connect, () => ({
    id: machineId,
    ids: {
      label: field?.labelId(),
      hiddenInput: local.id ?? field?.controlId(),
    },
    required: field?.required() ?? local.required,
    invalid: field?.hasError(),
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

  const controlClasses = () =>
    cn(
      switchControl({ size: size(), padded: Boolean(local.padded) }),
      invalidToggle,
    )

  const thumbClasses = () => switchThumb({ size: size() })

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
      classes.push('rounded-card py-1.5')
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
      'group rounded-card transition-colors',
      sizeClass,
      !hasDetail() && 'justify-center',
      controlPosition() === 'start' ? 'w-fit' : 'w-full',
      local.disabled
        ? 'cursor-not-allowed'
        : 'cursor-pointer hover:bg-surface-gray-3 active:bg-surface-gray-4 focus-ring-within',
    )
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the padded surface forwards clicks from its padding to the control; the row label is the real interactive element.
    // biome-ignore lint/a11y/useKeyWithClickEvents: the control stays keyboard-reachable through the hidden input.
    <div
      data-slot="switch-root"
      data-variant={local.padded ? 'padded' : 'plain'}
      data-size={size()}
      data-state={api().checked ? 'checked' : 'unchecked'}
      data-disabled={local.disabled ? '' : undefined}
      class={cn('relative flex flex-col', containerClasses(), local.class)}
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
                <FieldLabelContent required={field?.required()}>
                  {local.label}
                </FieldLabelContent>
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
          aria-describedby={field?.describedBy()}
          aria-invalid={field?.hasError() ? 'true' : undefined}
          aria-errormessage={field?.hasError() ? field.errorId() : undefined}
        />
      </label>
      <Show when={local.description && !field}>
        <span
          class={cn(
            'text-p-sm text-ink-gray-6',
            // Align the helper under the label, not the switch, when the switch
            // leads the row (switch width + `gap-x`).
            controlPosition() === 'start' &&
              (size() === 'md' ? 'ps-10.5' : size() === 'sm' ? 'ps-9' : 'ps-8'),
          )}
        >
          {local.description}
        </span>
      </Show>
    </div>
  )
}

export function Switch(props: SwitchProps): JSX.Element {
  return (
    <Field
      id={props.id}
      label={props.label}
      inlineLabel
      description={props.description}
      error={props.error}
      required={props.required}
      disabled={props.disabled}
    >
      <SwitchControl {...props} />
    </Field>
  )
}
