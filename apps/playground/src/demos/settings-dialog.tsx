import { Button, SettingsDialog, Switch } from '@newui/ui'
import { createSignal } from 'solid-js'
export default function Demo() {
  const [open, setOpen] = createSignal(false)
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open workspace settings
      </Button>
      <SettingsDialog.Root
        open={open()}
        onOpenChange={setOpen}
        defaultValue="notifications"
      >
        <SettingsDialog.Sidebar>
          <SettingsDialog.NavGroup label="Preferences">
            <SettingsDialog.NavItem value="notifications">
              Notifications
            </SettingsDialog.NavItem>
          </SettingsDialog.NavGroup>
        </SettingsDialog.Sidebar>
        <SettingsDialog.Content>
          <SettingsDialog.Panel value="notifications">
            <SettingsDialog.Header title="Notifications" />
            <SettingsDialog.Body>
              <Switch label="Weekly digest" defaultChecked />
              <Button
                class="mt-5"
                variant="solid"
                theme="blue"
                onClick={() => setOpen(false)}
              >
                Save preferences
              </Button>
            </SettingsDialog.Body>
          </SettingsDialog.Panel>
        </SettingsDialog.Content>
      </SettingsDialog.Root>
    </>
  )
}
