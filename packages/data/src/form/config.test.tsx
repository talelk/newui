import { render, screen, waitFor } from '@solidjs/testing-library'
import type { StandardSchemaV1 } from '@tanstack/solid-form'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { hiddenPaths, pruneHiddenValues } from './config'
import { createAppForm, Form } from './form'

/** A minimal Standard Schema: `name` must be non-empty, `city` must be a URL. */
function schema(): StandardSchemaV1<
  Record<string, unknown>,
  Record<string, unknown>
> {
  return {
    '~standard': {
      version: 1,
      vendor: 'test',
      validate: (value) => {
        const issues: { message: string; path: { key: string }[] }[] = []
        const doc = value as Record<string, unknown>
        if (!doc['name'])
          issues.push({ message: 'Name is required.', path: [{ key: 'name' }] })
        if (doc['city'] && !String(doc['city']).startsWith('http'))
          issues.push({
            message: 'City must be a URL.',
            path: [{ key: 'city' }],
          })
        return issues.length
          ? { issues }
          : { value: value as Record<string, unknown> }
      },
    },
  }
}

describe('pruneHiddenValues', () => {
  it('drops a hidden nested field and leaves the rest', () => {
    const values = { mode: 'simple', smtp: { host: 'a', port: 25 } }
    const pruned = pruneHiddenValues(values, {
      smtp: { when: (v) => v.mode === 'advanced' },
    })
    expect(pruned).toEqual({ mode: 'simple' })
    // The original is never mutated.
    expect(values.smtp.host).toBe('a')
  })

  it('drops indexed paths', () => {
    const values = { items: [{ keep: true }, { drop: true }] }
    const pruned = pruneHiddenValues(values, {
      'items[1]': { when: () => false },
    })
    expect(pruned.items).toHaveLength(1)
    expect(pruned.items[0]).toEqual({ keep: true })
  })
})

describe('hiddenPaths', () => {
  it('lists the paths whose when is false', () => {
    const ui = {
      a: { when: (v: { on: boolean }) => v.on },
      b: { when: () => true },
    }
    expect(hiddenPaths({ on: false }, ui)).toEqual(['a'])
  })
})

function Harness(props: {
  onSubmit: (value: Record<string, unknown>) => void
  pruneHidden?: boolean
}): import('solid-js').JSX.Element {
  // A test harness: `onSubmit`/`pruneHidden` configure the form once, so these
  // are setup-time reads of static props, not tracked ones.
  /* eslint-disable solid/reactivity */
  const { form } = createAppForm<Record<string, unknown>>({
    defaultValues: { mode: 'simple', name: '', city: '' },
    schema: schema(),
    ui: {
      mode: { type: 'text' },
      name: { type: 'text' },
      city: {
        type: 'text',
        dependsOn: ['mode'],
        when: (values) => values['mode'] === 'advanced',
      },
    },
    pruneHidden: props.pruneHidden,
    onSubmit: props.onSubmit,
  })
  /* eslint-enable solid/reactivity */
  return (
    <Form form={form}>
      <form.Field name="mode">
        {(field) => (
          <select
            aria-label="Mode"
            value={field().state.value as string}
            onChange={(event) =>
              field().handleChange(event.currentTarget.value)
            }
          >
            <option value="simple">simple</option>
            <option value="advanced">advanced</option>
          </select>
        )}
      </form.Field>
      <form.Field name="name">
        {(field) => (
          <input
            aria-label="Name"
            value={field().state.value as string}
            onInput={(event) => field().handleChange(event.currentTarget.value)}
          />
        )}
      </form.Field>
      <button type="submit">Save</button>
    </Form>
  )
}

describe('createAppForm with schema + ui', () => {
  it('prunes a hidden field from the submitted document', async () => {
    const onSubmit = vi.fn()
    render(() => <Harness onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Name'), 'Ada')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    // city is hidden under mode=simple, so it is not part of the document.
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ mode: 'simple', name: 'Ada' })
  })

  it('keeps the field when pruneHidden is false', async () => {
    const onSubmit = vi.fn()
    render(() => <Harness onSubmit={onSubmit} pruneHidden={false} />)
    await userEvent.type(screen.getByLabelText('Name'), 'Ada')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      mode: 'simple',
      name: 'Ada',
      city: '',
    })
  })

  it('blocks submit while a visible required field is empty', async () => {
    const onSubmit = vi.fn()
    render(() => <Harness onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    // The schema rejects the empty name; onSubmit never runs.
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
