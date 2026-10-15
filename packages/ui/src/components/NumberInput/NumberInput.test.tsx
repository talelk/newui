import { render } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NumberInput } from './NumberInput'

describe('NumberInput', () => {
  it('connects its Field label, help and error to the spinbutton', () => {
    const { getByRole, getByText } = render(() => (
      <NumberInput
        label="Seats"
        description="Seats in this workspace."
        error="Choose at least one seat."
        required
        defaultValue="0"
      />
    ))
    const input = getByRole('spinbutton', { name: /Seats/ })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(getByRole('button', { name: 'Increment' })).toHaveAttribute(
      'aria-controls',
      input.id,
    )
    expect(input.getAttribute('aria-describedby')).toContain(
      getByText('Seats in this workspace.').id,
    )
    expect(input.getAttribute('aria-describedby')).toContain(
      getByRole('alert').id,
    )
  })
  it('renders a spinbutton with the value', () => {
    const { getByRole } = render(() => <NumberInput defaultValue="5" />)
    expect((getByRole('spinbutton') as HTMLInputElement).value).toBe('5')
  })

  it('increments on the step trigger', async () => {
    const onValueChange = vi.fn()
    const { getByLabelText } = render(() => (
      <NumberInput defaultValue="5" onValueChange={onValueChange} />
    ))
    await userEvent.click(getByLabelText('Increment'))
    expect(onValueChange).toHaveBeenCalled()
    expect(onValueChange.mock.calls[0]?.[0]?.value).toBe('6')
  })
})
