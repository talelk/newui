import { NumberCard } from '@talelk/newui-charts'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

function RevenueCard(props: { loading?: boolean; error?: string }) {
  return (
    <NumberCard
      title="Revenue"
      value={24680}
      target={30000}
      prefix="$"
      delta={12.8}
      deltaSuffix="%"
      deltaCaption="from $21,880 last month"
      sparkline={{ data: [12, 15, 13, 18, 17, 21, 24] }}
      loading={props.loading}
      error={props.error}
    />
  )
}

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  return <RevenueCard />
}

const meta = {
  title: 'Molecules/NumberCard',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

export const Loading: Story = {
  render: () => <RevenueCard loading />,
}

export const Error: Story = {
  render: () => <RevenueCard error="Could not load revenue." />,
}
