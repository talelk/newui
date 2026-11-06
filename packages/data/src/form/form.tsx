import {
  createForm,
  type StandardSchemaV1,
  standardSchemaValidators,
} from '@tanstack/solid-form'
import { type Accessor, type JSX, splitProps } from 'solid-js'
import {
  type FieldConfig,
  hiddenPaths,
  isUnderHidden,
  pruneHiddenValues,
} from './config'

/**
 * The form surface: the kit's answer to "how does a page submit".
 *
 * TanStack Form stays the engine — validators, field state, reset. What this
 * adds is the three things every page was writing by hand: a submit lifecycle
 * the button can read, a `<form>` that never lets the browser's native
 * validation paint first, and one place that turns a field's error list into the
 * single `error` string the kit's `Field` contract takes.
 */

export interface AppFormOptions<T extends object> {
  defaultValues: T
  /**
   * Runs on submit. While the returned promise is pending the form reports
   * `submitting()`, which is what a submit button's `loading` reads.
   */
  onSubmit: (value: T, api: { reset: () => void }) => void | Promise<void>
  /**
   * A Standard Schema (Zod, Valibot, Ark) — the document, validated on change
   * and on submit, with issues mapped onto fields. The schema must validate
   * synchronously; an async one belongs in the submit handler.
   */
  schema?: StandardSchemaV1<T, T>
  /**
   * The sidecar that says how to render, keyed by field path. The engine reads
   * `when` (for pruning and for dropping issues on hidden paths) and
   * `dependsOn` (for revalidation); the rest is renderer vocabulary that the
   * `ConfigForm` organism consumes from the same object.
   */
  ui?: Record<string, FieldConfig<T>>
  /**
   * Drop fields hidden by `when` from the submitted document.
   * @default true
   */
  pruneHidden?: boolean
}

/** The `error` prop of a field, from TanStack's error list. */
export function fieldError(field: {
  state: { meta: { errors: unknown[] } }
}): string | undefined {
  const { errors } = field.state.meta
  if (errors.length === 0) return undefined
  const messages = errors.map((error) =>
    typeof error === 'string'
      ? error
      : error && typeof error === 'object' && 'message' in error
        ? String((error as { message: unknown }).message)
        : String(error),
  )
  // A field usually declares the same message for `onChange` and `onSubmit`
  // (validate as you type, and again on the way out). TanStack keeps one entry
  // per validator, so the naive join prints the sentence twice.
  return [...new Set(messages)].join(' ')
}

export function createAppForm<T extends object>(options: AppFormOptions<T>) {
  const ui = options.ui ?? {}
  const prune = options.pruneHidden !== false
  const hasDeps = Object.values(ui).some((config) => config.dependsOn?.length)

  /** The document the backend should see: hidden fields are not part of it. */
  const submitted = (values: T): T =>
    prune ? pruneHiddenValues(values, ui) : values

  /**
   * The schema validates the document that would be submitted, and issues on
   * hidden paths are dropped: a field the user cannot see must not block the
   * submit, and a hidden setting is not required of the document.
   */
  const schema = options.schema
  const schemaValidator = schema
    ? ({ value }: { value: unknown }) => {
        const values = value as T
        const issues = standardSchemaValidators.validate(
          { value: submitted(values), validationSource: 'form' },
          schema,
        )
        if (!issues?.fields) return issues
        const hidden = hiddenPaths(values, ui)
        if (hidden.length === 0) return issues
        return {
          ...issues,
          fields: Object.fromEntries(
            Object.entries(issues.fields).filter(
              ([path]) => !isUnderHidden(path, hidden),
            ),
          ),
        }
      }
    : undefined

  const form = createForm(() => ({
    defaultValues: options.defaultValues,
    validators: schemaValidator
      ? { onChange: schemaValidator, onSubmit: schemaValidator }
      : undefined,
    // `dependsOn` compiles onto TanStack's listeners: a dependency's change
    // revalidates the dependent field with the `dynamic` cause. Visibility
    // itself needs no wiring — `when` reads the form's reactive values.
    listeners: hasDeps
      ? {
          onChange: ({ formApi, fieldApi }) => {
            for (const [path, config] of Object.entries(ui)) {
              if (config.dependsOn?.includes(String(fieldApi.name))) {
                void formApi.validateField(path, 'dynamic')
              }
            }
          },
        }
      : undefined,
    onSubmit: async ({ value, formApi }) => {
      await options.onSubmit(submitted(value as T), {
        reset: () => formApi.reset(),
      })
    },
  }))
  const submitting = form.useSelector((state) => state.isSubmitting)
  return {
    form,
    /** True while the submit handler's promise is pending. */
    submitting: submitting as Accessor<boolean>,
    /** The sidecar, resolved to a map. Pass it to `ConfigForm`'s `fields`. */
    ui,
  }
}

/**
 * The `<form>` element, wired.
 *
 * `noValidate` because the kit's own field messages are the error UI; the native
 * bubble would appear first, say less, and disappear on the next keystroke.
 * `preventDefault` because this is a single-page app: a real submit would
 * navigate.
 */
export function Form(props: {
  form: { handleSubmit: () => unknown }
  children: JSX.Element
  class?: string
}): JSX.Element {
  const [local, rest] = splitProps(props, ['form', 'children', 'class'])
  return (
    <form
      {...rest}
      noValidate
      class={local.class}
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void local.form.handleSubmit()
      }}
    >
      {local.children}
    </form>
  )
}
