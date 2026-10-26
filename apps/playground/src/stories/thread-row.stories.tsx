import { Avatar } from '@talelk/newui-atoms'
import { ThreadRow } from '@talelk/newui-molecules'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex max-w-md flex-col gap-1">
      <ThreadRow
        as="button"
        title="Renewal pricing for Q1"
        snippet="Procurement signed off on the 8% tier"
        meta="12 replies · #pricing"
        time="2h"
        unread
        avatar={<Avatar size="sm" shape="square" theme="violet" label="P" />}
      />
      <ThreadRow
        as="button"
        title="Office move, week 42"
        snippet="Desk assignments are posted"
        meta="3 replies · #general"
        time="1d"
        avatar={<Avatar size="sm" shape="square" theme="green" label="O" />}
      />
      <ThreadRow
        as="button"
        title="Retrospective notes"
        snippet="Action items assigned"
        meta="8 replies · #team"
        time="3d"
        avatar={<Avatar size="sm" shape="square" theme="gray" label="R" />}
      />
    </div>
  )
}

const meta = {
  title: 'Molecules/Display/ThreadRow',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Selected: the open thread carries the blue frame. */
export const Selected: Story = {
  render: () => (
    <div class="flex max-w-md flex-col gap-1">
      <ThreadRow
        as="button"
        title="Renewal pricing for Q1"
        snippet="Procurement signed off on the 8% tier"
        meta="12 replies · #pricing"
        time="2h"
        selected
        avatar={<Avatar size="sm" shape="square" theme="violet" label="P" />}
      />
      <ThreadRow
        as="button"
        title="Office move, week 42"
        meta="3 replies · #general"
        time="1d"
        unread
        avatar={<Avatar size="sm" shape="square" theme="green" label="O" />}
      />
    </div>
  ),
}

/** Disabled: a locked thread beside live ones. */
export const Disabled: Story = {
  render: () => (
    <div class="flex max-w-md flex-col gap-1">
      <ThreadRow
        title="Archived: 2023 planning"
        meta="Locked"
        disabled
        aria-disabled="true"
      />
      <ThreadRow
        as="button"
        title="Retrospective notes"
        meta="8 replies"
        time="3d"
      />
    </div>
  ),
}
