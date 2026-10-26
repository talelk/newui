import {
  cn,
  createId,
  createZagApi,
  Field,
  useField,
} from '@talelk/newui-atoms/internal'
import * as zag from '@zag-js/pin-input'
import { For, type JSX, splitProps } from 'solid-js'

type PinInputApi = ReturnType<typeof zag.connect>

export type PinInputType = 'numeric' | 'alphanumeric' | 'alphabetic'

export interface PinInputProps {
  /** How many cells render. @default 6 */
  length?: number
  /** Controlled value: one entry per cell. */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (details: { value: string[]; valueAsString: string }) => void
  /** Fires when every cell holds a valid value — the code is complete. */
  onValueComplete?: (details: {
    value: string[]
    valueAsString: string
  }) => void
  /** What a cell accepts. @default numeric */
  type?: PinInputType
  /** Advertises `autocomplete="one-time-code"` for SMS OTP autofill. */
  otp?: boolean
  /** Mask the cells like a password. */
  mask?: boolean
  /** @default ○ */
  placeholder?: string
  /** Blur the last cell once the code is complete. */
  blurOnComplete?: boolean
  disabled?: boolean
  readOnly?: boolean
  name?: string
  label?: JSX.Element
  description?: JSX.Element
  error?: JSX.Element | false
  required?: boolean
  id?: string
  'aria-label'?: string
  class?: string
}

function PinInputControl(props: PinInputProps): JSX.Element {
  const field = useField()
  const machineId = createId('pin-input')
  const [local] = splitProps(props, [
    'length',
    'value',
    'defaultValue',
    'onValueChange',
    'onValueComplete',
    'type',
    'otp',
    'mask',
    'placeholder',
    'blurOnComplete',
    'disabled',
    'readOnly',
    'label',
    'aria-label',
    'class',
  ])

  const { api } = createZagApi<PinInputApi>(zag.machine, zag.connect, () => ({
    id: machineId,
    ids: { label: field?.labelId() },
    count: local.length ?? 6,
    value: local.value,
    defaultValue: local.defaultValue ?? [],
    type: local.type ?? 'numeric',
    otp: local.otp,
    mask: local.mask,
    placeholder: local.placeholder,
    blurOnComplete: local.blurOnComplete,
    disabled: local.disabled,
    readOnly: local.readOnly,
    invalid: field?.hasError(),
    required: field?.required(),
    name: props.name,
    onValueChange: (details: { value: string[]; valueAsString: string }) =>
      local.onValueChange?.(details),
    onValueComplete: (details: { value: string[]; valueAsString: string }) =>
      local.onValueComplete?.(details),
  }))

  const cellBase =
    'h-7 w-7 rounded-3 border bg-surface-base text-center text-base text-ink-gray-8 caret-transparent outline-none transition-colors placeholder:text-ink-gray-4 disabled:cursor-not-allowed disabled:bg-surface-gray-2 disabled:text-ink-gray-4 focus-visible:focus-ring-blue'

  return (
    <div
      {...api().getRootProps()}
      data-slot="pin-input"
      class={cn('flex w-full flex-col gap-1', local.class)}
    >
      <div
        {...api().getControlProps()}
        data-slot="pin-input-cells"
        class="flex gap-1.5"
      >
        <For each={api().items}>
          {(index) => (
            <input
              {...api().getInputProps({ index })}
              aria-label={local['aria-label']}
              aria-labelledby={local.label ? field?.labelId() : undefined}
              aria-describedby={field?.describedBy()}
              aria-invalid={field?.hasError() ? 'true' : undefined}
              aria-required={field?.required() ? 'true' : undefined}
              aria-errormessage={
                field?.hasError() ? field.errorId() : undefined
              }
              data-invalid={field?.hasError() ? '' : undefined}
              class={cn(
                cellBase,
                field?.hasError()
                  ? 'border-outline-red-6'
                  : 'border-outline-gray-2 hover:border-outline-gray-3',
              )}
            />
          )}
        </For>
      </div>
    </div>
  )
}

/**
 * A fixed-length code — the verification digits, an OTP from a text message.
 * One focus walks every cell: typing advances, paste splits across the cells,
 * arrows and backspace move between them. The `length` is the code's shape;
 * `otp` asks the phone to autofill it.
 */
export function PinInput(props: PinInputProps): JSX.Element {
  return (
    <Field
      id={props.id}
      label={props.label}
      description={props.description}
      error={props.error}
      required={props.required}
      disabled={props.disabled}
    >
      <PinInputControl {...props} />
    </Field>
  )
}
