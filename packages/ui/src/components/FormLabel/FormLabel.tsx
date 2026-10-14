import { type JSX, Show, splitProps } from 'solid-js'
import { cn } from '../../lib/tv'

export interface FormLabelProps {
  /** Text content of the label. */
  label: JSX.Element
  /** `id` of the control this label is for; wired to `for`. */
  id?: string
  /** `id` for the label element itself, so a control can use `aria-labelledby`. */
  labelId?: string
  /** Renders the required indicator (asterisk + `sr-only` note). */
  required?: boolean
  /** Dims the label to match a disabled control. */
  disabled?: boolean
  class?: string
}

/**
 * A form label on the fixed label typography: 13px (`text-sm`), `leading-tighter`,
 * `ink-gray-6` (or `ink-gray-4` when disabled). It does not follow the control's
 * `size` — a label reads the same whatever box sits under it.
 *
 * This is the public half of the shared labelling contract (P5). It is
 * deliberately a sibling of `Field`'s inline label rather than a shared import:
 * `Field` lives in `lib/` and must not depend on `components/` (the
 * dependency-cruiser rule), so the markup is transcribed rather than shared.
 */
export function FormLabel(props: FormLabelProps): JSX.Element {
  const [local] = splitProps(props, [
    'label',
    'id',
    'labelId',
    'required',
    'disabled',
    'class',
  ])

  return (
    <label
      id={local.labelId}
      for={local.id}
      data-slot="label"
      class={cn(
        'block text-sm leading-tighter',
        local.disabled ? 'text-ink-gray-4' : 'text-ink-gray-6',
        local.class,
      )}
    >
      {local.label}
      <Show when={local.required}>
        <span class="select-none text-ink-red-5" aria-hidden="true">
          {' *'}
        </span>
        <span class="sr-only">(required)</span>
      </Show>
    </label>
  )
}
