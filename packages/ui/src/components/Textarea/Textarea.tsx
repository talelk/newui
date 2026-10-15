import { type JSX, splitProps } from 'solid-js'
import { Field, useField } from '../../lib/field'
import { cn } from '../../lib/tv'
import type { InputSize, InputVariant } from '../TextInput'

export interface TextareaProps {
  value?: string
  placeholder?: string
  rows?: number
  name?: string
  id?: string
  disabled?: boolean
  readonly?: boolean
  /** @default sm */
  size?: InputSize
  variant?: InputVariant
  class?: string
  label?: JSX.Element
  description?: JSX.Element
  error?: JSX.Element | false
  required?: boolean
  'aria-label'?: string
  onInput?: JSX.EventHandlerUnion<HTMLTextAreaElement, InputEvent>
}

const SIZE: Record<InputSize, string> = {
  xs: 'rounded-3 text-xs',
  sm: 'rounded-3 text-base',
  md: 'rounded-3 text-base',
  lg: 'rounded-3 text-lg',
}

const VARIANT: Record<InputVariant, string> = {
  subtle:
    'border border-surface-gray-2 bg-surface-gray-2 placeholder:text-ink-gray-6 hover:bg-surface-gray-3 focus:border-outline-gray-4 focus:bg-surface-base focus:shadow-sm',
  outline:
    'border border-outline-gray-2 bg-surface-base placeholder:text-ink-gray-6 hover:border-outline-gray-3 focus:border-outline-gray-4 focus:shadow-sm',
  ghost: 'border-0 bg-transparent placeholder:text-ink-gray-6',
}

type ControlProps = Omit<
  TextareaProps,
  'label' | 'description' | 'error' | 'required'
>

function TextareaControl(props: ControlProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'class',
    'id',
    'size',
    'variant',
    'disabled',
  ])
  const field = useField()
  return (
    <textarea
      data-slot="textarea"
      data-size={local.size ?? 'sm'}
      data-variant={local.variant ?? 'outline'}
      {...rest}
      id={local.id ?? field?.controlId()}
      rows={props.rows ?? 3}
      disabled={local.disabled}
      class={cn(
        'w-full resize-y px-2 py-1.5 leading-tighter transition-colors outline-none focus-visible:focus-ring-blue aria-[invalid=true]:border-outline-red-6',
        SIZE[local.size ?? 'sm'],
        VARIANT[local.variant ?? 'outline'],
        local.disabled ? 'text-ink-gray-6' : 'text-ink-gray-8',
        local.disabled && 'border bg-surface-gray-1 hover:shadow-none',
        local.class,
      )}
      aria-invalid={field?.hasError() ? 'true' : undefined}
      aria-required={field?.required() ? 'true' : undefined}
      aria-describedby={field?.describedBy()}
      aria-errormessage={field?.hasError() ? field?.errorId() : undefined}
    />
  )
}

export function Textarea(props: TextareaProps): JSX.Element {
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
      <TextareaControl {...props} />
    </Field>
  )
}
