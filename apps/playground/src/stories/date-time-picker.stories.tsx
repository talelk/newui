import { DateTimePicker } from '@talelk/newui-molecules'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  return (
    <div class="max-w-sm">
      <DateTimePicker
        label="Schedule report"
        description="Reports are generated at this local date and time."
        defaultValue="2026-09-30T09:00"
        clearable
      />
    </div>
  )
}

const meta = {
  title: 'Molecules/Selection/DateTimePicker',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Disabled: the field keeps its shape but cannot be operated. */
export const Disabled: Story = {
  render: () => (
    <div class="max-w-sm">
      <DateTimePicker
        label="Schedule report"
        description="Reports are generated at this local date and time."
        defaultValue="2026-09-30T09:00"
        clearable
        disabled
      />
    </div>
  ),
}

/** Invalid: the error message and styling are visible on the field. */
export const Invalid: Story = {
  render: () => (
    <div class="max-w-sm">
      <DateTimePicker
        label="Schedule report"
        description="Reports are generated at this local date and time."
        defaultValue="2026-09-30T09:00"
        clearable
        error="Choose a date and time"
      />
    </div>
  ),
}
