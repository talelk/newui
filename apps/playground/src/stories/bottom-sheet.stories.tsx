import { Button, Switch } from '@newui/atoms'
import { BottomSheet } from '@newui/molecules'
import { createSignal, For } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

function Example(props: {
  open?: boolean
  onOpenChange?: (value: boolean) => void
}) {
  const [dismissible, setDismissible] = createSignal(true)
  const [uncontrolledOpen, setUncontrolledOpen] = createSignal(false)
  const open = () => props.open ?? uncontrolledOpen()
  const setOpen = (value: boolean) => {
    if (props.open === undefined) setUncontrolledOpen(value)
    props.onOpenChange?.(value)
  }
  return (
    <>
      <Switch
        label="Allow sheet dismissal"
        checked={dismissible()}
        onCheckedChange={setDismissible}
      />
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open preferences drawer
      </Button>
      <BottomSheet
        open={open()}
        onOpenChange={setOpen}
        title="Preferences"
        dismissible={dismissible()}
      >
        <div class="flex flex-col gap-5">
          <Switch label="Weekly digest" defaultChecked />
          <For each={Array.from({ length: 24 }, (_, index) => index + 1)}>
            {(number) => (
              <p>
                Preference guidance {number}: scroll this content without
                closing the sheet.
              </p>
            )}
          </For>
          <Button variant="solid" theme="blue" onClick={() => setOpen(false)}>
            Save preferences
          </Button>
        </div>
      </BottomSheet>
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
  title: 'Molecules/Overlays/BottomSheet',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** The sheet open on first render; Escape still dismisses it. */
export const Open: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)
    return <Example open={open()} onOpenChange={setOpen} />
  },
}
