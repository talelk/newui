import { FormControl } from '@newui/ui'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex max-w-sm flex-col gap-4">
      <FormControl label="Title" description="Shown in the list" />
      <FormControl type="textarea" label="Description" />
      <FormControl
        type="select"
        label="Status"
        placeholder="Choose"
        options={[
          { label: 'Draft', value: 'draft' },
          { label: 'Paid', value: 'paid' },
        ]}
      />
      <FormControl type="checkbox" label="Notify the team" />
    </div>
  )
}

const meta = {
  title: 'Components/Inputs/FormControl',
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
      <FormControl label="Title" description="Shown in the list" disabled />
    </div>
  ),
}

/** Invalid: the error message and styling are visible on the field. */
export const Invalid: Story = {
  render: () => (
    <div class="flex max-w-sm flex-col gap-4">
      <FormControl
        label="Title"
        description="Shown in the list"
        error="Enter a title"
      />
    </div>
  ),
}
