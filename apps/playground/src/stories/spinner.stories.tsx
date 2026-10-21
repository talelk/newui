import { LoadingText, Spinner } from '@talelk/newui-atoms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex items-center gap-4">
      <LoadingText>Loading records…</LoadingText>
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" track />
      <Spinner theme="blue" />
      <Spinner theme="red" />
    </div>
  )
}

const meta = {
  title: 'Atoms/Feedback/Spinner',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
