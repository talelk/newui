import { fireEvent, render, screen } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { Duration } from './Duration'

function inputOf(): HTMLInputElement {
  return screen.getByRole('textbox') as HTMLInputElement
}

describe('Duration', () => {
  it('renders the formatted saved value when unfocused', () => {
    render(() => <Duration value={5445} />)
    expect(inputOf()).toHaveValue('1h 30m 45s')
  })

  it('renders an uncontrolled default value', () => {
    render(() => <Duration defaultValue={90} />)
    expect(inputOf()).toHaveValue('1m 30s')
  })

  it('shows the placeholder when empty', () => {
    render(() => <Duration />)
    expect(inputOf()).toHaveAttribute('placeholder', '1h 30m 45s')
    expect(inputOf()).toHaveValue('')
  })

  it('commits parsed seconds on blur and reports through onValueChange', () => {
    const onValueChange = vi.fn()
    render(() => <Duration value={5445} onValueChange={onValueChange} />)
    const input = inputOf()

    input.focus()
    fireEvent.input(input, { target: { value: '2h 30m' } })
    fireEvent.blur(input)

    expect(onValueChange).toHaveBeenCalledWith(9000)
    // Controlled: the displayed value stays pinned to the prop.
    expect(input).toHaveValue('1h 30m 45s')
  })

  it('updates internal state when uncontrolled', () => {
    render(() => <Duration defaultValue={90} />)
    const input = inputOf()

    input.focus()
    fireEvent.input(input, { target: { value: '2h' } })
    fireEvent.blur(input)

    expect(input).toHaveValue('2h')
  })

  it('commits on Enter', () => {
    const onValueChange = vi.fn()
    render(() => <Duration value={5445} onValueChange={onValueChange} />)
    const input = inputOf()

    input.focus()
    fireEvent.input(input, { target: { value: '45s' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onValueChange).toHaveBeenCalledWith(45)
  })

  it('cancels the edit on Escape without committing', () => {
    const onValueChange = vi.fn()
    render(() => <Duration value={5445} onValueChange={onValueChange} />)
    const input = inputOf()

    input.focus()
    fireEvent.input(input, { target: { value: '99s' } })
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(onValueChange).not.toHaveBeenCalled()
    expect(input).toHaveValue('1h 30m 45s')
  })

  it('clears to null when the field is emptied', () => {
    const onValueChange = vi.fn()
    render(() => <Duration value={5445} onValueChange={onValueChange} />)
    const input = inputOf()

    input.focus()
    fireEvent.input(input, { target: { value: '' } })
    fireEvent.blur(input)

    expect(onValueChange).toHaveBeenCalledWith(null)
  })

  it('shows an internal error and keeps the rejected text for invalid input', () => {
    const onValueChange = vi.fn()
    render(() => (
      <Duration label="Duration" value={5445} onValueChange={onValueChange} />
    ))
    const input = inputOf()

    input.focus()
    fireEvent.input(input, { target: { value: 'banana' } })
    fireEvent.blur(input)

    expect(onValueChange).not.toHaveBeenCalled()
    expect(input).toHaveValue('banana')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByRole('alert').textContent).toContain('Invalid format')
  })

  it('edits in canonical short notation regardless of the display format', () => {
    render(() => <Duration value={5445} format="long" />)
    const input = inputOf()

    expect(input).toHaveValue('1 hour 30 minutes 45 seconds')
    input.focus()
    expect(input).toHaveValue('1h 30m 45s')
  })

  it('renders named format presets', () => {
    render(() => <Duration value={5445} format="long" />)
    expect(inputOf()).toHaveValue('1 hour 30 minutes 45 seconds')
  })

  it('renders the colon preset', () => {
    render(() => <Duration value={5445} format="colon" />)
    expect(inputOf()).toHaveValue('1:30:45')
  })

  it('renders a token template', () => {
    render(() => <Duration value={7323} format="hh:mm:ss" />)
    expect(inputOf()).toHaveValue('02:02:03')
  })

  it('wires the shared labelling contract', () => {
    render(() => (
      <Duration
        label="Duration"
        description="How long it took"
        error="Required"
        required
      />
    ))
    const input = inputOf()

    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-required')).toBe('true')
    expect(input.getAttribute('aria-describedby')?.split(' ').length).toBe(2)

    const errormessage = input.getAttribute('aria-errormessage')
    const errorEl = errormessage ? document.getElementById(errormessage) : null
    expect(errorEl?.textContent).toContain('Required')

    expect(document.querySelector(`label[for="${input.id}"]`)).not.toBeNull()
    expect(screen.getByText('Duration')).toBeTruthy()
  })

  it('gives a bare input an accessible name from aria-label', () => {
    render(() => <Duration aria-label="Duration" />)
    expect(inputOf().getAttribute('aria-label')).toBe('Duration')
  })

  it('disables the input', () => {
    render(() => <Duration label="Duration" value={5445} disabled />)
    expect(inputOf()).toBeDisabled()
  })
})
