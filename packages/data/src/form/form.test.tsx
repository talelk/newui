import { render, screen, waitFor } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { untrack } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createAppForm, Form, fieldError } from './form'

function Harness(props: {
  onSubmit: (value: { name: string }) => Promise<void>
}): import('solid-js').JSX.Element {
  const { form, submitting } = createAppForm({
    defaultValues: { name: '' },
    onSubmit: untrack(() => props.onSubmit),
  })
  return (
    <Form form={form} class="flex flex-col gap-2">
      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) =>
            value.length < 3 ? 'Use at least 3 characters.' : undefined,
          onSubmit: ({ value }) =>
            value.length < 3 ? 'Use at least 3 characters.' : undefined,
        }}
      >
        {(field) => (
          <>
            <input
              aria-label="Name"
              value={field().state.value}
              onInput={(event) =>
                field().handleChange(event.currentTarget.value)
              }
            />
            <p role="alert">{fieldError(field())}</p>
            <button type="submit" disabled={submitting()}>
              Save
            </button>
          </>
        )}
      </form.Field>
    </Form>
  )
}

describe('createAppForm', () => {
  it('submits a valid value and blocks an invalid one', async () => {
    const onSubmit = vi.fn(async (_value: { name: string }) => {})
    render(() => <Harness onSubmit={onSubmit} />)
    const field = screen.getByRole('textbox', { name: 'Name' })

    await userEvent.type(field, 'ab')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).not.toHaveBeenCalled()
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain(
        'at least 3 characters',
      ),
    )

    await userEvent.type(field, 'c')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ name: 'abc' })
  })

  it('reports submitting while the handler is pending, and disables the button', async () => {
    let finish!: () => void
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve
        }),
    )
    render(() => <Harness onSubmit={onSubmit} />)
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'abc')
    const button = screen.getByRole('button', { name: 'Save' })
    await userEvent.click(button)
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    await waitFor(() => expect(button).toBeDisabled())

    finish()
    await waitFor(() => expect(button).not.toBeDisabled())
  })
})

describe('fieldError', () => {
  it('turns TanStack’s error list into the single string a field takes', () => {
    expect(fieldError({ state: { meta: { errors: [] } } })).toBeUndefined()
    expect(fieldError({ state: { meta: { errors: ['Required.'] } } })).toBe(
      'Required.',
    )
    expect(
      fieldError({
        state: { meta: { errors: [{ message: 'Required.' }, 'Too short.'] } },
      }),
    ).toBe('Required. Too short.')
  })
})
