import { GaugeChart } from '@talelk/newui-charts'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

function TargetGauge(props: { loading?: boolean; error?: string }) {
  return (
    <GaugeChart
      title="Quarter to target"
      value={72}
      min={0}
      max={100}
      caption="of target"
      format={(value) => `${value}%`}
      height={200}
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
  return <TargetGauge />
}

const meta = {
  title: 'Organisms/GaugeChart',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

export const Loading: Story = {
  render: () => <TargetGauge loading />,
}

export const Error: Story = {
  render: () => <TargetGauge error="Could not load the reading." />,
}
