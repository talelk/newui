import { createSignal, type JSX, Show, splitProps } from 'solid-js'
import {
  controlFocus,
  invalidField,
  markGlyphSizes,
} from '../../lib/control-styles'
import { Field, FieldLabelContent, useField } from '../../lib/field'
import { cn, tv } from '../../lib/tv'
import { Icon } from '../Icon'

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

// State is selectors, not JS branches (P-state rule): the native input's own
// `disabled:` / `checked:` / `indeterminate:` variants own every look, with
// the shared neutral focus and red invalid edge from control-styles. The
// forms-plugin checkmark is white on a `currentColor` fill, and a `bg-*`
// utility outranks that base rule — the explicit checked fill keeps the
// check visible in light mode.
const checkboxBox = tv({
  base: [
    'shrink-0 rounded-1 border-outline-gray-4 bg-surface-base text-ink-gray-9 transition',
    'checked:bg-ink-gray-9 checked:[background-image:none] indeterminate:bg-ink-gray-9 indeterminate:[background-image:none]',
    'hover:border-outline-gray-5 active:border-outline-gray-6',
    'disabled:cursor-not-allowed disabled:border-outline-gray-3 disabled:text-ink-gray-5',
    'disabled:checked:bg-ink-gray-5 disabled:indeterminate:bg-ink-gray-5 disabled:hover:border-outline-gray-3',
    'focus:ring-0 focus:ring-offset-0',
  ],
  variants: {
    size: { xs: 'size-3.25', sm: 'size-3.5', md: 'size-4' },
    // Padded rows drive hover from the row (`group`); otherwise the box does.
    padded: { true: 'group-hover:border-outline-gray-5', false: '' },
  },
  defaultVariants: { size: 'sm', padded: false },
})

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
        : size() === 'sm'
          ? 'px-2 py-1.5'
          : 'px-1.5 py-1.5'
      : size() === 'md'
        ? 'h-8 px-3'
        : size() === 'sm'
          ? 'h-7 px-2'
          : 'h-6 px-1.5'
    return cn(
      'group rounded-card transition-colors',
      sizeClass,
      !hasDetail() && 'justify-center',
      local.disabled
        ? 'cursor-not-allowed'
        : 'cursor-pointer hover:bg-surface-gray-3 active:bg-surface-gray-4 focus-ring-within',
    )
  }

  const inputClasses = () =>
    cn(
      checkboxBox({ size: size(), padded: Boolean(local.padded) }),
      // A padded row owns the ring (focus-ring-within); standalone boxes ring.
      !local.padded && controlFocus,
      invalidField,
    )

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the padded surface forwards clicks from its padding to the control; the row label is the real interactive element.
    // biome-ignore lint/a11y/useKeyWithClickEvents: the control stays keyboard-reachable through the hidden input.
    <div
      data-slot="checkbox-root"
      data-variant={local.padded ? 'padded' : 'plain'}
      data-size={size()}
      data-state={
        local.indeterminate
          ? 'indeterminate'
          : checked()
            ? 'checked'
            : 'unchecked'
      }
      data-disabled={local.disabled ? '' : undefined}
      class={cn(
        // The root owns the label's type + ink so a dense host (a table
        // cell at caption size) cannot shrink the control's text metrics.
        'group relative flex-col gap-1 text-base text-ink-gray-8',
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
        class="inline-flex cursor-pointer items-center gap-2 rounded-card group-data-[disabled]:cursor-not-allowed"
      >
        <span class="relative inline-flex shrink-0">
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
            data-state={
              local.indeterminate
                ? 'indeterminate'
                : checked()
                  ? 'checked'
                  : 'unchecked'
            }
            data-disabled={local.disabled ? '' : undefined}
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
          <Show when={checked() || local.indeterminate}>
            <span
              data-slot="checkbox-check"
              aria-hidden="true"
              class="pointer-events-none absolute inset-0 grid place-items-center text-ink-base"
            >
              <Icon
                icon={local.indeterminate ? 'lucide-minus' : 'lucide-check'}
                class={markGlyphSizes[size()]}
              />
            </span>
          </Show>
        </span>
        <Show when={local.label}>
          <span
            data-slot="label"
            id={field?.labelId()}
            class="select-none leading-tighter group-data-[disabled]:text-ink-gray-4"
          >
            <FieldLabelContent required={field?.required()}>
              {local.label}
            </FieldLabelContent>
          </span>
        </Show>
      </label>
      <Show when={local.description && !field}>
        <span class="ps-5.5 text-p-sm text-ink-gray-6">
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
