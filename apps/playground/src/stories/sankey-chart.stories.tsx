import { SankeyChart } from '@newui/charts'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { ChartDemoControls } from './chart-demo-state'

const SANKEY_ACTIVITY = [
  { from: 'Visits', to: 'Trials', value: 60 },
  { from: 'Trials', to: 'Paid', value: 24 },
]

function ActivityChart(props: {
  loading?: boolean
  error?: string
  data?: typeof SANKEY_ACTIVITY
}) {
  return (
    <SankeyChart
      title="Monthly activity"
      data={props.data ?? SANKEY_ACTIVITY}
      source="from"
      target="to"
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
    <ChartDemoControls data={SANKEY_ACTIVITY}>
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
  title: 'Charts/SankeyChart',
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
