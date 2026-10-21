import { DateRangePicker } from '@talelk/newui-molecules'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  return (
    <div class="max-w-md">
      <DateRangePicker
        label="Reporting period"
        description="Choose a start and end date."
        defaultValue={['2026-09-01', '2026-09-30']}
        clearable
      />
      <div class="mt-5">
        <DateRangePicker
          label="Required period"
          error="Choose a complete date range."
          required
        />
      </div>
    </div>
  )
}

const meta = {
  title: 'Molecules/Selection/DateRangePicker',
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
    <div class="max-w-md">
      <DateRangePicker
        label="Reporting period"
        description="Choose a start and end date."
        defaultValue={['2026-09-01', '2026-09-30']}
        clearable
        disabled
      />
    </div>
  ),
}

/** Invalid: the error message and styling are visible on the field. */
export const Invalid: Story = {
  render: () => (
    <div class="max-w-md">
      <DateRangePicker
        label="Reporting period"
        description="Choose a start and end date."
        defaultValue={['2026-09-01', '2026-09-30']}
        clearable
        error="Choose a complete date range."
      />
    </div>
  ),
}
