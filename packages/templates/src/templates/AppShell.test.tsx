import { render, screen, waitFor } from '@solidjs/testing-library'
import { SidebarItem } from '@talelk/newui-organisms'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AppShell } from './AppShell'

describe('AppShell', () => {
  it('uses one sidebar model for the mobile drawer, including tenant and bottom actions', async () => {
    render(() => (
      <AppShell
        title="Projects"
        brand={<span>Acme</span>}
        brandCollapsed={<span>AC</span>}
        tenant={<button type="button">Acme · Production</button>}
        tenantCollapsed={
          <button type="button" aria-label="Choose tenant">
            AC
          </button>
        }
        navigation={[
          {
            label: 'Workspace',
            items: [
              { label: 'Projects', icon: 'lucide-folders', active: true },
              { label: 'People', icon: 'lucide-users' },
            ],
          },
          {
            label: 'Reports',
            items: [
              { label: 'Revenue', icon: 'lucide-chart-no-axes-combined' },
            ],
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
      >
        <p>Content</p>
      </AppShell>
    ))

    expect(
      screen.getByRole('heading', { name: 'Projects', level: 1 }),
    ).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
    await userEvent.click(
      screen.getByRole('button', { name: 'Open application navigation' }),
    )
    const drawer = screen.getByRole('dialog', {
      name: 'Application navigation',
    })
    expect(drawer).toBeVisible()
    expect(screen.getByText('Acme')).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Acme · Production' }),
    ).toBeTruthy()
    expect(screen.getByText('Workspace')).toBeTruthy()
    expect(screen.getByText('Reports')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Settings' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Rhea Kapoor' })).toBeTruthy()
    expect(document.querySelector('[data-slot="sidebar-rail"]')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'People' }))
    await waitFor(() => expect(drawer).not.toBeVisible())
  })
})
