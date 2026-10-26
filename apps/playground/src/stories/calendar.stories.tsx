import { Calendar } from '@talelk/newui-molecules'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex max-w-2xl gap-6">
      <Calendar aria-label="Booking date" defaultValue="2026-10-26" />
      <Calendar aria-label="Billing period start" dualPane min="2026-01-01" />
    </div>
  )
}

const meta = {
  title: 'Molecules/Selection/Calendar',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
