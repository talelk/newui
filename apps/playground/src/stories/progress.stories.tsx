import { Progress } from '@newui/ui'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex max-w-sm flex-col gap-3">
      <Progress value={40} aria-label="Upload progress" />
      <Progress value={72} aria-label="Storage used" />
      <Progress value={30} label="Uploading" hint />
      <Progress indeterminate aria-label="Loading report" />
    </div>
  )
}

const meta = {
  title: 'Components/Feedback/Progress',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
