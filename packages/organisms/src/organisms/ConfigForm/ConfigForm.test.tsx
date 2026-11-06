import { render, screen } from '@solidjs/testing-library'
import { createForm } from '@tanstack/solid-form'
import userEvent from '@testing-library/user-event'
import { createRoot } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { ConfigForm, type ConfigFormField } from './index'

function makeForm<T>(values: T) {
  let form: any
  createRoot(() => {
    form = createForm(() => ({ defaultValues: values }))
  })
  return form
}

describe('ConfigForm', () => {
  it('renders and binds fields from the field map', async () => {
    const form = makeForm({ name: '', notify: false })
    const fields: Record<
      string,
      ConfigFormField<{ name: string; notify: boolean }>
    > = {
      name: { type: 'text', label: 'Name' },
      notify: { type: 'checkbox', label: 'Notify' },
    }
    render(() => <ConfigForm form={form} fields={fields} />)

    const name = screen.getByLabelText('Name')
    await userEvent.type(name, 'Ada')
    expect(name).toHaveValue('Ada')
    expect(form.state.values.name).toBe('Ada')
  })

  it('hides a field whose when is false', () => {
    const form = makeForm({ mode: 'simple', host: '' })
    const fields: Record<
      string,
      ConfigFormField<{ mode: string; host: string }>
    > = {
      mode: { type: 'text', label: 'Mode' },
      host: {
        type: 'text',
        label: 'Host',
        when: (values) => values.mode === 'advanced',
      },
    }
    render(() => <ConfigForm form={form} fields={fields} />)
    expect(screen.queryByLabelText('Host')).toBeNull()
  })

  it('shows the field when the when flips true', async () => {
    const form = makeForm({ mode: 'simple', host: '' })
    const fields: Record<
      string,
      ConfigFormField<{ mode: string; host: string }>
    > = {
      mode: { type: 'text', label: 'Mode' },
      host: {
        type: 'text',
        label: 'Host',
        when: (values) => values.mode === 'advanced',
      },
    }
    render(() => <ConfigForm form={form} fields={fields} />)
    const mode = screen.getByLabelText('Mode')
    await userEvent.clear(mode)
    await userEvent.type(mode, 'advanced')
    expect(screen.getByLabelText('Host')).toBeInTheDocument()
  })

  it('renders a repeater for a repeater field', async () => {
    const form = makeForm({ items: [{ title: 'a' }] })
    const fields: Record<
      string,
      ConfigFormField<{ items: { title: string }[] }>
    > = {
      items: {
        type: 'repeater',
        fields: { title: { type: 'text', label: 'Title' } },
      },
    }
    render(() => <ConfigForm form={form} fields={fields} />)
    expect(screen.getByLabelText('Title')).toHaveValue('a')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getAllByLabelText('Title')).toHaveLength(2)
  })
})
