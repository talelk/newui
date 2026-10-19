import { Icon, ItemListRow } from '@newui/ui'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex max-w-sm flex-col gap-1">
      <ItemListRow active prefix={<Icon icon="lucide-house" class="size-4" />}>
        Home
      </ItemListRow>
      <ItemListRow prefix={<Icon icon="lucide-search" class="size-4" />}>
        Search
      </ItemListRow>
      <ItemListRow
        disabled
        aria-disabled="true"
        prefix={<Icon icon="lucide-settings" class="size-4" />}
      >
        Settings
      </ItemListRow>
    </div>
  )
}

const meta = {
  title: 'Components/Display/ItemListRow',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Selected: Home is chosen, alongside the demo's disabled Settings row. */
export const Selected: Story = {
  render: () => (
    <div class="flex max-w-sm flex-col gap-1">
      <ItemListRow
        selected
        prefix={<Icon icon="lucide-house" class="size-4" />}
      >
        Home
      </ItemListRow>
      <ItemListRow prefix={<Icon icon="lucide-search" class="size-4" />}>
        Search
      </ItemListRow>
      <ItemListRow
        disabled
        aria-disabled="true"
        prefix={<Icon icon="lucide-settings" class="size-4" />}
      >
        Settings
      </ItemListRow>
    </div>
  ),
}

/** Disabled: only Settings is muted; the other rows stay actionable. */
export const Disabled: Story = {
  render: () => (
    <div class="flex max-w-sm flex-col gap-1">
      <ItemListRow prefix={<Icon icon="lucide-house" class="size-4" />}>
        Home
      </ItemListRow>
      <ItemListRow prefix={<Icon icon="lucide-search" class="size-4" />}>
        Search
      </ItemListRow>
      <ItemListRow
        disabled
        aria-disabled="true"
        prefix={<Icon icon="lucide-settings" class="size-4" />}
      >
        Settings
      </ItemListRow>
    </div>
  ),
}
