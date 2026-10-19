import { Dialog } from '@newui/ui'
import { createSignal, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

function Example(props: {
  open?: boolean
  onOpenChange?: (value: boolean) => void
}) {
  return (
    <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
      <Dialog.Trigger class="rounded-4 bg-surface-gray-10 px-3 py-1.5 text-base text-ink-base">
        Open dialog
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header icon="lucide-circle-check" theme="green">
          <Dialog.Title>Confirm</Dialog.Title>
        </Dialog.Header>
        <Dialog.Description>
          Are you sure you want to continue?
        </Dialog.Description>
        <Dialog.Footer
          actions={[
            { label: 'Cancel', variant: 'subtle' },
            { label: 'Save', variant: 'solid', theme: 'blue' },
          ]}
        />
      </Dialog.Content>
    </Dialog.Root>
  )
}

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return <Example />
}

const meta = {
  title: 'Components/Overlays/Dialog',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** The panel open on first render; Escape still dismisses it. */
export const Open: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)
    return <Example open={open()} onOpenChange={setOpen} />
  },
}
