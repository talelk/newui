import { Slider } from '@newui/ui'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex max-w-sm flex-col gap-4">
      <Slider defaultValue={[35]} aria-label="Amount" />
      <Slider size="md" defaultValue={[60]} aria-label="Large amount" />
    </div>
  )
}

const meta = {
  title: 'Components/Inputs/Slider',
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
    <div class="flex max-w-sm flex-col gap-4">
      <Slider defaultValue={[35]} aria-label="Amount" disabled />
    </div>
  ),
}

/** Invalid: the error message and styling are visible on the field. */
export const Invalid: Story = {
  render: () => (
    <div class="flex max-w-sm flex-col gap-4">
      <Slider
        defaultValue={[35]}
        aria-label="Amount"
        error="This amount is invalid"
      />
    </div>
  ),
}
