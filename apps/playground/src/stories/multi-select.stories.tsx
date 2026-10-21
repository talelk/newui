import { MultiSelect } from '@newui/molecules'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

const options = [
  { label: 'Bug', value: 'bug' },
  { label: 'Feature', value: 'feature' },
  { label: 'Docs', value: 'docs' },
]

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="max-w-sm">
      <MultiSelect label="Labels" placeholder="Add labels…" options={options} />
    </div>
  )
}

const meta = {
  title: 'Molecules/Selection/MultiSelect',
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
      <MultiSelect
        label="Labels"
        placeholder="Add labels…"
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
      <MultiSelect
        label="Labels"
        placeholder="Add labels…"
        options={options}
        error="Add at least one label"
      />
    </div>
  ),
}

/** Loading: an open list with the loading row where the results belong. */
export const Loading: Story = {
  render: () => (
    <div class="max-w-sm">
      <MultiSelect
        label="Labels"
        placeholder="Add labels…"
        options={[]}
        loading
        defaultOpen
      />
    </div>
  ),
}
