import { createSignal, type JSX, Show, splitProps } from 'solid-js'
import { Field, FieldLabelContent, useField } from '../../lib/field'
import { cn } from '../../lib/tv'

type CheckboxSize = 'xs' | 'sm' | 'md'

export interface CheckboxProps {
  checked?: boolean
  defaultChecked?: boolean
  indeterminate?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  /** Size of the box. Defaults to `sm`, matching every other input. */
  size?: CheckboxSize
  /**
   * Wraps the control and label in a clickable surface with hover, active and
   * focus states — useful for selection lists and menu items. The control always
   * stays on the leading side.
   */
  padded?: boolean
  label?: JSX.Element
  description?: JSX.Element
  name?: string
  id?: string
  error?: JSX.Element | false
  required?: boolean
  class?: string
}

const SIZE: Record<CheckboxSize, string> = {
  xs: 'size-[13px]',
  sm: 'size-3.5',
  md: 'size-4',
}

/**
 * A native `<input type="checkbox">`, styled by `@tailwindcss/forms`.
 *
 * Native rather than a machine: the browser already gives a checkbox its
 * keyboard behaviour, its `indeterminate` property and its form semantics, and
 * a styled input is what makes the control read the same as the rest of the
 * grayscale system (`text-*` drives the checked fill, per the forms plugin).
 */
function CheckboxControl(props: CheckboxProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'checked',
    'defaultChecked',
    'indeterminate',
    'onCheckedChange',
    'disabled',
    'size',
    'padded',
    'label',
    'description',
    'name',
    'class',
    'id',
    'error',
    'required',
  ])
  const [internal, setInternal] = createSignal(local.defaultChecked ?? false)
  const field = useField()
  const isControlled = () => local.checked !== undefined
  const checked = () => (isControlled() ? local.checked : internal())
  const size = () => local.size ?? 'sm'
  const hasDetail = () => Boolean(local.description)

  const toggle = () => {
    const next = !checked()
    if (!isControlled()) setInternal(next)
    local.onCheckedChange?.(next)
  }

  // When padded the whole row is the surface (frappe's selection-list row):
  // fixed-height compact rows for a label-only control, growing with vertical
  // padding once a description makes it multi-line.
  const containerClasses = () => {
    if (!local.padded) return undefined
    const sizeClass = hasDetail()
      ? size() === 'md'
        ? 'px-3 py-2'
        : 'px-1.5 py-1.5'
      : size() === 'md'
        ? 'h-8 px-3'
        : size() === 'sm'
          ? 'h-7 px-1.5'
          : 'h-6 px-1.5'
    return cn(
      'group rounded-4 transition-colors',
      sizeClass,
      !hasDetail() && 'justify-center',
      local.disabled
        ? 'cursor-not-allowed'
        : 'cursor-pointer hover:bg-surface-gray-3 active:bg-surface-gray-4 [&:has(:focus-visible)]:ring-2 [&:has(:focus-visible)]:ring-outline-gray-3',
    )
  }

  const inputClasses = () => {
    const base = cn(SIZE[size()], 'shrink-0 rounded-1 bg-surface-base')
    if (local.disabled) {
      return cn(
        base,
        'cursor-not-allowed border-outline-gray-3 text-ink-gray-5',
        'focus:ring-0 focus:ring-offset-0',
      )
    }
    return cn(
      base,
      'border-outline-gray-4 transition',
      // The `@tailwindcss/forms` checkmark is white and its `:checked` fill is
      // `currentColor` — but a `bg-*` utility outranks that base-layer rule, so
      // without an explicit checked fill the box stays `surface-base` and the
      // white check is invisible in light mode.
      'text-ink-gray-9 checked:bg-ink-gray-9 indeterminate:bg-ink-gray-9',
      // Padded rows drive hover from the row (`group`); otherwise the box does.
      local.padded
        ? 'group-hover:border-outline-gray-5'
        : 'hover:border-outline-gray-5 active:border-outline-gray-6',
      'focus:ring-0 focus:ring-offset-0 focus-visible:focus-ring-blue aria-[invalid=true]:border-outline-red-6',
    )
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the padded surface forwards clicks from its padding to the control; the row label is the real interactive element.
    // biome-ignore lint/a11y/useKeyWithClickEvents: the control stays keyboard-reachable through the hidden input.
    <div
      data-slot="checkbox-root"
      class={cn(
        'relative flex-col gap-1',
        local.padded ? 'flex' : 'inline-flex',
        containerClasses(),
        local.class,
      )}
      onClick={(event) => {
        // The row (`data-slot="checkbox"`) toggles itself natively; only the
        // surrounding padding of a padded surface needs forwarding.
        if (!local.padded || local.disabled) return
        if ((event.target as HTMLElement).closest('[data-slot="checkbox"]'))
          return
        toggle()
      }}
    >
      <label
        data-slot="checkbox"
        class={cn(
          'inline-flex items-center gap-2 rounded-4',
          local.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        )}
      >
        <input
          {...rest}
          ref={(el) => {
            el.indeterminate = Boolean(local.indeterminate)
          }}
          id={local.id ?? field?.controlId()}
          required={field?.required() ?? local.required}
          name={local.name}
          type="checkbox"
          checked={checked()}
          disabled={local.disabled}
          data-slot="checkbox-control"
          aria-describedby={field?.describedBy()}
          aria-invalid={field?.hasError() ? 'true' : undefined}
          aria-errormessage={field?.hasError() ? field?.errorId() : undefined}
          class={inputClasses()}
          onChange={(event) => {
            const next = event.currentTarget.checked
            if (!isControlled()) setInternal(next)
            local.onCheckedChange?.(next)
          }}
        />
        <Show when={local.label}>
          <span
            data-slot="label"
            id={field?.labelId()}
            class={cn(
              'select-none text-base leading-tighter',
              local.disabled ? 'text-ink-gray-4' : 'text-ink-gray-8',
            )}
          >
            <FieldLabelContent required={field?.required()}>
              {local.label}
            </FieldLabelContent>
          </span>
        </Show>
      </label>
      <Show when={local.description && !field}>
        <span class="ps-[1.35rem] text-p-sm text-ink-gray-6">
          {local.description}
        </span>
      </Show>
    </div>
  )
}

export function Checkbox(props: CheckboxProps): JSX.Element {
  return (
    <Field
      id={props.id}
      label={props.label}
      inlineLabel
      description={props.description}
      error={props.error}
      required={props.required}
      disabled={props.disabled}
    >
      <CheckboxControl {...props} />
    </Field>
  )
}
