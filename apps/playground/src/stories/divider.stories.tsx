import { Divider } from '@newui/atoms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex max-w-md flex-col gap-4">
      <Divider />
      <Divider label="or" />
      <Divider label="Section" action={{ label: 'Clear', onClick: () => {} }} />
    </div>
  )
}

const meta = {
  title: 'Atoms/Display/Divider',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
