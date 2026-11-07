import type { AnyFormApi } from '@tanstack/solid-form'
import { type Accessor, createSignal, onCleanup } from 'solid-js'
import { type ConfigStorage, createConfigStore } from '../config-store'

/**
 * Autosave and drafts for a live form.
 *
 * Two stores, two rules. The **autosave** is a debounced backend write of a
 * valid, pruned document: every change re-arms the timer, and when it fires
 * the form validates itself before anything is written — an invalid document
 * is never saved behind the user's back. It is not a submit; the submit
 * lifecycle does not move. The **draft** is the local, unpruned copy written
 * on every change (through the config store under `newui.form-draft`, document
 * name = `id`), so a closed tab loses nothing and re-showing a hidden field
 * gives back what was typed. A successful autosave or submit drops the draft.
 */
export interface AutoSaveOptions<T extends object> {
  /** Persists the valid, dirty document — usually a query mutation. */
  save: (values: T) => void | Promise<void>
  /**
   * Milliseconds a change waits before it is saved.
   * @default 800
   */
  debounce?: number
  /** Skips the write when it returns `false` (an unfinished required section). */
  filter?: (values: T) => boolean
  /** Draft identity. Omit it to autosave without persisting drafts. */
  id?: string
  /** Draft storage backend. Defaults to `localStorage`, like the config store. */
  storage?: ConfigStorage
}

/**
 * What autosave watches: a TanStack form, or the `createAppForm` result —
 * pass the latter so `save` receives the same pruned document submit sends.
 */
export type AutoSaveSource<T extends object> =
  | AnyFormApi
  | { form: AnyFormApi; document: (values: T) => T }

/** What `createAutoSave` returns; the chrome reads the accessors. */
export interface AutoSave<T extends object = Record<string, unknown>> {
  /** True while a save is in flight. */
  saving: Accessor<boolean>
  /** True once a save has landed and nothing has changed since. */
  saved: Accessor<boolean>
  /** True when the form holds an unsaved change. */
  dirty: Accessor<boolean>
  /** Save now instead of waiting out the debounce. */
  flush: () => Promise<void>
  /** Whether a stored draft exists, reactive. */
  hasDraft: Accessor<boolean>
  /**
   * The stored draft, if any — the app decides whether to apply it. A draft
   * may predate the current schema or field map: treat it as untrusted input
   * and let the form's validation report what no longer fits.
   */
  restoreDraft: () => T | undefined
  /** Drop the stored draft (on submit, discard, or after `restoreDraft`). */
  discardDraft: () => void
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  if (
    a === null ||
    b === null ||
    typeof a !== 'object' ||
    typeof b !== 'object'
  )
    return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const aKeys = Object.keys(a as object)
  const bKeys = Object.keys(b as object)
  if (aKeys.length !== bKeys.length) return false
  return aKeys.every(
    (key) =>
      Object.hasOwn(b, key) &&
      deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
      ),
  )
}

function isAppForm<T extends object>(
  source: AutoSaveSource<T>,
): source is { form: AnyFormApi; document: (values: T) => T } {
  return 'document' in source && typeof source.document === 'function'
}

export function createAutoSave<T extends object>(
  source: AutoSaveSource<T>,
  options: AutoSaveOptions<T>,
): AutoSave<T> {
  const form = isAppForm(source) ? source.form : source
  const document = isAppForm(source) ? source.document : (values: T) => values
  const debounce = options.debounce ?? 800
  const store = options.id
    ? createConfigStore({ key: 'newui.form-draft', storage: options.storage })
    : undefined
  const id = options.id

  let lastSaved: T = clone(form.state.values as T)
  let running: Promise<void> = Promise.resolve()
  let timer: ReturnType<typeof setTimeout> | undefined
  const [saving, setSaving] = createSignal(false)
  const [saved, setSaved] = createSignal(false)
  const [dirty, setDirty] = createSignal(false)
  const [hasDraft, setHasDraft] = createSignal(
    store !== undefined && id !== undefined && store.load(id) !== undefined,
  )
  const writeDraft = (values: T) => {
    if (!store || !id) return
    store.save(id, values, { type: 'form-draft' })
    setHasDraft(true)
  }
  const dropDraft = () => {
    if (!store || !id) return
    store.remove(id)
    setHasDraft(false)
  }
  let submissions = form.state.submissionAttempts as number

  const run = async (): Promise<void> => {
    const values = clone(form.state.values as T)
    if (deepEqual(values, lastSaved)) return
    if (options.filter && !options.filter(values)) return
    setSaving(true)
    try {
      await form.validateAllFields('submit')
      if ((form.state.errors as unknown[]).length === 0) {
        await options.save(document(values))
        lastSaved = values
        setSaved(true)
        setDirty(false)
        dropDraft()
      }
    } finally {
      setSaving(false)
    }
  }

  const subscription = form.store.subscribe(() => {
    const state = form.state
    // A successful submit wrote the document: nothing is unsaved, the draft
    // goes, and the values it sent are the new baseline.
    if (
      state.isSubmitSuccessful &&
      (state.submissionAttempts as number) !== submissions
    ) {
      submissions = state.submissionAttempts as number
      clearTimeout(timer)
      lastSaved = clone(state.values as T)
      setDirty(false)
      dropDraft()
      return
    }
    // Mid-submit changes (an `onSubmit` reset) are the submit's, not edits.
    if (state.isSubmitting) return
    const values = state.values as T
    if (deepEqual(values, lastSaved)) return
    setDirty(true)
    setSaved(false)
    writeDraft(values)
    clearTimeout(timer)
    timer = setTimeout(() => {
      running = run()
    }, debounce)
  })
  onCleanup(() => {
    clearTimeout(timer)
    subscription.unsubscribe()
  })

  return {
    saving,
    saved,
    dirty,
    async flush() {
      clearTimeout(timer)
      await running
      await run()
    },
    hasDraft,
    restoreDraft: () => (store && id ? store.load<T>(id)?.doc : undefined),
    discardDraft: dropDraft,
  }
}
