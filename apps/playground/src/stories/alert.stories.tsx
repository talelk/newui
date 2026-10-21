import { Alert } from '@newui/molecules'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex max-w-md flex-col gap-2">
      <Alert theme="green" title="Saved" description="All changes stored." />
      <Alert
        theme="amber"
        title="Unsaved"
        description="Your edits are not stored."
      />
      <Alert theme="red" title="Could not connect" dismissible />
    </div>
  )
}

const meta = {
  title: 'Molecules/Feedback/Alert',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
