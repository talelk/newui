import { Popover } from '@newui/ui'
import { createSignal, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

function Example(props: {
  open?: boolean
  onOpenChange?: (value: boolean) => void
}) {
  return (
    <Popover.Root open={props.open} onOpenChange={props.onOpenChange}>
      <Popover.Trigger class="rounded-4 border border-outline-gray-2 px-3 py-1.5 text-base">
        Filters
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Filters</Popover.Title>
        <Popover.Description>
          Anchored to the trigger, portalled to the body.
        </Popover.Description>
      </Popover.Content>
    </Popover.Root>
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
  title: 'Components/Overlays/Popover',
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
