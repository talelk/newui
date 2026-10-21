import { Avatar } from '@talelk/newui-atoms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex flex-wrap items-center gap-3">
      <Avatar size="xs" label="Alex Rivera" />
      <Avatar size="md" label="Sam Lee" />
      <Avatar size="lg" theme="blue" label="Jordan Park" />
      <Avatar size="2xl" shape="square" theme="green" label="Acme" />
    </div>
  )
}

const meta = {
  title: 'Atoms/Display/Avatar',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
