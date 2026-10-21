import { TabButtons } from '@talelk/newui-molecules'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex flex-col gap-3">
      <TabButtons
        options={[
          { label: 'Unread', value: 'unread' },
          { label: 'All', value: 'all' },
        ]}
      />
      <TabButtons
        variant="underline"
        options={[
          { label: 'Overview', value: 'a', icon: 'lucide-house' },
          { label: 'Activity', value: 'b', icon: 'lucide-bell' },
        ]}
      />
    </div>
  )
}

const meta = {
  title: 'Molecules/Disclosure/TabButtons',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Disabled: one option in each control is muted and skipped. */
export const Disabled: Story = {
  render: () => (
    <div class="flex flex-col gap-3">
      <TabButtons
        options={[
          { label: 'Unread', value: 'unread' },
          { label: 'All', value: 'all', disabled: true },
        ]}
      />
      <TabButtons
        variant="underline"
        options={[
          { label: 'Overview', value: 'a', icon: 'lucide-house' },
          {
            label: 'Activity',
            value: 'b',
            icon: 'lucide-bell',
            disabled: true,
          },
        ]}
      />
    </div>
  ),
}
