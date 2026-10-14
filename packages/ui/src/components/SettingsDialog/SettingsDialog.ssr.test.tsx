import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { SettingsDialog } from './SettingsDialog'

describe('SSR smoke', () => {
  it('SettingsDialog renders its closed state without a dialog', () => {
    const html = renderToString(() => (
      <SettingsDialog.Root>
        <SettingsDialog.Sidebar>
          <SettingsDialog.NavGroup label="User settings">
            <SettingsDialog.NavItem value="profile">
              Profile
            </SettingsDialog.NavItem>
          </SettingsDialog.NavGroup>
        </SettingsDialog.Sidebar>
        <SettingsDialog.Content>
          <SettingsDialog.Panel value="profile">
            Profile body
          </SettingsDialog.Panel>
        </SettingsDialog.Content>
      </SettingsDialog.Root>
    ))

    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('data-slot="settings-sidebar"')
  })
})
