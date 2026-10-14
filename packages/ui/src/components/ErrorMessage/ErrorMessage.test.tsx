import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ErrorMessage } from './ErrorMessage'

function errorOf(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[data-slot="error"]')
}

describe('ErrorMessage', () => {
  it('renders nothing without a message', () => {
    const { container } = render(() => <ErrorMessage />)
    expect(errorOf(container)).toBeNull()
  })

  it('treats an empty string, an empty array and a bare Error as no error', () => {
    for (const message of ['', [], new Error()] as const) {
      const { container } = render(() => (
        <ErrorMessage message={message as never} />
      ))
      expect(errorOf(container)).toBeNull()
    }
  })

  it('renders a string message as an alert', () => {
    const { container } = render(() => (
      <ErrorMessage message="Required field" id="email-error" />
    ))
    const el = errorOf(container)
    expect(el?.textContent).toBe('Required field')
    expect(el?.getAttribute('role')).toBe('alert')
    expect(el?.getAttribute('id')).toBe('email-error')
  })

  it('stacks an array of messages as lines', () => {
    const { container } = render(() => (
      <ErrorMessage message={['Too short', 'No number']} />
    ))
    expect(errorOf(container)?.textContent).toBe('Too short\nNo number')
  })

  it("prefers an Error's messages over its message", () => {
    const error = Object.assign(new Error('fallback'), {
      messages: ['First', 'Second'],
    })
    const { container } = render(() => <ErrorMessage message={error} />)
    expect(errorOf(container)?.textContent).toBe('First\nSecond')
  })

  it("falls back to an Error's message", () => {
    const { container } = render(() => (
      <ErrorMessage message={new Error('Network failed')} />
    ))
    expect(errorOf(container)?.textContent).toBe('Network failed')
  })
})
