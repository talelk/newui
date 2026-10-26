import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { SidebarItem } from '../Sidebar'
import { AppSidebar } from './AppSidebar'

const AXE_OPTIONS = {
  rules: {
    'color-contrast': { enabled: false },
    region: { enabled: false },
  },
}

function summarize(results: AxeResults) {
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }))
}

function workspace(props: { collapsed?: boolean } = {}) {
  return (
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
      collapsed={props.collapsed}
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
    />
  )
}

describe('AppSidebar accessibility', () => {
  it('has no axe violations for the expanded navigation', async () => {
    const { container } = render(() => workspace())
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for the collapsed rail', async () => {
    const { container } = render(() => workspace({ collapsed: true }))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
