import { createForm } from '@tanstack/solid-form'
import { type Accessor, type JSX, splitProps } from 'solid-js'

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
  const form = createForm(() => ({
    defaultValues: options.defaultValues,
    onSubmit: async ({ value, formApi }) => {
      await options.onSubmit(value as T, { reset: () => formApi.reset() })
    },
  }))
  const submitting = form.useSelector((state) => state.isSubmitting)
  return {
    form,
    /** True while the submit handler's promise is pending. */
    submitting: submitting as Accessor<boolean>,
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
