import type { InputSize, InputVariant } from '@talelk/newui-atoms'
import {
  cn,
  controlDensity,
  createControllableSignal,
  createId,
  disabledPopup,
  Field,
  fieldFocusWithin,
  invalidField,
  textFieldVariants,
  useField,
} from '@talelk/newui-atoms/internal'
import { For, type JSX, splitProps } from 'solid-js'

export type TagInputSize = InputSize
export type TagInputVariant = InputVariant

export interface TagInputProps {
  /** Controlled tokens. */
  value?: string[]
  /** Uncontrolled initial tokens. */
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  /** Shared labelling contract (P5). */
  label?: JSX.Element
  description?: JSX.Element
  error?: JSX.Element | false
  required?: boolean
  disabled?: boolean
  /** Rejects a token when the list already holds it. Default `true`. */
  unique?: boolean
  /** Caps the list; further entries are ignored. */
  max?: number
  name?: string
  id?: string
  /** Accessible name when no visible `label` is rendered. */
  'aria-label'?: string
  /** @default sm */
  size?: TagInputSize
  variant?: TagInputVariant
  class?: string
}

// Tokens wrap, so the control floors at the density min-height rather than
// the fixed field height — geometry and surface still come from the shared
// density table + `textFieldVariants` (control-styles), never local maps.
const controlGeometry = (size: TagInputSize): string =>
  `${controlDensity[size].minHeight} rounded-control ${controlDensity[size].text}`

/**
 * A token editor: type and press Enter or comma to add a tag, Backspace on
 * the empty input removes the last one, and every tag carries its own remove
 * button. The list is plain state — validation (email, length, vocabulary)
 * belongs to the form around it.
 */
export function TagInput(props: TagInputProps): JSX.Element {
  const [local] = splitProps(props, [
    'label',
    'description',
    'error',
    'required',
    'disabled',
    'id',
  ])
  return (
    <Field
      id={local.id}
      label={local.label}
      description={local.description}
      error={local.error}
      required={local.required}
      disabled={local.disabled}
    >
      <TagInputControl {...props} />
    </Field>
  )
}

type ControlProps = Omit<
  TagInputProps,
  'label' | 'description' | 'error' | 'required'
>

function TagInputControl(props: ControlProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'onValueChange',
    'placeholder',
    'disabled',
    'unique',
    'max',
    'size',
    'variant',
    'class',
    'id',
  ])
  const field = useField()
  const inputId = createId('tag-input')
  const size = () => local.size ?? 'sm'

  const [tags, setTags] = createControllableSignal<string[]>({
    value: () => local.value,
    defaultValue: local.defaultValue ?? [],
    onChange: (next) => local.onValueChange?.(next),
  })

  let input: HTMLInputElement | undefined

  const commit = (raw: string) => {
    const token = raw.trim()
    if (!token || local.disabled) return
    if (local.unique !== false && tags().includes(token)) return
    if (local.max !== undefined && tags().length >= local.max) return
    setTags([...tags(), token])
    if (input) input.value = ''
  }

  const remove = (token: string) => {
    if (local.disabled) return
    setTags(tags().filter((entry) => entry !== token))
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commit(input?.value ?? '')
    } else if (
      event.key === 'Backspace' &&
      input?.value === '' &&
      tags().length > 0
    ) {
      event.preventDefault()
      setTags(tags().slice(0, -1))
    }
  }

  return (
    <div
      data-slot="tag-input"
      data-size={size()}
      data-variant={local.variant ?? 'outline'}
      data-invalid={field?.hasError() ? '' : undefined}
      data-disabled={local.disabled ? '' : undefined}
      class={cn(
        'flex w-full flex-wrap items-center gap-1 px-1.5 py-1 transition-colors',
        controlGeometry(size()),
        textFieldVariants[local.variant ?? 'outline'],
        fieldFocusWithin,
        invalidField,
        disabledPopup,
        local.class,
      )}
    >
      <For each={tags()}>
        {(tag) => (
          <span
            data-slot="tag-input-token"
            class="inline-flex max-w-full items-center gap-1 rounded-control bg-surface-gray-3 py-0.5 ps-2 text-xs text-ink-gray-8"
          >
            <span class="truncate">{tag}</span>
            <button
              type="button"
              data-slot="tag-input-remove"
              disabled={local.disabled}
              aria-label={`Remove ${tag}`}
              onClick={() => remove(tag)}
              class="grid size-4 shrink-0 cursor-pointer place-items-center rounded-1 text-ink-gray-6 hover:bg-surface-gray-4 hover:text-ink-gray-9 focus-visible:focus-ring disabled:pointer-events-none"
            >
              <span class="lucide-x size-3" aria-hidden="true" />
            </button>
          </span>
        )}
      </For>
      <input
        {...rest}
        ref={input}
        data-slot="tag-input-field"
        type="text"
        id={local.id ?? field?.controlId() ?? inputId}
        placeholder={local.placeholder}
        disabled={local.disabled}
        onKeyDown={onKeyDown}
        aria-invalid={field?.hasError() ? 'true' : undefined}
        aria-required={field?.required() ? 'true' : undefined}
        aria-describedby={field?.describedBy()}
        aria-errormessage={field?.hasError() ? field?.errorId() : undefined}
        onBlur={(event) => {
          // Committed on blur too: a typed token survives tabbing away.
          commit(event.currentTarget.value)
        }}
        class="min-w-16 flex-1 bg-transparent py-0.5 outline-none placeholder:text-ink-gray-6 disabled:cursor-not-allowed"
      />
    </div>
  )
}
