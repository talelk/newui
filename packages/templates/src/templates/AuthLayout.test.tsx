import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { AuthLayout } from './AuthLayout'

function renderAuth(overrides?: Partial<Parameters<typeof AuthLayout>[0]>) {
  return render(() => (
    <AuthLayout brand={<span>Acme</span>} {...overrides}>
      <form aria-label="Sign in">
        <button type="submit">Continue</button>
      </form>
    </AuthLayout>
  ))
}

describe('AuthLayout', () => {
  it('centers public access content and allows an optional context panel', () => {
    const { container } = renderAuth({ aside: <p>Welcome to Acme</p> })

    expect(screen.getByText('Welcome to Acme')).toBeVisible()
    expect(screen.getByText('Acme')).toBeVisible()
    expect(screen.getByRole('form', { name: 'Sign in' })).toBeVisible()
    expect(container.querySelectorAll('main')).toHaveLength(1)
  })

  it('renders the context panel as an aside and splits the canvas in two', () => {
    const { container } = renderAuth({ aside: <p>Welcome to Acme</p> })
    const aside = container.querySelector('aside')
    expect(aside).not.toBeNull()
    expect(aside?.textContent).toBe('Welcome to Acme')
    expect((container.firstElementChild as HTMLElement).className).toContain(
      'lg:grid-cols-2',
    )
  })

  it('omits the panel and the split without `aside`', () => {
    const { container } = renderAuth()
    expect(container.querySelector('aside')).toBeNull()
    expect(
      (container.firstElementChild as HTMLElement).className,
    ).not.toContain('lg:grid-cols-2')
  })

  it('renders the header row only when `header` is given', () => {
    const { container, unmount } = renderAuth()
    expect(container.querySelector('[class*="absolute inset-x-0"]')).toBeNull()
    unmount()

    renderAuth({ header: <a href="/">Back to home</a> })
    expect(screen.getByRole('link', { name: 'Back to home' })).toBeVisible()
  })

  it('stacks the brand above the flow inside the centered column', () => {
    const { container } = renderAuth()
    const column = container.querySelector('main')?.firstElementChild
    const brand = column?.children[0]
    const form = column?.children[1]
    expect(brand?.textContent).toBe('Acme')
    expect(form?.querySelector('button')?.textContent).toBe('Continue')
  })

  it('marks the root with the auth-layout slot', () => {
    const { container } = renderAuth()
    expect(
      (container.firstElementChild as HTMLElement).getAttribute('data-slot'),
    ).toBe('auth-layout')
  })
})
