import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Sidebar, SidebarItem, SidebarLabel } from './Sidebar'

describe('Sidebar (browser, real CSS)', () => {
  it('reserves its declared width when expanded', () => {
    const { container } = render(() => (
      <Sidebar width="14rem" collapsed={false}>
        <SidebarItem>Home</SidebarItem>
      </Sidebar>
    ))
    const nav = container.querySelector('[data-slot="sidebar"]') as HTMLElement
    expect(nav.getBoundingClientRect().width).toBeGreaterThanOrEqual(200)
  })

  it('shrinks to the collapsed width', () => {
    const { container } = render(() => (
      <Sidebar collapsedWidth="3rem" collapsed>
        <SidebarItem>Home</SidebarItem>
      </Sidebar>
    ))
    const nav = container.querySelector('[data-slot="sidebar"]') as HTMLElement
    expect(nav.getBoundingClientRect().width).toBeLessThan(80)
  })

  it('gives a sidebar item a real row height', () => {
    const { container } = render(() => (
      <Sidebar collapsed={false}>
        <SidebarItem>Home</SidebarItem>
      </Sidebar>
    ))
    const item = container.querySelector(
      '[data-slot="sidebar-item"]',
    ) as HTMLElement
    expect(item.getBoundingClientRect().height).toBeGreaterThanOrEqual(24)
  })

  it('draws the collapsed divider label', () => {
    const { container } = render(() => (
      <Sidebar collapsed>
        <SidebarLabel divider>General</SidebarLabel>
      </Sidebar>
    ))
    const rule = container.querySelector(
      '[data-slot="sidebar-label"] hr',
    ) as HTMLElement
    expect(rule).toBeTruthy()
    expect(
      Number.parseFloat(getComputedStyle(rule).borderTopWidth),
    ).toBeGreaterThan(0)
  })
})
