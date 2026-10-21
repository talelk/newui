import { ToggleGroup } from '@newui/molecules'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex flex-wrap items-center gap-8">
      <ToggleGroup.Root
        variant="subtle"
        aria-label="Text alignment"
        defaultValue={['start']}
      >
        <ToggleGroup.Item
          value="start"
          icon="lucide-align-left"
          aria-label="Left"
        />
        <ToggleGroup.Item
          value="center"
          icon="lucide-align-center"
          aria-label="Centre"
        />
        <ToggleGroup.Item
          value="end"
          icon="lucide-align-right"
          aria-label="Right"
        />
      </ToggleGroup.Root>
      <ToggleGroup.Root
        variant="outline"
        size="md"
        aria-label="Density"
        defaultValue={['comfortable']}
      >
        <ToggleGroup.Item value="compact">Compact</ToggleGroup.Item>
        <ToggleGroup.Item value="comfortable">Comfortable</ToggleGroup.Item>
        <ToggleGroup.Item value="spacious">Spacious</ToggleGroup.Item>
      </ToggleGroup.Root>
      <ToggleGroup.Root variant="ghost" multiple aria-label="Filters">
        <ToggleGroup.Item value="mine" icon="lucide-user" aria-label="Mine" />
        <ToggleGroup.Item
          value="unread"
          icon="lucide-mail"
          aria-label="Unread"
        />
        <ToggleGroup.Item
          value="flagged"
          icon="lucide-flag"
          aria-label="Flagged"
        />
      </ToggleGroup.Root>
    </div>
  )
}

const meta = {
  title: 'Molecules/Selection/ToggleGroup',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Disabled: the selected cell stays selected, the row cannot be operated. */
export const Disabled: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-8">
      <ToggleGroup.Root
        variant="subtle"
        aria-label="Text alignment"
        defaultValue={['start']}
        disabled
      >
        <ToggleGroup.Item
          value="start"
          icon="lucide-align-left"
          aria-label="Left"
        />
        <ToggleGroup.Item
          value="center"
          icon="lucide-align-center"
          aria-label="Centre"
        />
        <ToggleGroup.Item
          value="end"
          icon="lucide-align-right"
          aria-label="Right"
        />
      </ToggleGroup.Root>
    </div>
  ),
}
