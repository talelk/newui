import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { MobileNav, MobileNavItem } from './MobileNav'

describe('MobileNav (browser, real CSS)', () => {
  it('lays the bar out as a grid of equal-width tabs', () => {
    const { container } = render(() => (
      <MobileNav aria-label="Primary">
        <MobileNavItem label="Home" active />
        <MobileNavItem label="Search" />
      </MobileNav>
    ))
    const nav = container.querySelector(
      '[data-slot="mobile-nav"]',
    ) as HTMLElement
    const style = getComputedStyle(nav)
    expect(style.display).toBe('grid')
    expect(style.gridAutoFlow).toBe('column')
    const item = container.querySelector(
      '[data-slot="mobile-nav-item"]',
    ) as HTMLElement
    expect(item.getBoundingClientRect().height).toBeGreaterThanOrEqual(56)
  })

  it('paints the active tab against the inactive one', () => {
    const { container } = render(() => (
      <MobileNav aria-label="Primary">
        <MobileNavItem label="Home" active />
        <MobileNavItem label="Search" />
      </MobileNav>
    ))
    const [active, inactive] = Array.from(
      container.querySelectorAll('[data-slot="mobile-nav-item"]'),
    )
    expect(getComputedStyle(active as HTMLElement).color).not.toBe(
      getComputedStyle(inactive as HTMLElement).color,
    )
  })
})
