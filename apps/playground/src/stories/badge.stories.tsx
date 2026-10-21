import { Badge, Icon } from '@newui/atoms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex flex-wrap items-center gap-2">
      <Badge variant="solid" theme="gray" label="Default" />
      <Badge variant="subtle" theme="blue" label="Info" />
      <Badge variant="outline" theme="green" label="Active" />
      <Badge variant="ghost" theme="amber" label="Pending" />
      <Badge variant="solid" theme="red" label="Failed" />
      <Badge
        theme="green"
        label="Verified"
        prefix={<Icon icon="lucide-check" class="size-2.5" />}
      />
    </div>
  )
}

const meta = {
  title: 'Atoms/Display/Badge',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
