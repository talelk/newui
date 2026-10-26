import { TimeRangePicker } from '@talelk/newui-molecules'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex max-w-md flex-col gap-6">
      <TimeRangePicker label="Shift" defaultValue={['09:00', '17:00']} />
      <TimeRangePicker label="Night shift" defaultValue={['22:00', '06:00']} />
    </div>
  )
}

const meta = {
  title: 'Molecules/Selection/TimeRangePicker',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
