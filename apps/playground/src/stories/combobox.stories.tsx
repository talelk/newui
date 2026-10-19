import { Combobox } from '@newui/ui'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

const options = [
  { label: 'Alex Rivera', value: 'alex', description: 'Owner' },
  { label: 'Sam Lee', value: 'sam', description: 'Designer' },
  { label: 'Jordan Park', value: 'jordan' },
]

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="max-w-sm">
      <Combobox
        label="Assignee"
        placeholder="Search people…"
        options={options}
      />
    </div>
  )
}

const meta = {
  title: 'Components/Selection/Combobox',
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
      <Combobox
        label="Assignee"
        placeholder="Search people…"
        options={options}
        disabled
      />
    </div>
  ),
}

/** Invalid: the error message and styling are visible on the field. */
export const Invalid: Story = {
  render: () => (
    <div class="max-w-sm">
      <Combobox
        label="Assignee"
        placeholder="Search people…"
        options={options}
        error="Choose an assignee"
      />
    </div>
  ),
}

/** Loading: an open list with the loading row where the results belong. */
export const Loading: Story = {
  render: () => (
    <div class="max-w-sm">
      <Combobox
        label="Assignee"
        placeholder="Search people…"
        options={[]}
        loading
        defaultOpen
      />
    </div>
  ),
}
