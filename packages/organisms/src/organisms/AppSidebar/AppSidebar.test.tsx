import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SidebarItem, useSidebar } from '../Sidebar'
import { AppSidebar } from './AppSidebar'

function CustomNavigation() {
  const { collapsed } = useSidebar()
  return <p>{collapsed() ? 'Collapsed custom menu' : 'Expanded custom menu'}</p>
}

function sidebar(onCollapsedChange?: (collapsed: boolean) => void) {
  return render(() => (
    <AppSidebar
      brand={<span>Acme workspace</span>}
      brandCollapsed={
        <span>
          <span class="sr-only">Acme home</span>A
        </span>
      }
      tenant={<button type="button">Acme · Production</button>}
      tenantCollapsed={
        <button type="button" aria-label="Switch tenant">
          A
        </button>
      }
      groups={[
        {
          label: 'Workspace',
          items: [
            { label: 'Projects', icon: 'lucide-folder-kanban', active: true },
            { label: 'Customers', icon: 'lucide-users', count: 4 },
          ],
        },
        {
          label: 'Reports',
          items: [{ label: 'Revenue', icon: 'lucide-chart-no-axes-combined' }],
        },
      ]}
      settings={
        <SidebarItem label="Settings" icon="lucide-settings">
          Settings
        </SidebarItem>
      }
      account={
        <SidebarItem label="Rhea Kapoor" icon="lucide-user-round">
          Rhea Kapoor
        </SidebarItem>
      }
      onCollapsedChange={onCollapsedChange}
    />
  ))
}

describe('AppSidebar', () => {
  it('keeps brand, tenant, grouped navigation and utilities in one sidebar', () => {
    sidebar()
    expect(screen.getByText('Acme workspace')).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Acme · Production' }),
    ).toBeTruthy()
    expect(screen.getByText('Workspace')).toBeTruthy()
    expect(screen.getByText('Reports')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Projects/ })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('button', { name: /Settings/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Rhea Kapoor/ })).toBeTruthy()
  })

  it('keeps a compact utility slot and an expand control in the rail', () => {
    render(() => (
      <AppSidebar
        brand={<span>Acme</span>}
        collapsed
        utilities={<span>Preferences</span>}
        utilitiesCollapsed={<button type="button">Theme</button>}
        groups={[{ items: [] }]}
      />
    ))
    expect(screen.queryByText('Preferences')).toBeNull()
    expect(screen.getByRole('button', { name: 'Theme' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Expand sidebar/ })).toBeTruthy()
    expect(
      screen.queryByRole('button', { name: /Collapse sidebar/ }),
    ).toBeNull()
  })

  it('has no fold or compact utilities when it cannot collapse', () => {
    render(() => (
      <AppSidebar
        brand={<span>Acme</span>}
        collapsible={false}
        utilities={<span>Preferences</span>}
        utilitiesCollapsed={<button type="button">Theme</button>}
        groups={[{ items: [] }]}
      />
    ))
    expect(screen.getByText('Preferences')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Theme' })).toBeNull()
    expect(screen.queryByRole('button', { name: /Expand sidebar/ })).toBeNull()
    expect(
      screen.queryByRole('button', { name: /Collapse sidebar/ }),
    ).toBeNull()
  })

  it('collapses labels, preserves a compact tenant control and reports the state', async () => {
    const onCollapsedChange = vi.fn()
    sidebar(onCollapsedChange)
    await userEvent.click(screen.getByRole('button', { name: /Collapse/ }))
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
  })

  it('can omit the optional tenant or utility slots', () => {
    render(() => (
      <AppSidebar brand={<span>Acme</span>} groups={[{ items: [] }]} />
    ))
    expect(screen.getByText('Acme')).toBeTruthy()
    expect(
      screen.queryByRole('button', { name: 'Acme · Production' }),
    ).toBeNull()
  })

  it('evaluates a custom navigation render function inside the sidebar state', async () => {
    render(() => (
      <AppSidebar
        brand={<span>Acme</span>}
        children={() => <CustomNavigation />}
      />
    ))
    expect(screen.getByText('Expanded custom menu')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: /Collapse/ }))
    expect(screen.getByText('Collapsed custom menu')).toBeTruthy()
  })
})
