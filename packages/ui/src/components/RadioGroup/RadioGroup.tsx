import * as zag from '@zag-js/radio-group'
import { For, type JSX, Show, splitProps } from 'solid-js'
import { Field, FieldLabelContent, useField } from '../../lib/field'
import { createId } from '../../lib/id'
import { cn } from '../../lib/tv'
import { createZagApi } from '../../lib/zag'

type RadioGroupApi = ReturnType<typeof zag.connect>
type RadioSize = 'xs' | 'sm' | 'md'

export interface RadioGroupItem {
  value: string
  label?: JSX.Element
  /** Helper text shown under the option's label. */
  description?: JSX.Element
  disabled?: boolean
}

export interface RadioGroupProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  /** Size of every radio in the group. Defaults to `sm`. */
  size?: RadioSize
  /**
   * Wraps each option in a clickable surface with hover, active and focus
   * states — useful for selection lists and menu items.
   */
  padded?: boolean
  /**
   * When `true` (the default), arrow-key navigation wraps from the last option
   * back to the first. Set `false` to stop at the ends.
   */
  loop?: boolean
  items: RadioGroupItem[]
  label?: JSX.Element
  /** Helper text shown under the group. */
  description?: JSX.Element
  /** Error text shown under the group; `role="alert"`. */
  error?: JSX.Element | false
  required?: boolean
  id?: string
  name?: string
  'aria-label'?: string
  class?: string
}

