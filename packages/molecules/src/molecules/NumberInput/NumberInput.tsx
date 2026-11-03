import { Icon, type InputSize, type InputVariant } from '@talelk/newui-atoms'
import {
  cn,
  createId,
  createZagApi,
  disabledPopup,
  Field,
  fieldFocusWithin,
  fieldPads,
  fieldSizes,
  invalidField,
  markGlyphSizes,
  popupFieldVariants,
  useField,
} from '@talelk/newui-atoms/internal'
import * as zag from '@zag-js/number-input'
import { type JSX, splitProps } from 'solid-js'

type NumberInputApi = ReturnType<typeof zag.connect>

export type NumberInputSize = InputSize
export type NumberInputVariant = InputVariant

export interface NumberInputProps {
  value?: string
  defaultValue?: string
  onValueChange?: (details: { value: string; valueAsNumber: number }) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  /** Control height/typography. Matches the input scale. @default sm */
  size?: NumberInputSize
  /** Control surface. `outline` is the default; `subtle` is filled. */
  variant?: NumberInputVariant
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
    'size',
    'variant',
    'label',
    'class',
  ])
  const size = (): NumberInputSize => local.size ?? 'sm'

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
        data-size={size()}
        data-variant={local.variant ?? 'outline'}
        data-invalid={field?.hasError() ? '' : undefined}
        class={cn(
          'flex items-stretch overflow-hidden transition-colors',
          fieldSizes[size()],
          popupFieldVariants[local.variant ?? 'outline'],
          fieldFocusWithin,
          invalidField,
          disabledPopup,
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
          class={cn(
            'min-w-0 w-full border-0 bg-transparent text-inherit text-ink-gray-8 outline-none placeholder:text-ink-gray-6 disabled:cursor-not-allowed',
            fieldPads[size()].base,
          )}
        />
        <div class="flex shrink-0 divide-x divide-outline-gray-2 border-s border-outline-gray-2">
          <button
            {...api().getIncrementTriggerProps()}
            class={trigger}
            aria-label="Increment"
          >
            <Icon icon="lucide-plus" class={markGlyphSizes[size()]} />
          </button>
          <button
            {...api().getDecrementTriggerProps()}
            class={trigger}
            aria-label="Decrement"
          >
            <Icon icon="lucide-minus" class={markGlyphSizes[size()]} />
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
