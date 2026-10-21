import { type JSX, Show, splitProps } from 'solid-js'
import { fieldSizes } from '../../lib/control-styles'
import { Field, useField } from '../../lib/field'
import { cn } from '../../lib/tv'

export type InputSize = 'xs' | 'sm' | 'md' | 'lg'
export type InputVariant = 'subtle' | 'outline' | 'ghost'

export interface TextInputProps {
  type?: string
  value?: string
  placeholder?: string
  name?: string
  id?: string
  disabled?: boolean
  readonly?: boolean
  /** @default sm */
  size?: InputSize
  variant?: InputVariant
  class?: string
  prefix?: JSX.Element
  suffix?: JSX.Element
  label?: JSX.Element
  description?: JSX.Element
  error?: JSX.Element | false
  required?: boolean
  'aria-label'?: string
  onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>
  onChange?: JSX.EventHandlerUnion<HTMLInputElement, Event>
  onKeyDown?: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent>
}

const PAD: Record<InputSize, [string, string, string]> = {
  // [no adornment, with prefix, with suffix]
  xs: ['ps-1.5 pe-1.5', 'ps-7 pe-1.5', 'ps-1.5 pe-7'],
  sm: ['ps-2 pe-2', 'ps-8 pe-2', 'ps-2 pe-8'],
  md: ['ps-2.5 pe-2.5', 'ps-9 pe-2.5', 'ps-2.5 pe-9'],
  lg: ['ps-3 pe-3', 'ps-10 pe-3', 'ps-3 pe-10'],
}

const PREFIX_PAD: Record<InputSize, string> = {
  xs: 'ps-1.5',
  sm: 'ps-2',
  md: 'ps-2.5',
  lg: 'ps-3',
}

const SUFFIX_PAD: Record<InputSize, string> = {
  xs: 'pe-1.5',
  sm: 'pe-2',
  md: 'pe-2.5',
  lg: 'pe-3',
}

const VARIANT: Record<InputVariant, string> = {
  subtle:
    'border border-surface-gray-2 bg-surface-gray-2 placeholder:text-ink-gray-6 hover:border-outline-gray-3 hover:bg-surface-gray-3 focus:border-outline-gray-4 focus:bg-surface-base focus:shadow-sm',
  outline:
    'border border-outline-gray-2 bg-surface-base placeholder:text-ink-gray-6 hover:border-outline-gray-3 hover:shadow-sm focus:border-outline-gray-4 focus:bg-surface-base focus:shadow-sm',
  ghost: 'border-0 bg-transparent placeholder:text-ink-gray-6',
}

type ControlProps = Omit<
  TextInputProps,
  'label' | 'description' | 'error' | 'required'
>

function TextInputControl(props: ControlProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'type',
    'value',
    'class',
    'prefix',
    'suffix',
    'id',
    'size',
    'variant',
    'disabled',
  ])
  const field = useField()
  const size = () => local.size ?? 'sm'
  const pad = () =>
    cn(
      PAD[size()][local.prefix ? 1 : 0],
      local.suffix && PAD[size()][2].split(' ')[1],
    )

  const input = (
    <input
      {...rest}
      data-slot="text-input"
      data-size={size()}
      data-variant={local.variant ?? 'outline'}
      data-disabled={local.disabled ? '' : undefined}
      id={local.id ?? field?.controlId()}
      type={local.type ?? 'text'}
      value={local.value}
      disabled={local.disabled}
      class={cn(
        'w-full leading-tighter transition-colors outline-none focus-visible:focus-ring-blue aria-[invalid=true]:border-outline-red-6',
        fieldSizes[size()],
        pad(),
        VARIANT[local.variant ?? 'outline'],
        local.disabled ? 'text-ink-gray-6' : 'text-ink-gray-8',
        local.disabled &&
          'border bg-surface-gray-1 placeholder:text-ink-gray-3 hover:shadow-none',
        local.class,
      )}
      aria-invalid={field?.hasError() ? 'true' : undefined}
      aria-required={field?.required() ? 'true' : undefined}
      aria-describedby={field?.describedBy()}
      aria-errormessage={field?.hasError() ? field?.errorId() : undefined}
    />
  )

  return (
    <Show when={local.prefix || local.suffix} fallback={input}>
      <div class="relative flex w-full items-center">
        <Show when={local.prefix}>
          <span
            class={cn(
              'pointer-events-none absolute inset-y-0 start-0 flex items-center',
              local.disabled ? 'text-ink-gray-6' : 'text-ink-gray-8',
              PREFIX_PAD[size()],
            )}
          >
            {local.prefix}
          </span>
        </Show>
        {input}
        <Show when={local.suffix}>
          <span
            class={cn(
              'pointer-events-none absolute inset-y-0 end-0 flex items-center',
              local.disabled ? 'text-ink-gray-6' : 'text-ink-gray-8',
              SUFFIX_PAD[size()],
            )}
          >
            {local.suffix}
          </span>
        </Show>
      </div>
    </Show>
  )
}

/**
 * A single-line text input. `outline` is the default bordered surface; `subtle` is the filled look. When any labelling prop
 * is present it renders the shared `Field`, so `label`/`description`/`error`/
 * `required` wire themselves (P5).
 */
export function TextInput(props: TextInputProps): JSX.Element {
  const [local] = splitProps(props, [
    'label',
    'description',
    'error',
    'required',
  ])
  return (
    <Field
      id={props.id}
      label={local.label}
      description={local.description}
      error={local.error}
      required={local.required}
      disabled={props.disabled}
    >
      <TextInputControl {...props} />
    </Field>
  )
}
