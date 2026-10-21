import { ProgressCircle } from '@talelk/newui-atoms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex flex-wrap items-center gap-8">
      <ProgressCircle value={72} size="sm" aria-label="Upload progress" />
      <ProgressCircle value={72} aria-label="Upload progress">
        <span class="text-2xs">72%</span>
      </ProgressCircle>
      <ProgressCircle value={32} size="lg" aria-label="Storage used" />
      <ProgressCircle indeterminate size="lg" aria-label="Loading" />
      <ProgressCircle value={100} size="xl" aria-label="Upload complete" />
    </div>
  )
}

const meta = {
  title: 'Atoms/Feedback/ProgressCircle',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
