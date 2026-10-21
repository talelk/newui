import { HeatmapChart } from '@talelk/newui-charts'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { ChartDemoControls } from './chart-demo-state'

const HEATMAP_ACTIVITY = [
  { day: 'Mon', team: 'Sales', value: 12 },
  { day: 'Tue', team: 'Sales', value: 18 },
]

function ActivityChart(props: {
  loading?: boolean
  error?: string
  data?: typeof HEATMAP_ACTIVITY
}) {
  return (
    <HeatmapChart
      title="Monthly activity"
      data={props.data ?? HEATMAP_ACTIVITY}
      x="day"
      y="team"
      value="value"
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
  return (
    <ChartDemoControls data={HEATMAP_ACTIVITY}>
      {(state) => (
        <ActivityChart
          data={state().data}
          loading={state().loading}
          error={state().error}
        />
      )}
    </ChartDemoControls>
  )
}

const meta = {
  title: 'Organisms/HeatmapChart',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

export const Loading: Story = {
  render: () => <ActivityChart loading />,
}

export const Error: Story = {
  render: () => <ActivityChart error="Could not load activity." />,
}
