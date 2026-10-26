import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import {
  Sidebar,
  SidebarCard,
  SidebarHeader,
  SidebarItem,
  SidebarSearch,
  SidebarSection,
  SidebarTrigger,
} from './Sidebar'

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

describe('Sidebar accessibility', () => {
  it('has no axe violations for an expanded workspace sidebar', async () => {
    const { container } = render(() => (
      <Sidebar ariaLabel="Main">
        <SidebarHeader title="Acme" subtitle="Production" />
        <SidebarTrigger />
        <SidebarSearch placeholder="Filter pages" />
        <SidebarItem route="/inbox" icon="lucide-inbox" active>
          Inbox
        </SidebarItem>
        <SidebarItem route="/drafts" icon="lucide-file-pen">
          Drafts
        </SidebarItem>
        <SidebarSection label="Projects" collapsible>
          <SidebarItem route="/website">Website</SidebarItem>
          <SidebarItem route="/app">App</SidebarItem>
        </SidebarSection>
        <SidebarCard
          title="Trial ends soon"
          description="Upgrade to keep your workspace."
          dismissible
          action={{ label: 'Upgrade' }}
        />
      </Sidebar>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for the collapsed rail of named icons', async () => {
    const { container } = render(() => (
      <Sidebar collapsed ariaLabel="Main">
        <SidebarHeader title="Acme" logo="https://example.com/logo.png" />
        <SidebarItem label="Inbox" route="/inbox" icon="lucide-inbox" active>
          Inbox
        </SidebarItem>
        <SidebarItem label="Drafts" route="/drafts" icon="lucide-file-pen">
          Drafts
        </SidebarItem>
      </Sidebar>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
