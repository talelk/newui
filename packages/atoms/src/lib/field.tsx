import {
  createContext,
  createUniqueId,
  type JSX,
  type ParentComponent,
  Show,
  useContext,
} from 'solid-js'
import { cn } from './tv'

/**
 * The shared labelling contract every input control exposes (frappe-ui's P5).
 *
 * Labels and supporting copy use the shared 12px/16px caption role.
 * A `space-y-1.5` stack separates the control from its help and alert region.
 */
export interface FieldContextValue {
  controlId: () => string
  labelId: () => string
  descriptionId: () => string
  errorId: () => string
  hasLabel: () => boolean
  hasError: () => boolean
  required: () => boolean
  describedBy: () => string | undefined
}

const FieldContext = createContext<FieldContextValue>()

export function useField() {
  return useContext(FieldContext)
}

export interface FieldProps {
  id?: string
  label?: JSX.Element
  description?: JSX.Element
  error?: JSX.Element | false
  required?: boolean
  disabled?: boolean
  /** Internal composition: the control renders its own native inline label. */
  inlineLabel?: boolean
  class?: string
  children: JSX.Element
}

/** Shared required marker for native inline labels and the standard label. */
export const FieldLabelContent: ParentComponent<{ required?: boolean }> = (
  props,
) => (
  <>
    {props.children}
    <Show when={props.required}>
      <span class="text-ink-red-5" aria-hidden="true">
        {' *'}
      </span>
      <span class="sr-only">{' (required)'}</span>
    </Show>
  </>
)

export const Field: ParentComponent<FieldProps> = (props) => {
  // The generated half of the id never changes; the caller's `id` may.
  const fallbackId = createUniqueId()
  const base = () => props.id ?? `field-${fallbackId}`
  const labelId = () => `${base()}-label`
  const descriptionId = () => `${base()}-description`
  const errorId = () => `${base()}-error`

  const hasError = () => Boolean(props.error)

  const describedBy = () => {
    const ids: string[] = []
    if (props.description) ids.push(descriptionId())
    if (hasError()) ids.push(errorId())
    return ids.length ? ids.join(' ') : undefined
  }

  const value: FieldContextValue = {
    controlId: base,
    labelId,
    descriptionId,
    errorId,
    hasError,
    hasLabel: () => Boolean(props.label),
    required: () => Boolean(props.required),
    describedBy,
  }

  return (
    <FieldContext.Provider value={value}>
      <div
        data-slot="field"
        data-invalid={hasError() ? '' : undefined}
        class={cn('relative space-y-1.5', props.class)}
      >
        <Show when={props.label && !props.inlineLabel}>
          <label
            id={labelId()}
            for={base()}
            data-slot="label"
            class={cn(
              'block text-caption font-medium',
              props.disabled ? 'text-ink-gray-4' : 'text-ink-gray-6',
            )}
          >
            <FieldLabelContent required={props.required}>
              {props.label}
            </FieldLabelContent>
          </label>
        </Show>

        {props.children}

        <Show when={props.description}>
          <p
            id={descriptionId()}
            data-slot="description"
            class="text-caption text-ink-gray-6"
          >
            {props.description}
          </p>
        </Show>

        <Show when={hasError()}>
          <div
            id={errorId()}
            data-slot="error"
            role="alert"
            class="whitespace-pre-line text-caption text-ink-red-7"
          >
            {props.error}
          </div>
        </Show>
      </div>
    </FieldContext.Provider>
  )
}
