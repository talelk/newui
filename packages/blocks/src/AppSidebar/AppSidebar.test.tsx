import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AppSidebar } from './AppSidebar'

describe('AppSidebar', () => {
  it('renders the header, group labels and items', () => {
    render(() => (
      <AppSidebar
        title="Tickets"
        subtitle="24 open"
        groups={[
          {
            label: 'Workspace',
            items: [
              { label: 'Tickets', icon: 'lucide-ticket', count: 24 },
              { label: 'Customers', icon: 'lucide-building-2' },
            ],
          },
        ]}
      />
    ))

    // Twice: the header title and the nav item.
    expect(screen.getAllByText('Tickets')).toHaveLength(2)
    expect(screen.getByText('24 open')).toBeTruthy()
    expect(screen.getByText('Workspace')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Customers/ })).toBeTruthy()
  })

  it('shows a count as a quiet pill, not a badge', () => {
    const { container } = render(() => (
      <AppSidebar
        title="Tickets"
        groups={[{ items: [{ label: 'Tickets', count: 24 }] }]}
      />
    ))
    expect(container.querySelector('[data-slot="badge"]')).toBeNull()
    const pill = screen.getByText('24')
    expect(pill.className).toContain('rounded-full')
    expect(pill.className).toContain('tabular-nums')
  })

  it('marks the active item and forwards clicks', async () => {
    const onClick = vi.fn()
    render(() => (
      <AppSidebar
        title="Tickets"
        groups={[{ items: [{ label: 'Open', active: true, onClick }] }]}
      />
    ))

    const item = screen.getByRole('button', { name: 'Open' })
    expect(item.getAttribute('data-active')).toBe('')
    await userEvent.click(item)
    expect(onClick).toHaveBeenCalled()
  })

  it('carries a collapse toggle at its foot that folds the sidebar', async () => {
    const onCollapsedChange = vi.fn()
    const { container } = render(() => (
      <AppSidebar
        title="Tickets"
        onCollapsedChange={onCollapsedChange}
        groups={[{ items: [{ label: 'Open', icon: 'lucide-ticket' }] }]}
      />
    ))
    const nav = container.querySelector('[data-slot="sidebar"]')
    expect(nav?.getAttribute('data-state')).toBe('expanded')

    await userEvent.click(screen.getByRole('button', { name: /^Collapse$/ }))
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
    expect(nav?.getAttribute('data-state')).toBe('collapsed')
    expect(screen.getByRole('button', { name: /^Expand$/ })).toBeTruthy()
  })

  it('drops the toggle when the sidebar cannot collapse', () => {
    render(() => (
      <AppSidebar
        title="Tickets"
        collapsible={false}
        groups={[{ items: [{ label: 'Open' }] }]}
      />
    ))
    expect(screen.queryByRole('button', { name: 'Collapse' })).toBeNull()
  })

  it('omits the leading slot when an item has no icon', () => {
    const { container } = render(() => (
      <AppSidebar title="Tickets" groups={[{ items: [{ label: 'Plain' }] }]} />
    ))
    const item = container.querySelector('[data-slot="sidebar-item"]')
    expect(item?.querySelector('svg, span[class*="lucide"]')).toBeNull()
  })
})
