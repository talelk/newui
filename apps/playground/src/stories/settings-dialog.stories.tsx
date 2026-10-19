import { Button, SettingsDialog, Switch } from '@newui/ui'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

function Example(props: {
  open?: boolean
  onOpenChange?: (value: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = createSignal(false)
  const open = () => props.open ?? uncontrolledOpen()
  const setOpen = (value: boolean) => {
    if (props.open === undefined) setUncontrolledOpen(value)
    props.onOpenChange?.(value)
  }
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

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  return <Example />
}

const meta = {
  title: 'Components/Patterns/SettingsDialog',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** The dialog open on first render; Escape still dismisses it. */
export const Open: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)
    return <Example open={open()} onOpenChange={setOpen} />
  },
}
