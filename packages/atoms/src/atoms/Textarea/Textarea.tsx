import { type JSX, splitProps } from 'solid-js'
import {
  disabledField,
  fieldFocus,
  fieldPads,
  invalidField,
  textFieldVariants,
} from '../../lib/control-styles'
import { Field, useField } from '../../lib/field'
import { cn } from '../../lib/tv'
import type { InputSize, InputVariant } from '../TextInput'

export interface TextareaProps
  extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Controlled value. */
  value?: string
  /** @default sm */
  size?: InputSize
  variant?: InputVariant
  class?: string
  label?: JSX.Element
  description?: JSX.Element
  error?: JSX.Element | false
  required?: boolean
}

// Per-size box: the field text composite plus vertical pad (multi-line, so
// no fixed height); inline padding comes from the shared fieldPads.
const SIZE: Record<InputSize, string> = {
  xs: 'rounded-control py-1 text-xs',
  sm: 'rounded-control py-1.5 text-base',
  md: 'rounded-control py-2 text-base',
  lg: 'rounded-control py-2.5 text-lg',
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
      data-disabled={local.disabled ? '' : undefined}
      {...rest}
      id={local.id ?? field?.controlId()}
      rows={props.rows ?? 3}
      disabled={local.disabled}
      class={cn(
        'w-full resize-y text-ink-gray-8 leading-tighter transition-colors',
        fieldFocus,
        invalidField,
        disabledField,
        SIZE[local.size ?? 'sm'],
        fieldPads[local.size ?? 'sm'].base,
        textFieldVariants[local.variant ?? 'outline'],
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
