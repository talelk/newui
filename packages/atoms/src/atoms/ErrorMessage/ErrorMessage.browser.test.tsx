import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ErrorMessage } from './ErrorMessage'

describe('ErrorMessage (browser, real CSS)', () => {
  it('renders in the error tone, distinct from plain text', () => {
    const { getByRole, getByTestId } = render(() => (
      <div>
        <ErrorMessage message="Something broke" />
        <span data-testid="plain">Something broke</span>
      </div>
    ))
    const error = getByRole('alert')
    expect(Number.parseFloat(getComputedStyle(error).fontSize)).toBeGreaterThan(
      0,
    )
    expect(getComputedStyle(error).color).not.toBe(
      getComputedStyle(getByTestId('plain')).color,
    )
  })
})
