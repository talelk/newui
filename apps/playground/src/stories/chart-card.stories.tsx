import { BarChart, ChartCard } from '@newui/charts'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  return (
    <ChartCard>
      <BarChart
        title="Revenue by channel"
        subtitle="Paid revenue · USD · last 30 days"
        data={[
          { channel: 'Organic', revenue: 120 },
          { channel: 'Referral', revenue: 86 },
          { channel: 'Ads', revenue: 64 },
        ]}
        x="channel"
        y="revenue"
        height={220}
      />
    </ChartCard>
  )
}

const meta = {
  title: 'Molecules/ChartCard',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
