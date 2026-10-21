import { fireEvent, render } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Password } from './Password'

function inputOf(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector('input')
  if (!input) throw new Error('no input rendered')
  return input
}

function toggleOf(container: HTMLElement): HTMLButtonElement | null {
  return container.querySelector('button[aria-label$="password"]')
}

describe('Password', () => {
  it('renders a masked password input by default', () => {
    const { container } = render(() => <Password label="Password" />)
    expect(inputOf(container).type).toBe('password')
  })

  it('reveals with the toggle and re-hides on the second press', async () => {
    const { container } = render(() => <Password label="Password" />)
    const input = inputOf(container)

    await userEvent.click(toggleOf(container) as HTMLButtonElement)
    expect(input.type).toBe('text')

    await userEvent.click(toggleOf(container) as HTMLButtonElement)
    expect(input.type).toBe('password')
  })

  it('toggles with Mod+I and Ctrl+I', () => {
    const { container } = render(() => <Password label="Password" />)
    const input = inputOf(container)

    fireEvent.keyDown(input, { key: 'i', ctrlKey: true })
    expect(input.type).toBe('text')

    fireEvent.keyDown(input, { key: 'I', metaKey: true })
    expect(input.type).toBe('password')
  })

  it('reports the typed value through onValueChange', async () => {
    const onValueChange = vi.fn()
    const { container } = render(() => (
      <Password label="Password" onValueChange={onValueChange} />
    ))

    await userEvent.type(inputOf(container), 'hunter2')
    expect(onValueChange).toHaveBeenLastCalledWith('hunter2')
  })

  it('reflects a controlled value', () => {
    const { container } = render(() => (
      <Password label="Password" value="secret" />
    ))
    expect(inputOf(container).value).toBe('secret')
  })

  it('gives the toggle an accessible name and pressed state', async () => {
    const { container } = render(() => <Password label="Password" />)
    const toggle = toggleOf(container) as HTMLButtonElement

    expect(toggle.getAttribute('aria-label')).toBe('Show password')
    expect(toggle.getAttribute('aria-pressed')).toBe('false')
    expect(toggle.getAttribute('aria-keyshortcuts')).toBe('Control+I Meta+I')

    await userEvent.click(toggle)
    expect(toggle.getAttribute('aria-label')).toBe('Hide password')
    expect(toggle.getAttribute('aria-pressed')).toBe('true')
  })

  it('disables the toggle when the field is disabled', () => {
    const { container } = render(() => <Password label="Password" disabled />)
    expect((toggleOf(container) as HTMLButtonElement).disabled).toBe(true)
  })

  it('hides the toggle for a server-masked value', () => {
    const { container } = render(() => (
      <Password label="Password" value="********" />
    ))
    expect(toggleOf(container)).toBeNull()
  })

  it('inherits the shared labelling contract', () => {
    const { container, getByText } = render(() => (
      <Password
        label="Password"
        description="At least 8 characters"
        error="Too short"
        required
      />
    ))
    const input = inputOf(container)

    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-required')).toBe('true')
    expect(input.getAttribute('aria-describedby')?.split(' ').length).toBe(2)

    const errormessage = input.getAttribute('aria-errormessage')
    const errorEl = errormessage ? document.getElementById(errormessage) : null
    expect(errorEl?.textContent).toContain('Too short')
    expect(document.querySelector(`label[for="${input.id}"]`)).not.toBeNull()
    expect(getByText('Password')).toBeTruthy()
  })
})
