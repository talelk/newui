import { AvatarGroup } from '@talelk/newui-atoms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

const ASSIGNEES = [
  { label: 'Rhea Kapoor' },
  { image: 'https://i.pravatar.cc/64?img=5', label: 'Marco Diaz' },
  { label: 'Ada Lovelace' },
  { label: 'Linus Ahlberg' },
  { label: 'Sofia Marino' },
]

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex max-w-md flex-col gap-4">
      <AvatarGroup avatars={ASSIGNEES} label="Assignees" />
      <AvatarGroup avatars={ASSIGNEES} size="lg" theme="blue" />
      <AvatarGroup avatars={ASSIGNEES.slice(0, 2)} size="sm" />
    </div>
  )
}

const meta = {
  title: 'Atoms/Display/AvatarGroup',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
