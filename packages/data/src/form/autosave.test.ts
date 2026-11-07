import { type AnyFormApi, createForm } from '@tanstack/solid-form'
import { createEffect, createRoot } from 'solid-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAutoSave } from './autosave'
import { createAppForm } from './form'

function memoryStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
    keys: () => [...map.keys()],
  }
}

function harness() {
  // `createRoot` runs its callback synchronously, so `form` is set by return.
  let form!: AnyFormApi
  createRoot((dispose) => {
    form = createForm(() => ({
      defaultValues: { name: '' } satisfies { name: string },
      validators: {
        onChange: ({ value }: { value: { name: string } }) =>
          value.name.length < 3 ? 'Too short.' : undefined,
      },
    }))
    // Keep the root alive for the duration of the test.
    void dispose
  })
  return form
}

beforeEach(() => vi.useFakeTimers())

describe('createAutoSave', () => {
  it('saves a valid dirty value after the debounce', async () => {
    const form = harness()
    const save = vi.fn()
    const auto = createAutoSave<{ name: string }>(form, { save, debounce: 100 })

    form.setFieldValue('name', 'Ada Lovelace')
    await vi.advanceTimersByTimeAsync(100)

    expect(save).toHaveBeenCalledTimes(1)
    expect(save.mock.calls[0]?.[0]).toEqual({ name: 'Ada Lovelace' })
    expect(auto.saved()).toBe(true)
    expect(auto.dirty()).toBe(false)
  })

  it('does not save while the form is invalid', async () => {
    const form = harness()
    const save = vi.fn()
    createAutoSave<{ name: string }>(form, { save, debounce: 50 })

    form.setFieldValue('name', 'ad')
    await vi.advanceTimersByTimeAsync(50)

    expect(save).not.toHaveBeenCalled()
  })

  it('skips the write when the filter rejects', async () => {
    const form = harness()
    const save = vi.fn()
    createAutoSave<{ name: string }>(form, {
      save,
      debounce: 50,
      filter: (values) => values.name !== 'skip',
    })

    form.setFieldValue('name', 'skip')
    await vi.advanceTimersByTimeAsync(50)

    expect(save).not.toHaveBeenCalled()
  })

  it('persists a draft and clears it after a successful save', async () => {
    const form = harness()
    const storage = memoryStorage()
    const save = vi.fn()
    const auto = createAutoSave<{ name: string }>(form, {
      save,
      debounce: 50,
      id: 'profile',
      storage,
    })

    form.setFieldValue('name', 'Ada Lovelace')
    // The draft is written on the change, before the debounce fires.
    expect(auto.hasDraft()).toBe(true)
    expect(auto.restoreDraft()).toEqual({ name: 'Ada Lovelace' })

    await vi.advanceTimersByTimeAsync(50)
    expect(save).toHaveBeenCalled()
    expect(auto.hasDraft()).toBe(false)
  })

  it('tracks hasDraft reactively', async () => {
    const form = harness()
    const seen: boolean[] = []
    createRoot(() => {
      const auto = createAutoSave<{ name: string }>(form, {
        save: vi.fn(),
        debounce: 50,
        id: 'reactive',
        storage: memoryStorage(),
      })
      createEffect(() => {
        seen.push(auto.hasDraft())
      })
    })
    form.setFieldValue('name', 'Ada Lovelace')
    await vi.advanceTimersByTimeAsync(50)
    expect(seen).toEqual([false, true, false])
  })
})

interface Doc {
  mode: string
  host: string
  name: string
}

/** An app form whose `host` is hidden unless `mode` is `advanced`. */
function appHarness(onSubmit: (doc: Doc) => void = () => {}) {
  let app!: ReturnType<typeof createAppForm<Doc>>
  createRoot(() => {
    app = createAppForm<Doc>({
      defaultValues: { mode: 'simple', host: 'stale.example', name: '' },
      ui: { host: { when: (values) => values.mode === 'advanced' } },
      onSubmit,
    })
  })
  return app
}

describe('createAutoSave with an app form', () => {
  it('saves the pruned document, the one submit sends', async () => {
    const app = appHarness()
    const save = vi.fn()
    createAutoSave<Doc>(app, { save, debounce: 50 })

    app.form.setFieldValue('name', 'Ada')
    await vi.advanceTimersByTimeAsync(50)

    expect(save).toHaveBeenCalledWith({ mode: 'simple', name: 'Ada' })
  })

  it('keeps the draft unpruned', () => {
    const app = appHarness()
    const auto = createAutoSave<Doc>(app, {
      save: vi.fn(),
      debounce: 50,
      id: 'settings',
      storage: memoryStorage(),
    })

    app.form.setFieldValue('name', 'Ada')

    expect(auto.restoreDraft()).toEqual({
      mode: 'simple',
      host: 'stale.example',
      name: 'Ada',
    })
  })

  it('drops the draft on a successful submit and does not autosave after it', async () => {
    const app = appHarness()
    const save = vi.fn()
    const auto = createAutoSave<Doc>(app, {
      save,
      debounce: 50,
      id: 'settings',
      storage: memoryStorage(),
    })

    app.form.setFieldValue('name', 'Ada')
    expect(auto.hasDraft()).toBe(true)
    await app.form.handleSubmit()

    expect(auto.hasDraft()).toBe(false)
    expect(auto.dirty()).toBe(false)
    await vi.advanceTimersByTimeAsync(50)
    expect(save).not.toHaveBeenCalled()
  })
})
