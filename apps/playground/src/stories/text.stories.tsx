import { Text } from '@talelk/newui-atoms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex max-w-lg flex-col gap-3">
      <Text size="lg">Large lead copy at the top of a page.</Text>
      <Text>Body copy carries the reading voice of the interface.</Text>
      <Text size="sm" weight="medium">
        Small medium — table footnotes and helper lines.
      </Text>
      <Text size="xs" class="text-ink-gray-6">
        Extra small metadata, muted one step.
      </Text>
    </div>
  )
}

const meta = {
  title: 'Atoms/Display/Text',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
