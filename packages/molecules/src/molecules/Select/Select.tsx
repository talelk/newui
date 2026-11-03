import type { InputSize, InputVariant } from '@talelk/newui-atoms'
import { Icon, type IconProp } from '@talelk/newui-atoms'
import {
  cn,
  controlDensity,
  createId,
  createZagApi,
  disabledPopup,
  Field,
  fieldFocusWithin,
  fieldPads,
  fieldSizes,
  invalidField,
  listboxRow,
  overlayLayers,
  overlayPanel,
  Portal,
  popupFieldVariants,
  useField,
} from '@talelk/newui-atoms/internal'
import { ListCollection } from '@zag-js/collection'
import * as zag from '@zag-js/select'
import { createMemo, For, type JSX, Show, splitProps } from 'solid-js'

type SelectApi = ReturnType<typeof zag.connect>

export type SelectSize = InputSize
export type SelectVariant = InputVariant

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
  /** A `lucide-*` string or component, shown before the label (P11). */
  icon?: IconProp
  /** Secondary line under the label, shown in the list (and the trigger). */
  description?: string
}

export interface SelectBaseProps {
  options: SelectOption[]
  placeholder?: string
  label?: JSX.Element
  description?: JSX.Element
  error?: JSX.Element | false
  required?: boolean
  id?: string
  /** Accessible name for the trigger when no visible `label` is rendered. */
  'aria-label'?: string
  disabled?: boolean
  name?: string
  /** Trigger height/typography. Matches the input scale. */
  /** @default sm */
  size?: SelectSize
  /** Trigger surface. `outline` is the default; `subtle` is filled. */
  variant?: SelectVariant
  class?: string
}

export interface SelectSingleProps extends SelectBaseProps {
  /** Single mode (the default): one selected value; `null` clears it. */
  multiple?: false
  value?: string | null
  onValueChange?: (value: string | null) => void
}

export interface SelectMultiProps extends SelectBaseProps {
  multiple: true
  /** Selected values; the empty array clears. */
  value?: string[]
  onValueChange?: (value: string[]) => void
}

export type SelectProps = SelectSingleProps | SelectMultiProps

// Field geometry is the shared density table (control-styles): `fieldSizes`
// on the control, `fieldPads` + the density text composite on the trigger —
// no per-component SIZE/PAD copies.

/**
 * A selection control over a fixed option list. Zag's accessible element is the
 * trigger (`role="combobox"`); a visually-hidden native `<select>` carries the
 * form value.
 */
