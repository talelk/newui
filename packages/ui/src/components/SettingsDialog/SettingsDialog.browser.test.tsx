import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { SettingsDialog } from './SettingsDialog'

describe('SettingsDialog (browser, real CSS)', () => {
  it('paints the dialog, sidebar and nav rows', () => {
    render(() => (
      <SettingsDialog.Root defaultOpen>
        <SettingsDialog.Sidebar>
          <SettingsDialog.NavItem value="general">
            General
          </SettingsDialog.NavItem>
        </SettingsDialog.Sidebar>
        <SettingsDialog.Content>
          <SettingsDialog.Panel value="general">
            <SettingsDialog.Header title="General" />
            <SettingsDialog.Body>Body</SettingsDialog.Body>
          </SettingsDialog.Panel>
        </SettingsDialog.Content>
      </SettingsDialog.Root>
    ))

    const content = document.querySelector(
      '[data-slot="dialog-content"]',
    ) as HTMLElement
    expect(content).not.toBeNull()
    expect(getComputedStyle(content).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )

    const sidebar = document.querySelector(
      '[data-slot="settings-sidebar"]',
    ) as HTMLElement
    expect(getComputedStyle(sidebar).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )

    const navItem = document.querySelector(
      '[data-slot="settings-nav-item"]',
    ) as HTMLElement
    expect(navItem.getBoundingClientRect().height).toBeGreaterThanOrEqual(24)
  })
})
