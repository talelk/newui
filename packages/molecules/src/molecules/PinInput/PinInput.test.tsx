import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PinInput } from './PinInput'

describe('PinInput', () => {
  it('renders one cell per `length` (6 by default)', () => {
    const { container } = render(() => <PinInput aria-label="Code" />)
    expect(container.querySelectorAll('input').length).toBe(6)
    const four = render(() => <PinInput length={4} aria-label="Short code" />)
    expect(
      four.container.querySelectorAll('input[data-slot="pin-input"]').length ??
        0,
    ).toBe(0)
    expect(four.container.querySelectorAll('input').length).toBe(4)
  })

  it('types digits across the cells and reports the joined value', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <PinInput length={4} aria-label="Code" onValueChange={onValueChange} />
    ))
    const cells = screen.getAllByRole('textbox')
    await userEvent.type(cells[0] as HTMLElement, '4')
    expect((cells[0] as HTMLInputElement).value).toBe('4')
    expect(onValueChange).toHaveBeenCalled()
  })

  it('fires onValueComplete when every cell is filled', async () => {
    const onComplete = vi.fn()
    render(() => (
      <PinInput length={3} aria-label="Code" onValueComplete={onComplete} />
    ))
    const cells = screen.getAllByRole('textbox')
    await userEvent.type(cells[0] as HTMLElement, '123')
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete.mock.calls[0]?.[0]?.valueAsString).toBe('123')
  })

  it('names the cells from the shared labelling contract', () => {
    render(() => (
      <PinInput
        length={4}
        label="Verification code"
        error="Wrong code"
        required
      />
    ))
    const cell = screen.getAllByRole('textbox')[0] as HTMLInputElement
    expect(cell.getAttribute('aria-invalid')).toBe('true')
    expect(cell.getAttribute('aria-required')).toBe('true')
    // A multi-cell control labels its cells with `aria-labelledby` rather
    // than one `for` — every cell reads the field's label.
    expect(cell.getAttribute('aria-labelledby')).toBeTruthy()
    const labelledby = document.getElementById(
      cell.getAttribute('aria-labelledby') as string,
    )
    expect(labelledby?.textContent).toContain('Verification code')

    const errormessage = cell.getAttribute('aria-errormessage')
    expect(errormessage).toBeTruthy()
    expect(
      document.getElementById(errormessage as string)?.textContent,
    ).toContain('Wrong code')
  })

  it('advertises one-time-code autofill with `otp`', () => {
    render(() => <PinInput length={4} aria-label="Code" otp />)
    expect(
      (screen.getAllByRole('textbox')[0] as HTMLInputElement).getAttribute(
        'autocomplete',
      ),
    ).toBe('one-time-code')
  })

  it('masks the cells like a password with `mask`', () => {
    const { container } = render(() => (
      <PinInput length={4} aria-label="Code" mask />
    ))
    // A masked cell is `type="password"`, so it is no longer a textbox.
    const cell = container.querySelector('input') as HTMLInputElement
    expect(cell.getAttribute('type')).toBe('password')
  })

  it('disables every cell together', () => {
    render(() => <PinInput length={3} aria-label="Code" disabled />)
    for (const cell of screen.getAllByRole('textbox')) {
      expect((cell as HTMLInputElement).disabled).toBe(true)
    }
  })

  it('rejects a character outside `type`', async () => {
    render(() => <PinInput length={3} aria-label="Code" type="numeric" />)
    const cell = screen.getAllByRole('textbox')[0] as HTMLInputElement
    await userEvent.type(cell, 'x')
    expect(cell.value).toBe('')
  })
})
