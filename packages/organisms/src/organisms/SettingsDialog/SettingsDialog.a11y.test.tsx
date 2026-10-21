import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { SettingsDialog } from './SettingsDialog'

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

describe('SettingsDialog accessibility', () => {
  it('has no axe violations when open', async () => {
    render(() => (
      <SettingsDialog.Root defaultOpen defaultValue="profile">
        <SettingsDialog.Sidebar>
          <SettingsDialog.NavGroup label="User settings">
            <SettingsDialog.NavItem value="profile">
              Profile
            </SettingsDialog.NavItem>
            <SettingsDialog.NavItem value="notifications">
              Notifications
            </SettingsDialog.NavItem>
          </SettingsDialog.NavGroup>
        </SettingsDialog.Sidebar>
        <SettingsDialog.Content>
          <SettingsDialog.Panel value="profile">
            <SettingsDialog.Header title="Profile" description="Your details" />
            <SettingsDialog.Body>
              <SettingsDialog.Row
                title="Display name"
                description="Shown to others"
                labelFor="display-name"
              >
                <input id="display-name" type="text" />
              </SettingsDialog.Row>
            </SettingsDialog.Body>
          </SettingsDialog.Panel>
          <SettingsDialog.Panel value="notifications">
            <SettingsDialog.Header title="Notifications" />
            <SettingsDialog.Body>Nothing here.</SettingsDialog.Body>
          </SettingsDialog.Panel>
        </SettingsDialog.Content>
      </SettingsDialog.Root>
    ))

    expect(summarize(await axe.run(document.body, AXE_OPTIONS))).toEqual([])
  })
})
