import { Icon } from '@newui/atoms'
import { CircleCheckIcon } from '@newui/icons'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  return (
    <div class="flex flex-wrap gap-4 text-ink-gray-7">
      <CircleCheckIcon class="size-5" />
      <Icon icon="lucide-search" class="size-5" />
      <Icon icon="lucide-chart-no-axes-combined" class="size-5" />
      <Icon icon="lucide-settings-2" class="size-5" />
      <Icon icon="lucide-check" class="size-5 text-ink-green-7" />
    </div>
  )
}

const meta = {
  title: 'Atoms/Display/Icon',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