function RadioGroupControl(props: RadioGroupProps): JSX.Element {
  const field = useField()
  const machineId = createId('radio')
  const [local] = splitProps(props, [
    'value',
    'defaultValue',
    'onValueChange',
    'disabled',
    'orientation',
    'size',
    'padded',
    'loop',
    'items',
    'label',
    'description',
    'error',
    'class',
  ])

  const { api } = createZagApi<RadioGroupApi>(zag.machine, zag.connect, () => ({
    id: machineId,
    ids: { root: props.id ?? field?.controlId(), label: field?.labelId() },
    name: props.name,
    required: field?.required(),
    invalid: field?.hasError(),
    value: local.value,
    defaultValue: local.defaultValue,
    disabled: local.disabled,
    orientation: local.orientation ?? 'vertical',
    onValueChange: (details: { value: string | null }) =>
      local.onValueChange?.(details.value ?? ''),
  }))

  const size = () => local.size ?? 'sm'
  const stacked = () => (local.orientation ?? 'vertical') === 'vertical'
  const isItemDisabled = (item: RadioGroupItem) =>
    Boolean(local.disabled || item.disabled)

  // Zag's radio group relies on the native radio-group keyboard behaviour, which
  // always wraps. `loop={false}` is honoured by cancelling the default action
  // when focus is already on the first/last enabled option.
  const onKeyDown = (event: KeyboardEvent) => {
    if (local.loop !== false) return
    const rtl =
      getComputedStyle(event.currentTarget as HTMLElement).direction === 'rtl'
    const nextKey = stacked() ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight'
    const prevKey = stacked() ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft'
    if (event.key !== nextKey && event.key !== prevKey) return
    const enabled = local.items.filter((item) => !isItemDisabled(item))
    const first = enabled[0]?.value
    const last = enabled[enabled.length - 1]?.value
    const value = (event.target as HTMLInputElement | null)?.value
    if (
      (event.key === nextKey && value === last) ||
      (event.key === prevKey && value === first)
    ) {
      event.preventDefault()
    }
  }

  const itemClasses = (item: RadioGroupItem) =>
    cn(
      'group flex items-start gap-2 rounded-4 text-start transition-colors',
      'focus:outline-none focus-visible:focus-ring',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60',
      local.padded &&
        (item.description
          ? size() === 'md'
            ? 'px-3 py-2'
            : 'px-1.5 py-1.5'
          : size() === 'md'
            ? 'h-8 items-center px-3'
            : size() === 'sm'
              ? 'h-7 items-center px-1.5'
              : 'h-6 items-center px-1.5'),
      local.padded &&
        !isItemDisabled(item) &&
        'hover:bg-surface-gray-3 active:bg-surface-gray-4',
    )

  const controlClasses = (item: RadioGroupItem) => {
    const { control, offset } =
      size() === 'md'
        ? {
            control: 'size-4 data-[state=checked]:border-[4.5px]',
            offset: 'mt-[2.5px]',
          }
        : size() === 'sm'
          ? {
              control: 'size-3.5 data-[state=checked]:border-4',
              offset: 'mt-[3.5px]',
            }
          : {
              control: 'size-[13px] data-[state=checked]:border-[3.7px]',
              offset: 'mt-1',
            }
    return cn(
      'box-border shrink-0 rounded-full border border-outline-gray-4 bg-surface-base transition-colors',
      // The row is `items-start`, so the circle is centred on the label's first
      // line unless a padded label-only row centres the whole row.
      item.description || !local.padded ? offset : undefined,
      control,
      // Unselected ring walks the outline scale; selected ring the surface scale,
      // matching Checkbox. Checked hover/active combine the row's `data-state`
      // and hover in one group selector so they outrank the unchecked hover.
      'group-hover:border-outline-gray-5 group-active:border-outline-gray-6',
      'data-[state=checked]:border-surface-gray-10',
      'group-[[data-state=checked]:hover]:border-surface-gray-9',
      'group-[[data-state=checked]:active]:border-surface-gray-8',
      'data-[focus-visible]:focus-ring-blue',
      field?.hasError() && 'border-outline-red-6',
    )
  }

  return (
    <div
      {...api().getRootProps()}
      onKeyDown={onKeyDown}
      data-slot="radio-group"
      role="radiogroup"
      aria-label={props['aria-label']}
      aria-describedby={field?.describedBy()}
      aria-invalid={field?.hasError() ? 'true' : undefined}
      aria-required={field?.required() ? 'true' : undefined}
      class={cn(
        'relative flex flex-col',
        local.label && 'gap-1.5',
        local.class,
      )}
    >
      <Show when={local.label}>
        <span
          {...api().getLabelProps()}
          class="text-caption font-medium text-ink-gray-6"
        >
          <FieldLabelContent required={field?.required()}>
            {local.label}
          </FieldLabelContent>
        </span>
      </Show>
      <div
        class={cn(
          'flex',
          stacked() ? 'flex-col' : 'flex-row flex-wrap items-center',
          !local.padded && (stacked() ? 'gap-y-1.5' : 'gap-x-4'),
        )}
      >
        <For each={local.items}>
          {(item) => (
            <label
              {...api().getItemProps({ value: item.value })}
              data-slot="radio-item"
              class={itemClasses(item)}
            >
              <span
                {...api().getItemControlProps({ value: item.value })}
                data-slot="radio-control"
                class={controlClasses(item)}
              />
              <span class="flex flex-col items-start gap-0.5 text-start">
                <span
                  {...api().getItemTextProps({ value: item.value })}
                  data-slot="label"
                  class={cn(
                    'block select-none text-base leading-tighter',
                    isItemDisabled(item)
                      ? 'text-ink-gray-4'
                      : 'text-ink-gray-8',
                  )}
                >
                  {item.label ?? item.value}
                </span>
                <Show when={item.description}>
                  <span
                    data-slot="description"
                    class={cn(
                      'block select-none text-sm leading-normal',
                      isItemDisabled(item)
                        ? 'text-ink-gray-3'
                        : 'text-ink-gray-6',
                    )}
                  >
                    {item.description}
                  </span>
                </Show>
              </span>
              <input
                {...api().getItemHiddenInputProps({ value: item.value })}
              />
            </label>
          )}
        </For>
      </div>
    </div>
  )
}

export function RadioGroup(props: RadioGroupProps): JSX.Element {
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
      <RadioGroupControl {...props} />
    </Field>
  )
}
