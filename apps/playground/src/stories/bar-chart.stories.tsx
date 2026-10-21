import { BarChart, ChartCard } from '@newui/charts'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { ChartDemoControls, MONTHLY_ACTIVITY } from './chart-demo-state'

function ActivityChart(props: {
  loading?: boolean
  error?: string
  data?: typeof MONTHLY_ACTIVITY
}) {
  return (
    <ChartCard>
      <BarChart
        title="Monthly activity"
        data={props.data ?? MONTHLY_ACTIVITY}
        x="month"
        y="value"
        loading={props.loading}
        error={props.error}
      />
    </ChartCard>
  )
}

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  return (
    <ChartDemoControls data={MONTHLY_ACTIVITY}>
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
  title: 'Organisms/BarChart',
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
