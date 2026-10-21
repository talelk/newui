import { Tooltip } from '@talelk/newui-atoms'
import { createSignal, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

function Example(props: {
  open?: boolean
  onOpenChange?: (value: boolean) => void
}) {
  return (
    <Tooltip
      text="Add a new item"
      open={props.open}
      onOpenChange={props.onOpenChange}
    >
      <span class="rounded-4 bg-surface-gray-2 px-3 py-1.5 text-base">
        Hover me
      </span>
    </Tooltip>
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
  title: 'Atoms/Overlays/Tooltip',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** The bubble rendered open, anchored to its trigger. */
export const Open: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)
    return <Example open={open()} onOpenChange={setOpen} />
  },
}
