import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { SettingsDialog } from './SettingsDialog'

interface ExampleProps {
  open?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onOpenChange?: (open: boolean) => void
}

function Example(props: ExampleProps) {
  return (
    <SettingsDialog.Root
      open={props.open}
      defaultOpen={props.open === undefined ? true : undefined}
      onOpenChange={props.onOpenChange}
      value={props.value}
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChange}
    >
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
          <SettingsDialog.Header title="Profile" />
          <SettingsDialog.Body>Profile body</SettingsDialog.Body>
        </SettingsDialog.Panel>
        <SettingsDialog.Panel value="notifications">
          <SettingsDialog.Header title="Notifications" />
          <SettingsDialog.Body>Notifications body</SettingsDialog.Body>
        </SettingsDialog.Panel>
      </SettingsDialog.Content>
    </SettingsDialog.Root>
  )
}

describe('SettingsDialog', () => {
  it('opens on request and closes on Escape', async () => {
    function Harness() {
      const [open, setOpen] = createSignal(false)
      return (
        <div>
          <button type="button" onClick={() => setOpen(true)}>
            open settings
          </button>
          <SettingsDialog.Root open={open()} onOpenChange={setOpen}>
            <SettingsDialog.Sidebar>
              <SettingsDialog.NavItem value="profile">
                Profile
              </SettingsDialog.NavItem>
            </SettingsDialog.Sidebar>
            <SettingsDialog.Content>
              <SettingsDialog.Panel value="profile">
                Profile body
              </SettingsDialog.Panel>
            </SettingsDialog.Content>
          </SettingsDialog.Root>
        </div>
      )
    }

    render(() => <Harness />)
    expect(screen.queryByRole('dialog')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'open settings' }))
    expect(screen.getByRole('dialog')).toBeTruthy()

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('reports a close through onOpenChange', async () => {
    const onOpenChange = vi.fn()
    render(() => <Example open onOpenChange={onOpenChange} />)

    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('marks the selected nav item active', () => {
    render(() => <Example defaultValue="profile" />)

    const profile = screen.getByRole('tab', { name: 'Profile' })
    const notifications = screen.getByRole('tab', { name: 'Notifications' })

    expect(profile.getAttribute('aria-selected')).toBe('true')
    expect(profile.getAttribute('data-state')).toBe('active')
    expect(notifications.getAttribute('aria-selected')).toBe('false')
    expect(notifications.getAttribute('data-state')).toBe('inactive')
  })

  it('switches panels when a nav item is clicked', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <Example defaultValue="profile" onValueChange={onValueChange} />
    ))

    expect(screen.getByRole('tabpanel').textContent).toContain('Profile body')

    await userEvent.click(screen.getByRole('tab', { name: 'Notifications' }))

    expect(onValueChange).toHaveBeenCalledWith('notifications')
    expect(screen.getByRole('tabpanel').textContent).toContain(
      'Notifications body',
    )
  })

  it('keeps every panel in the DOM, hiding the inactive ones', () => {
    render(() => <Example defaultValue="profile" />)

    const panels = document.querySelectorAll('[data-slot="settings-panel"]')
    expect(panels).toHaveLength(2)
    expect(panels[0]?.getAttribute('data-state')).toBe('active')
    expect(panels[1]?.getAttribute('data-state')).toBe('inactive')
  })

  it('honours an explicit active prop over the dialog value', () => {
    render(() => (
      <SettingsDialog.Root defaultOpen defaultValue="beta">
        <SettingsDialog.Sidebar>
          <SettingsDialog.NavItem value="alpha" active>
            Alpha
          </SettingsDialog.NavItem>
          <SettingsDialog.NavItem value="beta">Beta</SettingsDialog.NavItem>
        </SettingsDialog.Sidebar>
      </SettingsDialog.Root>
    ))

    expect(
      screen.getByRole('tab', { name: 'Alpha' }).getAttribute('data-state'),
    ).toBe('active')
  })

  it('renders the header title, description and actions', () => {
    render(() => (
      <SettingsDialog.Root defaultOpen defaultValue="profile">
        <SettingsDialog.Content>
          <SettingsDialog.Panel value="profile">
            <SettingsDialog.Header
              title="Profile"
              description="Your details"
              actions={<button type="button">Save</button>}
            />
            <SettingsDialog.Body>Body</SettingsDialog.Body>
          </SettingsDialog.Panel>
        </SettingsDialog.Content>
      </SettingsDialog.Root>
    ))

    expect(screen.getByText('Profile')).toBeTruthy()
    expect(screen.getByText('Your details')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy()
  })

  it('associates a row title with the control through labelFor', () => {
    render(() => (
      <SettingsDialog.Root defaultOpen defaultValue="profile">
        <SettingsDialog.Content>
          <SettingsDialog.Panel value="profile">
            <SettingsDialog.Row title="Display name" labelFor="display-name">
              <input id="display-name" type="text" />
            </SettingsDialog.Row>
          </SettingsDialog.Panel>
        </SettingsDialog.Content>
      </SettingsDialog.Root>
    ))

    const label = screen.getByText('Display name')
    expect(label.tagName).toBe('LABEL')
    expect(label.getAttribute('for')).toBe('display-name')
  })

  it('detects the control id for the row title when labelFor is omitted', () => {
    render(() => (
      <SettingsDialog.Root defaultOpen defaultValue="profile">
        <SettingsDialog.Content>
          <SettingsDialog.Panel value="profile">
            <SettingsDialog.Row title="Display name">
              <input id="auto-name" type="text" />
            </SettingsDialog.Row>
          </SettingsDialog.Panel>
        </SettingsDialog.Content>
      </SettingsDialog.Root>
    ))

    const label = screen.getByText('Display name')
    expect(label.tagName).toBe('LABEL')
    expect(label.getAttribute('for')).toBe('auto-name')
  })
})
