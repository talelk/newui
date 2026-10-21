import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { AuthLayout } from './AuthLayout'

describe('AuthLayout', () => {
  it('centers public access content and allows an optional context panel', () => {
    const { container } = render(() => (
      <AuthLayout aside={<p>Welcome to Acme</p>} brand={<span>Acme</span>}>
        <form aria-label="Sign in">
          <button type="submit">Continue</button>
        </form>
      </AuthLayout>
    ))

    expect(screen.getByText('Welcome to Acme')).toBeVisible()
    expect(screen.getByText('Acme')).toBeVisible()
    expect(screen.getByRole('form', { name: 'Sign in' })).toBeVisible()
    expect(container.querySelectorAll('main')).toHaveLength(1)
  })
})
