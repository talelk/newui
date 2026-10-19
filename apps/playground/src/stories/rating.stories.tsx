import { Rating } from '@newui/ui'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex flex-col gap-3">
      <Rating defaultValue={3} />
      <Rating defaultValue={3.5} step={0.5} />
      <Rating defaultValue={3} max={10} />
    </div>
  )
}

const meta = {
  title: 'Components/Inputs/Rating',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Disabled: the stars keep their shape but cannot be operated. */
export const Disabled: Story = {
  render: () => <Rating defaultValue={3} disabled />,
}

/** Invalid: the error message and styling are visible on the field. */
export const Invalid: Story = {
  render: () => <Rating defaultValue={3} error="Choose a rating" />,
}
