import { StatGrid } from '@newui/organisms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <StatGrid
      stats={[
        {
          label: 'Net revenue',
          value: '$220.2K',
          hint: 'from $209.5K last month',
          delta: { value: '5.1%', direction: 'up' },
          icon: 'lucide-trending-up',
        },
        {
          label: 'Orders shipped',
          value: '2,560',
          hint: 'from 2,452 last month',
          delta: { value: '4.4%', direction: 'up' },
          icon: 'lucide-package',
        },
        {
          label: 'Monthly churn',
          value: '2.1%',
          hint: 'from 2.5% last month',
          delta: { value: '0.4 pts', direction: 'down', good: true },
          icon: 'lucide-user-minus',
        },
        {
          label: 'Average order value',
          value: '$86.02',
          hint: 'from $84.00 last month',
          delta: { value: '2.4%', direction: 'up' },
          icon: 'lucide-receipt',
        },
      ]}
    />
  )
}

const meta = {
  title: 'Organisms/StatGrid',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