function SelectControl(props: SelectProps): JSX.Element {
  const [local] = splitProps(props, [
    'options',
    'value',
    'onValueChange',
    'placeholder',
    'label',
    'aria-label',
    'disabled',
    'multiple',
    'name',
    'size',
    'variant',
    'class',
  ])

  const field = useField()
  const size = () => local.size ?? 'sm'
  const isMulti = () => local.multiple === true

  // The Zag machine is array-shaped in both modes; the scalar/array boundary
  // lives here, so single mode passes one value across it. `undefined` leaves
  // the machine uncontrolled — only a real value becomes a controlled array.
  const machineValue = createMemo<string[] | undefined>(() => {
    if (isMulti()) return local.value as string[] | undefined
    const single = local.value as string | null | undefined
    return single == null ? undefined : [single]
  })

  const collection = createMemo(
    () =>
      new ListCollection<SelectOption>({
        items: local.options,
        itemToString: (item: SelectOption) => item.label,
        itemToValue: (item: SelectOption) => item.value,
      }),
  )

  const machineId = createId('select')
  const { api } = createZagApi<SelectApi>(zag.machine, zag.connect, () => ({
    id: machineId,
    ids:
      props.id || field
        ? { trigger: props.id ?? field?.controlId() }
        : undefined,
    invalid: field?.hasError(),
    required: field?.required(),
    collection: collection(),
    value: machineValue(),
    disabled: local.disabled,
    multiple: local.multiple,
    name: local.name,
    onValueChange: (details: { value: string[] }) => {
      if (isMulti()) {
        ;(local.onValueChange as ((value: string[]) => void) | undefined)?.(
          details.value,
        )
      } else {
        ;(
          local.onValueChange as ((value: string | null) => void) | undefined
        )?.(details.value[0] ?? null)
      }
    },
  }))

  // The first selected option — drives the trigger's leading icon.
  const selectedOption = createMemo(() => {
    const first = (api().value ?? [])[0]
    if (first === undefined) return undefined
    return local.options.find((option) => option.value === first)
  })

  return (
    <div
      {...api().getRootProps()}
      data-slot="select"
      class={cn('relative flex w-full flex-col gap-1', local.class)}
    >
      <select {...api().getHiddenSelectProps()} />

      <div
        {...api().getControlProps()}
        data-slot="select-control"
        data-size={size()}
        data-invalid={field?.hasError() ? '' : undefined}
        data-variant={local.variant ?? 'outline'}
        class={cn(
          'flex w-full items-stretch transition-colors',
          fieldSizes[size()],
          popupFieldVariants[local.variant ?? 'outline'],
          fieldFocusWithin,
          invalidField,
          disabledPopup,
        )}
      >
        <button
          {...api().getTriggerProps()}
          data-slot="select-trigger"
          aria-labelledby={props.label ? field?.labelId() : undefined}
          aria-invalid={field?.hasError() ? 'true' : undefined}
          aria-describedby={field?.describedBy()}
          aria-errormessage={field?.hasError() ? field.errorId() : undefined}
          aria-label={
            local['aria-label'] ??
            (local.label
              ? undefined
              : typeof local.placeholder === 'string'
                ? local.placeholder
                : undefined)
          }
          class={cn(
            'flex w-full items-center justify-between gap-2 text-left text-ink-gray-8 disabled:cursor-not-allowed disabled:text-ink-gray-4',
            fieldPads[size()].base,
            controlDensity[size()].text,
          )}
        >
          <span class="flex min-w-0 items-center gap-2">
            <Show when={selectedOption()?.icon}>
              {(icon) => (
                <Icon icon={icon()} class="size-4 shrink-0 text-ink-gray-6" />
              )}
            </Show>
            <span {...api().getValueTextProps()} class="truncate">
              {api().valueAsString || local.placeholder || 'Select…'}
            </span>
          </span>
          <span
            {...api().getIndicatorProps()}
            class="shrink-0 text-ink-gray-6 transition-transform data-[state=open]:rotate-180"
          >
            <Icon icon="lucide-chevron-down" class="size-3.5" />
          </span>
        </button>
      </div>

      <Show when={api().open}>
        <Portal>
          <div
            {...api().getPositionerProps()}
            data-slot="select-positioner"
            class={overlayLayers.popup}
          >
            <div
              {...api().getContentProps()}
              data-slot="select-content"
              class={cn(
                overlayPanel({ kind: 'popup' }),
                'min-w-40 w-[var(--reference-width)]',
              )}
            >
              <For each={local.options}>
                {(option) => (
                  <div
                    {...api().getItemProps({ item: option })}
                    data-slot="select-item"
                    class={listboxRow}
                  >
                    <span class="flex min-w-0 flex-1 items-center gap-2">
                      <Show when={option.icon}>
                        {(icon) => (
                          <Icon
                            icon={icon()}
                            class="size-4 shrink-0 text-ink-gray-6"
                          />
                        )}
                      </Show>
                      <span
                        {...api().getItemTextProps({ item: option })}
                        class="min-w-0"
                      >
                        <span class="block truncate">{option.label}</span>
                        <Show when={option.description}>
                          <span class="block truncate text-p-sm text-ink-gray-6">
                            {option.description}
                          </span>
                        </Show>
                      </span>
                    </span>
                    <span
                      {...api().getItemIndicatorProps({ item: option })}
                      class="text-ink-blue-8"
                    >
                      <Icon icon="lucide-check" class="size-3.5" />
                    </span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}

/** A value selector with the shared Field labelling and error contract. */
export function Select(props: SelectProps): JSX.Element {
  return (
    <Field
      id={props.id}
      label={props.label}
      description={props.description}
      error={props.error}
      required={props.required}
      disabled={props.disabled}
    >
      <SelectControl {...props} />
    </Field>
  )
}
