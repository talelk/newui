import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Link } from './Link'

describe('Link', () => {
  it('renders its content as an anchor', () => {
    render(() => <Link route="/projects">Projects</Link>)
    const link = screen.getByRole('link', { name: 'Projects' })
    expect(link.getAttribute('href')).toBe('/projects')
  })

  it('treats `href` as external: new tab, noopener, and an announcement', () => {
    render(() => <Link href="https://frappe.io">Docs</Link>)
    const link = screen.getByRole('link', { name: /Docs/ })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noreferrer noopener')
    expect(link.textContent).toContain('(opens in a new tab)')
  })

  it('lets `route` win over `href` and stay in-app', () => {
    render(() => (
      <Link route="/home" href="https://frappe.io">
        Home
      </Link>
    ))
    const link = screen.getByRole('link', { name: 'Home' })
    expect(link.getAttribute('href')).toBe('/home')
    expect(link.getAttribute('target')).toBeNull()
    expect(link.textContent).not.toContain('(opens in a new tab)')
  })

  it('shows the external glyph only for an external `href`', () => {
    const { container, unmount } = render(() => (
      <Link href="https://frappe.io" showExternalIcon>
        Docs
      </Link>
    ))
    expect(
      container.querySelector('[aria-hidden="true"].lucide-external-link'),
    ).toBeTruthy()
    unmount()

    render(() => (
      <Link route="/docs" showExternalIcon>
        Docs
      </Link>
    ))
    expect(
      document.querySelector('[aria-hidden="true"].lucide-external-link'),
    ).toBeNull()
  })

  it('stamps theme and underline as data attributes', () => {
    const { container } = render(() => (
      <Link route="/a" theme="gray" underline="always">
        A
      </Link>
    ))
    const link = container.querySelector('a') as HTMLElement
    expect(link.getAttribute('data-theme')).toBe('gray')
    expect(link.getAttribute('data-underline')).toBe('always')
    expect(link.className).toContain('underline')
    expect(link.className).toContain('text-ink-gray-7')
  })

  it('merges the caller class last', () => {
    const { container } = render(() => (
      <Link route="/a" class="text-sm">
        A
      </Link>
    ))
    expect(container.querySelector('a')?.className).toContain('text-sm')
  })
})
