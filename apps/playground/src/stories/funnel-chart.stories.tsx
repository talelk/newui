import { FunnelChart } from '@talelk/newui-charts'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { ChartDemoControls, STAGE_ACTIVITY } from './chart-demo-state'

function StageChart(props: {
  loading?: boolean
  error?: string
  data?: typeof STAGE_ACTIVITY
}) {
  return (
    <FunnelChart
      title="Monthly activity"
      data={props.data ?? STAGE_ACTIVITY}
      category="name"
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
    <ChartDemoControls data={STAGE_ACTIVITY}>
      {(state) => (
        <StageChart
          data={state().data}
          loading={state().loading}
          error={state().error}
        />
      )}
    </ChartDemoControls>
  )
}

const meta = {
  title: 'Organisms/FunnelChart',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

export const Loading: Story = {
  render: () => <StageChart loading />,
}

export const Error: Story = {
  render: () => <StageChart error="Could not load activity." />,
}
