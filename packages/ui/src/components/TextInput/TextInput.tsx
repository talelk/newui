import { type JSX, Show, splitProps } from 'solid-js'
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

const SIZE: Record<InputSize, string> = {
  xs: 'h-6 rounded-3 text-xs',
  sm: 'h-7 rounded-4 text-base',
  md: 'h-8 rounded-4 text-base',
  lg: 'h-10 rounded-5 text-lg',
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
  const pad = () => PAD[size()][local.prefix ? 1 : local.suffix ? 2 : 0]

  const input = (
    <input
      {...rest}
      id={local.id ?? field?.controlId()}
      type={local.type ?? 'text'}
      value={local.value}
      disabled={local.disabled}
      class={cn(
        'w-full leading-tighter transition-colors outline-none focus:ring-0',
        SIZE[size()],
        pad(),
        VARIANT[local.variant ?? 'subtle'],
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
 * A single-line text input. `subtle` (the default) is the filled look; switch
 * to `outline` for a bordered input on a busy surface. When any labelling prop
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
  const hasLabeling = () =>
    Boolean(local.label || local.description || local.error || local.required)

  return (
    <Show when={hasLabeling()} fallback={<TextInputControl {...props} />}>
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
    </Show>
  )
}
