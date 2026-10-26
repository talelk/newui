import { Avatar } from '@talelk/newui-atoms'
import { MessageListItem } from '@talelk/newui-molecules'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex max-w-md flex-col gap-1">
      <MessageListItem
        as="button"
        sender="Ana Costa"
        subject="Invoice 4821"
        snippet="Added the late fee line — take a look"
        time="14:32"
        unread
        avatar={<Avatar size="sm" theme="blue" label="Ana Costa" />}
      />
      <MessageListItem
        as="button"
        sender="Sam Rivera"
        subject="Q4 numbers"
        snippet="Shared the sheet with the finance group"
        time="12:02"
        avatar={<Avatar size="sm" theme="green" label="Sam Rivera" />}
      />
      <MessageListItem
        as="button"
        sender="Acme billing"
        subject="Your receipt"
        snippet="No action needed"
        time="Mon"
        avatar={<Avatar size="sm" theme="gray" label="Acme billing" />}
      />
    </div>
  )
}

const meta = {
  title: 'Molecules/Display/MessageListItem',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Selected: the open conversation carries the blue frame. */
export const Selected: Story = {
  render: () => (
    <div class="flex max-w-md flex-col gap-1">
      <MessageListItem
        as="button"
        sender="Ana Costa"
        subject="Invoice 4821"
        snippet="Added the late fee line — take a look"
        time="14:32"
        selected
        avatar={<Avatar size="sm" theme="blue" label="Ana Costa" />}
      />
      <MessageListItem
        as="button"
        sender="Sam Rivera"
        subject="Q4 numbers"
        time="12:02"
        unread
        avatar={<Avatar size="sm" theme="green" label="Sam Rivera" />}
      />
    </div>
  ),
}

/** Disabled: a muted, non-acting row beside a live one. */
export const Disabled: Story = {
  render: () => (
    <div class="flex max-w-md flex-col gap-1">
      <MessageListItem
        sender="Acme billing"
        subject="Automated digest"
        time="Mon"
        disabled
        aria-disabled="true"
      />
      <MessageListItem
        sender="Sam Rivera"
        subject="Q4 numbers"
        time="12:02"
        as="button"
      />
    </div>
  ),
}
