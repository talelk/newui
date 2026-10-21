import { Checkbox } from '@newui/atoms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex flex-col gap-3">
      <Checkbox label="Email me" defaultChecked />
      <Checkbox label="Subscribe" />
      <Checkbox label="Indeterminate" indeterminate />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Padded row" padded />
    </div>
  )
}

const meta = {
  title: 'Atoms/Inputs/Checkbox',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Disabled: the label survives, the affordance does not. */
export const Disabled: Story = {
  render: () => (
    <div class="max-w-sm">
      <Checkbox label="Email me" defaultChecked disabled />
    </div>
  ),
}

/** Invalid: an error message is visible under the field. */
export const Invalid: Story = {
  render: () => (
    <div class="max-w-sm">
      <Checkbox label="Email me" defaultChecked error="This field is invalid" />
    </div>
  ),
}
