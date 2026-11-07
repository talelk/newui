import { render, screen, waitFor } from '@solidjs/testing-library'
import type { StandardSchemaV1 } from '@tanstack/solid-form'
import userEvent from '@testing-library/user-event'
import { createRoot } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { type FieldConfig, hiddenPaths, pruneHiddenValues } from './config'
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

  it('drops a hidden row field from its row and keeps the row', () => {
    const values = {
      items: [
        { kind: 'file', url: 'x' },
        { kind: 'link', url: 'y' },
      ],
    }
    const pruned = pruneHiddenValues(values, rowUi)
    expect(pruned.items).toEqual([{ kind: 'file' }, { kind: 'link', url: 'y' }])
    expect(values.items[0]).toEqual({ kind: 'file', url: 'x' })
  })
})

/** A repeater whose `url` row field shows only for `link` rows. */
// biome-ignore lint/suspicious/noExplicitAny: fixtures shared across documents of different shapes.
const rowUi: Record<string, FieldConfig<any>> = {
  items: {
    type: 'repeater',
    fields: {
      kind: { type: 'text' },
      url: { when: (row: { kind: string }) => row.kind === 'link' },
    },
  },
}

describe('hiddenPaths', () => {
  it('lists the paths whose when is false', () => {
    const ui = {
      a: { when: (v: { on: boolean }) => v.on },
      b: { when: () => true },
    }
    expect(hiddenPaths({ on: false }, ui)).toEqual(['a'])
  })

  it('expands a row field per row, passing the row and the form values', () => {
    const values = {
      flag: true,
      items: [{ kind: 'file' }, { kind: 'link' }, { kind: 'file' }],
    }
    expect(hiddenPaths(values, rowUi)).toEqual(['items[0].url', 'items[2].url'])
    const seen: unknown[] = []
    hiddenPaths(values, {
      items: {
        fields: {
          url: {
            when: (row: unknown, all: unknown) => {
              seen.push([row, all])
              return true
            },
          },
        },
      },
    })
    expect(seen[0]).toEqual([{ kind: 'file' }, values])
  })

  it('does not expand the rows of a hidden repeater', () => {
    const values = { on: false, items: [{ kind: 'file' }] }
    expect(
      hiddenPaths(values, {
        items: { ...rowUi['items'], when: (v: typeof values) => v.on },
      }),
    ).toEqual(['items'])
  })
})

describe('createAppForm field-map keys', () => {
  it('rejects a key that names an array position', () => {
    expect(() =>
      createRoot(() =>
        createAppForm({
          defaultValues: { items: [] as unknown[] },
          ui: { 'items[1]': { when: () => false } },
          onSubmit: () => {},
        }),
      ),
    ).toThrow(/static path/)
  })

  it('does not block submit on an issue under a hidden row field', async () => {
    const onSubmit = vi.fn()
    const rowSchema: StandardSchemaV1<RowDoc, RowDoc> = {
      '~standard': {
        version: 1,
        vendor: 'test',
        validate: (value) => {
          const doc = value as RowDoc
          const issues = doc.items.flatMap((row, index) =>
            row.url === undefined || row.url === ''
              ? [
                  {
                    message: 'URL is required.',
                    path: [{ key: 'items' }, { key: index }, { key: 'url' }],
                  },
                ]
              : [],
          )
          return issues.length ? { issues } : { value: doc }
        },
      },
    }
    let app!: ReturnType<typeof createAppForm<RowDoc>>
    createRoot(() => {
      app = createAppForm<RowDoc>({
        defaultValues: {
          items: [
            { kind: 'file', url: '' },
            { kind: 'link', url: 'https://a' },
          ],
        },
        schema: rowSchema,
        ui: rowUi,
        onSubmit,
      })
    })
    await app.form.handleSubmit()
    expect(onSubmit).toHaveBeenCalledWith(
      { items: [{ kind: 'file' }, { kind: 'link', url: 'https://a' }] },
      expect.anything(),
    )
  })
})

describe('createAppForm hidden requirements', () => {
  it('does not block submit when the schema requires a hidden top-level field', async () => {
    type Doc = { mode: string; host?: string }
    const onSubmit = vi.fn()
    let app!: ReturnType<typeof createAppForm<Doc>>
    createRoot(() => {
      app = createAppForm<Doc>({
        defaultValues: { mode: 'simple', host: '' },
        schema: {
          '~standard': {
            version: 1,
            vendor: 'test',
            validate: (value) =>
              (value as Doc).host
                ? { value: value as Doc }
                : {
                    issues: [{ message: 'Host is required.', path: ['host'] }],
                  },
          },
        },
        ui: { host: { when: (values) => values.mode === 'advanced' } },
        onSubmit,
      })
    })
    await app.form.handleSubmit()
    expect(onSubmit).toHaveBeenCalledWith({ mode: 'simple' }, expect.anything())
  })
})

interface RowDoc {
  items: { kind: string; url?: string }[]
}

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
