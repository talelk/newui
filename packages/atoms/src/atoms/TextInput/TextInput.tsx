import { type JSX, Show, splitProps } from 'solid-js'
import {
  controlGlyphSizes,
  disabledField,
  fieldFocus,
  fieldPads,
  fieldSizes,
  invalidField,
  textFieldVariants,
} from '../../lib/control-styles'
import { Field, useField } from '../../lib/field'
import { cn } from '../../lib/tv'

export type InputSize = 'xs' | 'sm' | 'md' | 'lg'
export type InputVariant = 'subtle' | 'outline' | 'ghost'

export interface TextInputProps
  extends Omit<
    JSX.InputHTMLAttributes<HTMLInputElement>,
    // the native `prefix` attribute is a string; `prefix` here is the P6
    // adornment slot
    'prefix'
  > {
  /** @default 'text' */
  type?: string
  /** Controlled value. */
  value?: string
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
}

// Adornment inset per size: the field pad's leading/trailing step.
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
      local.prefix ? fieldPads[size()].prefix : fieldPads[size()].base,
      local.suffix && fieldPads[size()].suffix.split(' ')[1],
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
        'w-full text-ink-gray-8 leading-tighter transition-colors',
        fieldFocus,
        invalidField,
        disabledField,
        fieldSizes[size()],
        pad(),
        textFieldVariants[local.variant ?? 'outline'],
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
              'pointer-events-none absolute inset-y-0 start-0 flex items-center text-ink-gray-8',
              PREFIX_PAD[size()],
            )}
          >
            <span
              class={cn(
                'flex items-center justify-center [&>*]:shrink-0 [&_svg]:size-full',
                controlGlyphSizes[size()],
              )}
            >
              {local.prefix}
            </span>
          </span>
        </Show>
        {input}
        <Show when={local.suffix}>
          <span
            class={cn(
              'pointer-events-none absolute inset-y-0 end-0 flex items-center text-ink-gray-8',
              SUFFIX_PAD[size()],
            )}
          >
            <span
              class={cn(
                'flex items-center justify-center [&>*]:shrink-0 [&_svg]:size-full',
                controlGlyphSizes[size()],
              )}
            >
              {local.suffix}
            </span>
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
