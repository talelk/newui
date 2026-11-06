import { type AnyFormApi, createForm } from '@tanstack/solid-form'
import { createRoot } from 'solid-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAutoSave } from './autosave'

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
  let form: AnyFormApi
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
  return form!
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
})
