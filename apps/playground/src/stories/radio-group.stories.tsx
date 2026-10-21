import { RadioGroup } from '@newui/molecules'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="max-w-sm">
      <RadioGroup
        label="Plan"
        defaultValue="pro"
        items={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro', description: 'Everything you need' },
          { value: 'team', label: 'Team' },
        ]}
      />
    </div>
  )
}

const meta = {
  title: 'Molecules/Inputs/RadioGroup',
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
      <RadioGroup
        label="Plan"
        defaultValue="pro"
        items={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro', description: 'Everything you need' },
          { value: 'team', label: 'Team' },
        ]}
        disabled
      />
    </div>
  ),
}

/** Invalid: the error message and styling are visible on the field. */
export const Invalid: Story = {
  render: () => (
    <div class="max-w-sm">
      <RadioGroup
        label="Plan"
        defaultValue="pro"
        items={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro', description: 'Everything you need' },
          { value: 'team', label: 'Team' },
        ]}
        error="This selection is invalid"
      />
    </div>
  ),
}
