import { Timeline } from '@newui/molecules'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="max-w-md">
      <Timeline
        items={[
          {
            title: 'Deployed to production',
            description: 'v2.4.1 · 3 minutes',
            timestamp: '2h ago',
            icon: 'lucide-rocket',
            tone: 'green',
          },
          {
            title: 'Reviewed by Ana Costa',
            description: 'Approved with two comments.',
            timestamp: '5h ago',
            icon: 'lucide-check',
            tone: 'blue',
          },
          {
            title: 'Opened by Sam Rivera',
            description: 'Fixes the empty state on the invoices list.',
            timestamp: '1d ago',
          },
        ]}
      />
    </div>
  )
}

const meta = {
  title: 'Molecules/Display/Timeline',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
