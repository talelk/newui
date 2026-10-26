import { IconButton } from '@talelk/newui-atoms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex items-center gap-2">
      <IconButton label="Add row" icon="lucide-plus" />
      <IconButton label="Filter" icon="lucide-filter" variant="outline" />
      <IconButton
        label="Confirm"
        icon="lucide-check"
        variant="solid"
        theme="blue"
      />
      <IconButton
        label="Delete"
        icon="lucide-trash-2"
        variant="ghost"
        theme="red"
      />
    </div>
  )
}

const meta = {
  title: 'Atoms/Actions/IconButton',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** A disabled command still reads as itself. */
export const Disabled: Story = {
  render: () => (
    <div class="flex items-center gap-2">
      <IconButton label="Add row" icon="lucide-plus" disabled />
      <IconButton
        label="Confirm"
        icon="lucide-check"
        variant="solid"
        theme="blue"
        disabled
      />
    </div>
  ),
}
