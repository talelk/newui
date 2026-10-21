import { render } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { createSignal } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { TextInput } from './TextInput'

describe('TextInput', () => {
  it('preserves the typed value and focused input when validation appears', async () => {
    const [error, setError] = createSignal<string>()
    const { getByRole } = render(() => (
      <TextInput aria-label="Email" error={error()} />
    ))
    const input = getByRole('textbox') as HTMLInputElement
    await userEvent.type(input, 'rhea@example.com')
    setError('Check this address.')
    expect(getByRole('textbox')).toBe(input)
    expect(input.value).toBe('rhea@example.com')
    expect(document.activeElement).toBe(input)
  })

  it('renders a bare input without labelling props', () => {
    const { getByRole } = render(() => <TextInput placeholder="Name" />)
    const input = getByRole('textbox')
    expect(input.getAttribute('aria-invalid')).toBeNull()
  })

  it('forwards native input attributes', () => {
    const { getByRole } = render(() => (
      <TextInput
        type="email"
        autocomplete="email"
        inputmode="email"
        maxLength={64}
        pattern="[^@]+@[^@]+"
      />
    ))
    const input = getByRole('textbox')
    expect(input.getAttribute('type')).toBe('email')
    expect(input.getAttribute('autocomplete')).toBe('email')
    expect(input.getAttribute('inputmode')).toBe('email')
    expect(input.getAttribute('maxlength')).toBe('64')
    expect(input.getAttribute('pattern')).toBe('[^@]+@[^@]+')
  })

  it('wires the shared labelling contract', () => {
    const { getByRole, getByText } = render(() => (
      <TextInput
        label="Email"
        description="We never share it"
        error="Required"
        required
      />
    ))
    const input = getByRole('textbox')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-required')).toBe('true')

    const describedBy = input.getAttribute('aria-describedby') ?? ''
    expect(describedBy.split(' ').length).toBe(2)

    const errormessage = input.getAttribute('aria-errormessage')
    expect(errormessage).toBeTruthy()
    const errorEl = errormessage ? document.getElementById(errormessage) : null
    expect(errorEl?.textContent).toContain('Required')

    // Label is associated by `for`.
    expect(document.querySelector(`label[for="${input.id}"]`)).not.toBeNull()
    expect(getByText('Email')).toBeTruthy()
  })

  it('links label and input by a generated id', () => {
    const { getByRole } = render(() => <TextInput label="Name" />)
    const input = getByRole('textbox')
    expect(input.id).toBeTruthy()
  })
})
