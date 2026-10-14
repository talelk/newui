import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MobileNav, MobileNavItem } from './MobileNav'

describe('MobileNav', () => {
  it('renders a nav landmark with an accessible name', () => {
    render(() => (
      <MobileNav aria-label="Primary">
        <MobileNavItem label="Home" />
      </MobileNav>
    ))

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeTruthy()
  })

  it('marks the active item and leaves the rest inactive', () => {
    render(() => (
      <MobileNav aria-label="Primary">
        <MobileNavItem label="Home" active />
        <MobileNavItem label="Search" />
      </MobileNav>
    ))

    expect(
      screen.getByRole('button', { name: 'Home' }).getAttribute('data-state'),
    ).toBe('active')
    expect(
      screen.getByRole('button', { name: 'Search' }).getAttribute('data-state'),
    ).toBe('inactive')
  })

  it('renders an anchor when it has a destination', () => {
    render(() => (
      <MobileNav aria-label="Primary">
        <MobileNavItem label="Search" route="/search" />
        <MobileNavItem label="Docs" href="https://example.com" />
      </MobileNav>
    ))

    expect(
      screen.getByRole('link', { name: 'Search' }).getAttribute('href'),
    ).toBe('/search')
    expect(
      screen.getByRole('link', { name: 'Docs' }).getAttribute('href'),
    ).toBe('https://example.com')
  })

  it('prefers route over href', () => {
    render(() => (
      <MobileNav aria-label="Primary">
        <MobileNavItem label="Search" route="/in-app" href="/external" />
      </MobileNav>
    ))

    expect(
      screen.getByRole('link', { name: 'Search' }).getAttribute('href'),
    ).toBe('/in-app')
  })

  it('fires onClick for a button item', async () => {
    const onClick = vi.fn()
    render(() => (
      <MobileNav aria-label="Primary">
        <MobileNavItem label="More" onClick={onClick} />
      </MobileNav>
    ))

    await userEvent.click(screen.getByRole('button', { name: 'More' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders the label and the icon glyph', () => {
    render(() => (
      <MobileNav aria-label="Primary">
        <MobileNavItem label="Home" icon="lucide-house" />
      </MobileNav>
    ))

    expect(screen.getByText('Home')).toBeTruthy()
    expect(document.querySelector('.lucide-house')).toBeTruthy()
  })

  it('renders custom content in place of the icon', () => {
    render(() => (
      <MobileNav aria-label="Primary">
        <MobileNavItem label="You">
          <span data-testid="avatar" />
        </MobileNavItem>
      </MobileNav>
    ))

    expect(screen.getByTestId('avatar')).toBeTruthy()
  })

  it('exposes aria-current when set', () => {
    render(() => (
      <MobileNav aria-label="Primary">
        <MobileNavItem label="Home" active aria-current="page" />
      </MobileNav>
    ))

    expect(
      screen.getByRole('button', { name: 'Home' }).getAttribute('aria-current'),
    ).toBe('page')
  })
})
