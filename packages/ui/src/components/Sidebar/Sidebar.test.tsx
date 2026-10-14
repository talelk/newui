import { render } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  Sidebar,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarRail,
  SidebarRailItem,
  useSidebar,
} from './Sidebar'

function Toggler() {
  const { toggle } = useSidebar()
  return (
    <button type="button" onClick={toggle}>
      Toggle
    </button>
  )
}

describe('Sidebar', () => {
  it('is a named navigation landmark', () => {
    const { getByRole } = render(() => <Sidebar />)
    const nav = getByRole('navigation')
    expect(nav.getAttribute('aria-label')).toBe('Main')
    expect(nav.getAttribute('data-state')).toBe('expanded')
  })

  it('honours a controlled collapsed state', () => {
    const { container } = render(() => <Sidebar collapsed />)
    const nav = container.querySelector('[data-slot="sidebar"]') as HTMLElement
    expect(nav.getAttribute('data-state')).toBe('collapsed')
    expect(nav.style.width).toBe('3rem')
  })

  it('reports a toggle through onCollapsedChange', async () => {
    const onCollapsedChange = vi.fn()
    const { getByRole } = render(() => (
      <Sidebar onCollapsedChange={onCollapsedChange}>
        <Toggler />
      </Sidebar>
    ))
    await userEvent.click(getByRole('button', { name: 'Toggle' }))
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
  })

  it('hides the title block and shows a divider label when collapsed', () => {
    const { container, queryByText } = render(() => (
      <Sidebar collapsed>
        <SidebarHeader title="Workspace" />
        <SidebarLabel divider>General</SidebarLabel>
      </Sidebar>
    ))
    expect(queryByText('Workspace')).toBeNull()
    expect(
      container.querySelector('[data-slot="sidebar-label"] hr'),
    ).toBeTruthy()
  })

  it('renders the header logo box', () => {
    const { container } = render(() => (
      <Sidebar>
        <SidebarHeader title="Workspace" logo="https://example.com/logo.png" />
      </Sidebar>
    ))
    const img = container.querySelector('[data-slot="sidebar-header"] img')
    expect(img?.getAttribute('src')).toBe('https://example.com/logo.png')
  })

  it('falls back to the title initial when no logo is given', () => {
    const { container } = render(() => (
      <Sidebar>
        <SidebarHeader title="workspace" />
      </Sidebar>
    ))
    expect(
      container.querySelector('[data-slot="sidebar-header"]')?.textContent,
    ).toContain('W')
  })

  it('collapses the item label to an accessible-only name', () => {
    const { container } = render(() => (
      <Sidebar collapsed>
        <SidebarItem label="Home">Home</SidebarItem>
      </Sidebar>
    ))
    const label = container.querySelector(
      '[data-slot="sidebar-item"] span',
    ) as HTMLElement
    expect(label.className).toContain('sr-only')
  })
})

describe('SidebarRailItem', () => {
  it('shows an indicator bar for an active subtle item', () => {
    const { container } = render(() => (
      <SidebarRail>
        <SidebarRailItem label="Home" active variant="subtle" />
      </SidebarRail>
    ))
    expect(
      container.querySelector('[data-slot="sidebar-rail-item-indicator"]'),
    ).toBeTruthy()
  })

  it('raises a ghost item instead of drawing a bar', () => {
    const { container } = render(() => (
      <SidebarRail>
        <SidebarRailItem label="Home" active variant="ghost" />
      </SidebarRail>
    ))
    const item = container.querySelector(
      '[data-slot="sidebar-rail-item"]',
    ) as HTMLElement
    expect(item.className).toContain('bg-surface-elevation-3')
    expect(
      container.querySelector('[data-slot="sidebar-rail-item-indicator"]'),
    ).toBeNull()
  })

  it('renders a capped count badge and folds it into the label', () => {
    const { container } = render(() => (
      <SidebarRail>
        <SidebarRailItem label="Inbox" badge={142} />
      </SidebarRail>
    ))
    const item = container.querySelector(
      '[data-slot="sidebar-rail-item"]',
    ) as HTMLElement
    expect(item.getAttribute('aria-label')).toBe('Inbox, 142 unread')
    expect(container.textContent).toContain('99+')
  })

  it('renders a dot badge when badgeStyle is dot', () => {
    const { container } = render(() => (
      <SidebarRail>
        <SidebarRailItem label="Inbox" badge={3} badgeStyle="dot" />
      </SidebarRail>
    ))
    expect(
      container.querySelector('[data-slot="sidebar-rail-item-badge-dot"]'),
    ).toBeTruthy()
  })
})
