import type { AnyFormApi } from '@tanstack/solid-form'
import { type Accessor, createSignal, onCleanup } from 'solid-js'
import { type ConfigStorage, createConfigStore } from '../config-store'

/**
 * Draft autosave for a live form.
 *
 * `isDirty`-driven and debounced: every change re-arms the timer, and when it
 * fires the form validates itself before anything is written — an invalid
 * document is never saved behind the user's back. Drafts persist through the
 * config store under the `newui.form-draft` namespace (document name = `id`),
 * so a closed tab loses nothing.
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
  /** Whether a stored draft exists. */
  hasDraft: Accessor<boolean>
  /** The stored draft, if any — the app decides whether to apply it. */
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

export function createAutoSave<T extends object>(
  form: AnyFormApi,
  options: AutoSaveOptions<T>,
): AutoSave<T> {
  const debounce = options.debounce ?? 800
  const store = options.id
    ? createConfigStore({ key: 'newui.form-draft', storage: options.storage })
    : undefined

  let lastSaved: T = clone(form.state.values as T)
  let running: Promise<void> = Promise.resolve()
  let timer: ReturnType<typeof setTimeout> | undefined
  const [saving, setSaving] = createSignal(false)
  const [saved, setSaved] = createSignal(false)
  const [dirty, setDirty] = createSignal(false)

  const run = async (): Promise<void> => {
    const values = clone(form.state.values as T)
    if (deepEqual(values, lastSaved)) return
    if (options.filter && !options.filter(values)) return
    setSaving(true)
    try {
      await form.validateAllFields('submit')
      if ((form.state.errors as unknown[]).length === 0) {
        await options.save(values)
        lastSaved = values
        setSaved(true)
        setDirty(false)
        if (store && options.id) store.remove(options.id)
      }
    } finally {
      setSaving(false)
    }
  }

  const subscription = form.store.subscribe(() => {
    const values = form.state.values as T
    if (deepEqual(values, lastSaved)) return
    setDirty(true)
    setSaved(false)
    if (store && options.id)
      store.save(options.id, values, { type: 'form-draft' })
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
    hasDraft: () =>
      store !== undefined && options.id !== undefined
        ? store.load(options.id) !== undefined
        : false,
    restoreDraft: () =>
      store && options.id ? store.load<T>(options.id)?.doc : undefined,
    discardDraft: () => {
      if (store && options.id) store.remove(options.id)
    },
  }
}
