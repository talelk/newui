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
 * The rendered classes are frappe-ui's, so an input looks the same here as it
 * does there: a 13px label pinned to `leading-tighter`, `text-p-sm` helper and
 * error text, a `space-y-1.5` stack, and an error region that is `role="alert"`.
 */
export interface FieldContextValue {
  controlId: () => string
  labelId: () => string
  descriptionId: () => string
  errorId: () => string
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
  class?: string
  children: JSX.Element
}

export const Field: ParentComponent<FieldProps> = (props) => {
  // The generated half of the id never changes; the caller's `id` may.
  const fallbackId = createUniqueId()
  const base = () => props.id ?? `field-${fallbackId}`
  const labelId = () => `${base()}-label`
  const descriptionId = () => `${base()}-description`
  const errorId = () => `${base()}-error`

  const hasError = () => props.error !== undefined && props.error !== false

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
    required: () => Boolean(props.required),
    describedBy,
  }

  return (
    <FieldContext.Provider value={value}>
      <div class={cn('space-y-1.5', props.class)}>
        <Show when={props.label}>
          <label
            id={labelId()}
            for={base()}
            data-slot="label"
            class={cn(
              'block text-sm leading-tighter',
              props.disabled ? 'text-ink-gray-4' : 'text-ink-gray-6',
            )}
          >
            {props.label}
            <Show when={props.required}>
              <span class="text-ink-red-5" aria-hidden="true">
                {' *'}
              </span>
              <span class="sr-only">(required)</span>
            </Show>
          </label>
        </Show>

        {props.children}

        <Show when={props.description}>
          <p
            id={descriptionId()}
            data-slot="description"
            class={cn(
              'text-p-sm',
              props.disabled ? 'text-ink-gray-4' : 'text-ink-gray-6',
            )}
          >
            {props.description}
          </p>
        </Show>

        <Show when={hasError()}>
          <div
            id={errorId()}
            data-slot="error"
            role="alert"
            class="whitespace-pre-line text-p-sm text-ink-red-7"
          >
            {props.error}
          </div>
        </Show>
      </div>
    </FieldContext.Provider>
  )
}
