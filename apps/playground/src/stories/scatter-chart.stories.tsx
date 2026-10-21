import { ScatterChart } from '@talelk/newui-charts'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { ChartDemoControls } from './chart-demo-state'

const SCATTER_ACTIVITY = [
  { cost: 10, revenue: 20 },
  { cost: 20, revenue: 35 },
]

function ActivityChart(props: {
  loading?: boolean
  error?: string
  data?: typeof SCATTER_ACTIVITY
}) {
  return (
    <ScatterChart
      title="Monthly activity"
      data={props.data ?? SCATTER_ACTIVITY}
      x="cost"
      y="revenue"
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
    <ChartDemoControls data={SCATTER_ACTIVITY}>
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
  title: 'Organisms/ScatterChart',
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
