import { Heading } from '@talelk/newui-atoms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex max-w-lg flex-col gap-3">
      <Heading level={1}>Quarterly review</Heading>
      <Heading level={2}>Revenue</Heading>
      <Heading level={3}>Recurring</Heading>
    </div>
  )
}

const meta = {
  title: 'Atoms/Display/Heading',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
