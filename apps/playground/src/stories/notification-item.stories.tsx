import { NotificationItem } from '@talelk/newui-molecules'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex max-w-md flex-col gap-1">
      <NotificationItem
        as="button"
        title="Contract approved"
        description="Acme · Master services agreement"
        icon="lucide-file-check-2"
        time="5m"
        unread
      />
      <NotificationItem
        as="button"
        title="Rhea Kapoor mentioned you"
        description="Discussions · Renewal pricing"
        icon="lucide-at-sign"
        time="22m"
      />
      <NotificationItem
        as="button"
        title="Export ready"
        description="invoices-november.csv"
        icon="lucide-download"
        time="1h"
      />
    </div>
  )
}

const meta = {
  title: 'Molecules/Display/NotificationItem',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Disabled: a read, archived notification beside live ones. */
export const Disabled: Story = {
  render: () => (
    <div class="flex max-w-md flex-col gap-1">
      <NotificationItem
        title="Old build failed"
        description="starter · deploy #402"
        icon="lucide-circle-x"
        time="2d"
        disabled
        aria-disabled="true"
      />
      <NotificationItem
        as="button"
        title="Contract approved"
        icon="lucide-file-check-2"
        time="5m"
        unread
      />
    </div>
  ),
}
