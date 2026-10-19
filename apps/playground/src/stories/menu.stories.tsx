import { Menu } from '@newui/ui'
import { createSignal, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

function Example(props: {
  open?: boolean
  onOpenChange?: (value: boolean) => void
}) {
  return (
    <Menu.Root open={props.open} onOpenChange={props.onOpenChange}>
      <Menu.Trigger class="rounded-4 bg-surface-gray-10 px-3 py-1.5 text-base text-ink-base">
        Actions
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item value="edit">Edit</Menu.Item>
        <Menu.Item value="duplicate">Duplicate</Menu.Item>
        <Menu.Separator />
        <Menu.Item value="delete">Delete</Menu.Item>
      </Menu.Content>
    </Menu.Root>
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
  title: 'Components/Actions/Menu',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** The menu open on first render; Escape still dismisses it. */
export const Open: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)
    return <Example open={open()} onOpenChange={setOpen} />
  },
}
