import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { FormLabel } from './FormLabel'

describe('FormLabel', () => {
  it('associates with a control by `for`', () => {
    const { getByText } = render(() => <FormLabel label="Email" id="email" />)
    const label = getByText('Email')
    expect(label.tagName).toBe('LABEL')
    expect(label.getAttribute('for')).toBe('email')
    expect(label.getAttribute('data-slot')).toBe('label')
  })

  it('renders the required indicator with an accessible note', () => {
    const { getByText } = render(() => <FormLabel label="Email" required />)
    expect(getByText('(required)')).toBeTruthy()
    // The asterisk is decorative (aria-hidden); the sr-only note carries meaning.
    expect(getByText('*')).toBeTruthy()
  })

  it('dims when disabled', () => {
    const { getByText } = render(() => <FormLabel label="Email" disabled />)
    expect(getByText('Email').className).toContain('text-ink-gray-4')
  })

  it('exposes its own id for `aria-labelledby`', () => {
    const { getByText } = render(() => (
      <FormLabel label="Email" labelId="email-label" />
    ))
    expect(getByText('Email').getAttribute('id')).toBe('email-label')
  })
})
