import { render, screen } from '@solidjs/testing-library'
import { createForm } from '@tanstack/solid-form'
import userEvent from '@testing-library/user-event'
import { createRoot, type JSX } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { Repeater, type RepeaterFormApi } from './Repeater'

function makeForm<T>(values: T): RepeaterFormApi {
  let form!: RepeaterFormApi
  createRoot(() => {
    form = createForm(() => ({ defaultValues: values }))
  })
  return form
}

function Harness(props: { maxItems?: number; minItems?: number }): JSX.Element {
  const form = makeForm<{ items: { title: string }[] }>({
    items: [{ title: 'first' }, { title: 'second' }],
  })
  return (
    <Repeater
      form={form}
      name="items"
      maxItems={props.maxItems}
      minItems={props.minItems}
      copyable
    >
      {(row) => (
        <row.Field name={`${row.name()}.title`}>
          {(field) => (
            <input
              aria-label={`Title ${row.index() + 1}`}
              value={field().state.value as string}
              onInput={(event) =>
                field().handleChange(event.currentTarget.value)
              }
            />
          )}
        </row.Field>
      )}
    </Repeater>
  )
}

describe('Repeater', () => {
  it('renders one row per array item', () => {
    render(() => <Harness />)
    expect(screen.getByLabelText('Title 1')).toHaveValue('first')
    expect(screen.getByLabelText('Title 2')).toHaveValue('second')
  })

  it('adds a row', async () => {
    render(() => <Harness />)
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByLabelText('Title 3')).toBeInTheDocument()
  })

  it('hides the add button at maxItems', async () => {
    render(() => <Harness maxItems={2} />)
    expect(screen.queryByRole('button', { name: 'Add' })).toBeNull()
  })

  it('removes a row and keeps the remaining values aligned', async () => {
    render(() => <Harness />)
    await userEvent.click(screen.getByRole('button', { name: 'Remove row 1' }))
    // The row that shifts into position 1 is the one that was at index 1.
    expect(screen.getByLabelText('Title 1')).toHaveValue('second')
  })

  it('copies a row', async () => {
    render(() => <Harness />)
    await userEvent.click(screen.getByRole('button', { name: 'Copy row 1' }))
    expect(screen.getByLabelText('Title 2')).toHaveValue('first')
    expect(screen.getByLabelText('Title 3')).toHaveValue('second')
  })
})
