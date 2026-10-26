import { TextInput } from '@talelk/newui-atoms'
import {
  cn,
  createControllableSignal,
  Field,
  useField,
} from '@talelk/newui-atoms/internal'
import { createSignal, type JSX, Show, splitProps } from 'solid-js'

const HEX = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

/** Normalizes any accepted hex spelling to the lowercase `#rrggbb` form. */
export function normalizeHex(input: string): string | null {
  const match = HEX.exec(input.trim())
  if (!match) return null
  const digits = match[1] as string
  const expanded =
    digits.length === 3
      ? digits
          .split('')
          .map((c) => c + c)
          .join('')
      : digits
  return `#${expanded.toLowerCase()}`
}

export interface ColorPickerProps {
  /** Controlled color as lowercase `#rrggbb`. */
  value?: string
  /** @default #6b7280 (gray-5) */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** The hex text field beside the swatch. @default true */
  editable?: boolean
  disabled?: boolean
  label?: JSX.Element
  description?: JSX.Element
  error?: JSX.Element | false
  required?: boolean
  id?: string
  'aria-label'?: string
  class?: string
}

function ColorPickerControl(props: ColorPickerProps): JSX.Element {
  const field = useField()
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'onValueChange',
    'editable',
    'disabled',
    'label',
    'aria-label',
    'class',
  ])
  const [color, setColor] = createControllableSignal<string>({
    value: () => local.value,
    defaultValue: local.defaultValue ?? '#6b7280',
    onChange: (next) => local.onValueChange?.(next),
  })
  /** The text field's draft — may be an invalid mid-typing hex. */
  const [draft, setDraft] = createSignal<string>()

  const invalid = () => field?.hasError() || draft() !== undefined

  const onTextInput = (raw: string) => {
    setDraft(raw)
    const normalized = normalizeHex(raw)
    if (normalized) {
      setColor(normalized)
      setDraft(undefined)
    }
  }

  const onNativeInput = (raw: string) => {
    // The native picker always reports a valid `#rrggbb`.
    setColor(raw.toLowerCase())
    setDraft(undefined)
  }

  return (
    <div
      {...rest}
      data-slot="color-picker"
      data-disabled={local.disabled ? '' : undefined}
      class={cn('flex items-center gap-2', local.class)}
    >
      <label
        data-slot="color-picker-swatch"
        class="relative inline-grid size-7 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-control border border-outline-gray-2 focus-within:focus-ring"
      >
        <span
          aria-hidden="true"
          class="size-full"
          style={{ 'background-color': color() }}
        />
        <input
          type="color"
          id={field?.controlId()}
          aria-label={local['aria-label']}
          aria-labelledby={local.label ? field?.labelId() : undefined}
          aria-describedby={field?.describedBy()}
          required={field?.required() ? true : undefined}
          disabled={local.disabled}
          value={color()}
          onInput={(event) => onNativeInput(event.currentTarget.value)}
          class="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
      <Show when={local.editable ?? true}>
        <TextInput
          class="w-28"
          aria-label={local['aria-label']}
          placeholder="#1a56db"
          disabled={local.disabled}
          value={draft() ?? color()}
          onInput={(event) => onTextInput(event.currentTarget.value)}
          aria-invalid={invalid() ? 'true' : undefined}
          data-invalid={invalid() ? '' : undefined}
        />
      </Show>
    </div>
  )
}

/**
 * A color value: the platform's own picker under a styled swatch, with a hex
 * field beside it. There is no custom hue/saturation surface on purpose — the
 * native control already carries the keyboard, pointer and screen-reader
 * behavior on every platform (the `Checkbox` precedent: a machine would
 * reimplement what the engine ships), and the library's color vocabulary is
 * tokens, not free-form painting. A hex draft that is not (yet) a valid color
 * flags the text field without committing.
 */
export function ColorPicker(props: ColorPickerProps): JSX.Element {
  return (
    <Field
      id={props.id}
      label={props.label}
      description={props.description}
      error={props.error}
      required={props.required}
      disabled={props.disabled}
    >
      <ColorPickerControl {...props} />
    </Field>
  )
}
