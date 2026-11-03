import { createSignal, type JSX, splitProps } from 'solid-js'
import {
  disabledField,
  fieldFocus,
  fieldPads,
  fieldSizes,
  invalidField,
  textFieldVariants,
} from '../../lib/control-styles'
import { createControllableSignal } from '../../lib/controllable'
import { Field, useField } from '../../lib/field'
import { cn } from '../../lib/tv'
import type { InputSize, InputVariant } from '../TextInput'
import { type DurationFormat, formatDuration, parseDuration } from './duration'

export type { DurationFormat, DurationFormatPreset } from './duration'

export interface DurationProps {
  /** Controlled duration value in seconds. */
  value?: number | null
  /** Uncontrolled initial duration in seconds. */
  defaultValue?: number | null
  /** Called with the committed duration in seconds, or `null` when cleared. */
  onValueChange?: (value: number | null) => void
  /** Placeholder shown when the input is empty. Defaults to `1h 30m 45s`. */
  placeholder?: string
  /**
   * How the saved value is rendered while unfocused: a named preset
   * (`short` | `long` | `colon`) or a token template (e.g. `h'h' m'm' s's'`,
   * `hh:mm:ss`). Defaults to `short`. Editing always uses the canonical `short`
   * notation so typed text round-trips through `parseDuration`.
   */
  format?: DurationFormat
  /** @default sm */
  size?: InputSize
  variant?: InputVariant
  disabled?: boolean
  id?: string
  name?: string
  class?: string
  label?: JSX.Element
  description?: JSX.Element
  error?: JSX.Element | false
  required?: boolean
  'aria-label'?: string
}

const INVALID_ERROR =
  'Invalid format. Try: 1h 30m 45s, 1 hour 30 minutes, 1:30:45, 90s'

interface DurationControlProps {
  id?: string
  name?: string
  value: string
  placeholder?: string
  /** @default sm */
  size?: InputSize
  variant?: InputVariant
  disabled?: boolean
  class?: string
  'aria-label'?: string
  onFocus: JSX.EventHandler<HTMLInputElement, FocusEvent>
  onInput: JSX.EventHandler<HTMLInputElement, InputEvent>
  onBlur: JSX.EventHandler<HTMLInputElement, FocusEvent>
  onKeyDown: JSX.EventHandler<HTMLInputElement, KeyboardEvent>
}

function DurationControl(props: DurationControlProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'id',
    'name',
    'value',
    'placeholder',
    'size',
    'variant',
    'disabled',
    'class',
  ])
  const field = useField()
  const size = () => local.size ?? 'sm'

  return (
    <input
      {...rest}
      id={local.id ?? field?.controlId()}
      name={local.name}
      type="text"
      value={local.value}
      placeholder={local.placeholder ?? '1h 30m 45s'}
      disabled={local.disabled}
      data-slot="duration"
      data-size={size()}
      data-variant={local.variant ?? 'outline'}
      data-disabled={local.disabled ? '' : undefined}
      class={cn(
        'w-full text-ink-gray-8 leading-tighter transition-colors',
        fieldFocus,
        invalidField,
        disabledField,
        fieldSizes[size()],
        fieldPads[size()].base,
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

/**
 * A duration value control: a text input that shows a formatted duration and
 * parses human-readable text (`1h 30m 45s`, `1:30:45`, `90s`) back to seconds on
 * Enter or blur. Escape cancels the edit. It reuses the shared labelling
 * contract (P5), so `label`/`description`/`error`/`required` wire themselves.
 *
 * Controlled with `value` + `onValueChange`, or uncontrolled with
 * `defaultValue` (P2).
 */
export function Duration(props: DurationProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'label',
    'description',
    'error',
    'required',
    'value',
    'defaultValue',
    'onValueChange',
    'format',
    'placeholder',
    'size',
    'variant',
    'disabled',
    'id',
    'name',
    'class',
  ])

  const [value, setValue] = createControllableSignal<number | null>({
    value: () => local.value,
    defaultValue: local.defaultValue ?? null,
    onChange: (next) => local.onValueChange?.(next),
  })

  const [isFocused, setIsFocused] = createSignal(false)
  const [editValue, setEditValue] = createSignal('')
  const [internalError, setInternalError] = createSignal('')
  let cancelled = false

  // While editing (or after a rejected commit) the raw text is shown; otherwise
  // the saved value is rendered through the requested `format`.
  const displayValue = () =>
    isFocused() || internalError()
      ? editValue()
      : formatDuration(value(), local.format ?? 'short')

  const fieldError = () => local.error || internalError() || undefined
  function commit() {
    const raw = editValue().trim()

    if (raw === '') {
      setInternalError('')
      setIsFocused(false)
      setValue(null)
      return
    }

    const seconds = parseDuration(raw)
    if (seconds === null) {
      setInternalError(INVALID_ERROR)
      setIsFocused(false)
      return
    }

    setInternalError('')
    setIsFocused(false)
    setValue(seconds)
  }

  const handleFocus: JSX.EventHandler<HTMLInputElement, FocusEvent> = (
    event,
  ) => {
    // Guard against redundant focus events while already editing so the
    // in-progress text is not clobbered.
    if (isFocused()) return
    setIsFocused(true)
    // Always edit in the canonical "1h 30m 45s" notation so the typed value
    // round-trips through parseDuration regardless of the display `format`.
    setEditValue(formatDuration(value(), 'short'))
    setInternalError('')
    const input = event.currentTarget
    queueMicrotask(() => input.select())
  }

  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (
    event,
  ) => {
    setEditValue(event.currentTarget.value)
    setInternalError('')
  }

  const handleBlur: JSX.EventHandler<HTMLInputElement, FocusEvent> = () => {
    // Escape cancels the edit: skip the commit the blur would otherwise trigger
    // and leave the saved value untouched.
    if (cancelled) {
      cancelled = false
      setIsFocused(false)
      setInternalError('')
      return
    }
    commit()
  }

  const handleKeyDown: JSX.EventHandler<HTMLInputElement, KeyboardEvent> = (
    event,
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.blur()
    } else if (event.key === 'Escape') {
      cancelled = true
      event.currentTarget.blur()
    }
  }

  const renderControl = () => (
    <DurationControl
      {...rest}
      id={local.id}
      name={local.name}
      value={displayValue()}
      placeholder={local.placeholder}
      size={local.size}
      variant={local.variant}
      disabled={local.disabled}
      class={local.class}
      onFocus={handleFocus}
      onInput={handleInput}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  )

  return (
    <Field
      id={props.id}
      label={local.label}
      description={local.description}
      error={fieldError()}
      required={local.required}
      disabled={local.disabled}
    >
      {renderControl()}
    </Field>
  )
}
