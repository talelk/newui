import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { AuthCard } from './AuthCard'

describe('AuthCard', () => {
  it('gives the page exactly one h1', () => {
    render(() => (
      <AuthCard title="Sign in" description="Welcome back">
        <div>form</div>
      </AuthCard>
    ))
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByText('Welcome back')).toBeTruthy()
  })

  it('renders the form as given', () => {
    render(() => (
      <AuthCard title="Sign in">
        <label for="email">Email</label>
        <input id="email" />
      </AuthCard>
    ))
    expect(screen.getByLabelText('Email')).toBeTruthy()
  })

  it('labels the divider only when both a form and providers are present', () => {
    const without = render(() => (
      <AuthCard title="Sign in">
        <div>form</div>
      </AuthCard>
    ))
    expect(without.container.querySelector('[data-slot="divider"]')).toBeNull()
    without.unmount()

    render(() => (
      <AuthCard title="Sign in" providers={[{ label: 'Continue with GitHub' }]}>
        <div>form</div>
      </AuthCard>
    ))
    expect(
      document.querySelectorAll('[data-slot="divider"]').length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByRole('button', { name: /Continue with GitHub/ }),
    ).toBeTruthy()
  })

  it('renders a footer when given one', () => {
    render(() => (
      <AuthCard title="Sign in" footer="Don't have an account?">
        <div>form</div>
      </AuthCard>
    ))
    expect(screen.getByText("Don't have an account?")).toBeTruthy()
  })
})
