import * as zag from '@zag-js/number-input'
import { type JSX, splitProps } from 'solid-js'
import { Field, useField } from '../../lib/field'
import { createId } from '../../lib/id'
import { cn } from '../../lib/tv'
import { createZagApi } from '../../lib/zag'

type NumberInputApi = ReturnType<typeof zag.connect>

export interface NumberInputProps {
  value?: string
  defaultValue?: string
  onValueChange?: (details: { value: string; valueAsNumber: number }) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  label?: JSX.Element
  description?: JSX.Element
  error?: JSX.Element | false
  required?: boolean
  id?: string
  name?: string
  'aria-label'?: string
  class?: string
}

function NumberInputControl(props: NumberInputProps): JSX.Element {
  const field = useField()
  const machineId = createId('number')
  const [local] = splitProps(props, [
    'value',
    'defaultValue',
    'onValueChange',
    'min',
    'max',
    'step',
    'disabled',
    'label',
    'class',
  ])

  const { api } = createZagApi<NumberInputApi>(
    zag.machine,
    zag.connect,
    () => ({
      id: machineId,
      ids: { input: props.id ?? field?.controlId(), label: field?.labelId() },
      value: local.value,
      defaultValue: local.defaultValue ?? '',
      min: local.min,
      max: local.max,
      step: local.step ?? 1,
      disabled: local.disabled,
      name: props.name,
      invalid: field?.hasError(),
      required: field?.required(),
      onValueChange: (details: { value: string; valueAsNumber: number }) =>
        local.onValueChange?.(details),
    }),
  )

  const trigger =
    'grid w-7 place-items-center text-ink-gray-6 transition-colors hover:bg-surface-gray-2 disabled:cursor-not-allowed disabled:text-ink-gray-4 data-[disabled]:cursor-not-allowed data-[disabled]:text-ink-gray-4'

  return (
    <div
      {...api().getRootProps()}
      data-slot="number-input"
      class={cn('relative flex w-full flex-col gap-1', local.class)}
    >
      <div
        {...api().getControlProps()}
        data-slot="number-input-control"
        data-invalid={field?.hasError() ? '' : undefined}
        class={cn(
          'flex items-stretch h-7 overflow-hidden rounded-3 border border-outline-gray-2 bg-surface-base',
          'focus-within:focus-ring-blue data-[invalid]:border-outline-red-6',
          'data-[disabled]:cursor-not-allowed data-[disabled]:bg-surface-gray-2',
        )}
      >
        <input
          {...api().getInputProps()}
          id={api().getInputProps()['id']}
          aria-label={props['aria-label']}
          aria-labelledby={props.label ? field?.labelId() : undefined}
          aria-describedby={field?.describedBy()}
          aria-invalid={field?.hasError() ? 'true' : undefined}
          aria-errormessage={field?.hasError() ? field.errorId() : undefined}
          class="min-w-0 w-full border-0 bg-transparent px-2 py-1 text-base text-ink-gray-8 outline-none placeholder:text-ink-gray-6 disabled:cursor-not-allowed"
        />
        <div class="flex shrink-0 divide-x divide-outline-gray-2 border-s border-outline-gray-2">
          <button
            {...api().getIncrementTriggerProps()}
            class={trigger}
            aria-label="Increment"
          >
            <svg
              viewBox="0 0 12 12"
              class="size-3"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path d="M6 2.5v7M2.5 6h7" stroke-linecap="round" />
            </svg>
          </button>
          <button
            {...api().getDecrementTriggerProps()}
            class={trigger}
            aria-label="Decrement"
          >
            <svg
              viewBox="0 0 12 12"
              class="size-3"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path d="M2.5 6h7" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export function NumberInput(props: NumberInputProps): JSX.Element {
  return (
    <Field
      id={props.id}
      label={props.label}
      description={props.description}
      error={props.error}
      required={props.required}
      disabled={props.disabled}
    >
      <NumberInputControl {...props} />
    </Field>
  )
}
