import {
  BarChart,
  buildAxisChartOption,
  ChartBase,
  ChartCard,
  normalizeAxisChart,
  useChartTokens,
} from '@talelk/newui-charts'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

const data = [
  { month: 'Jan', value: 12 },
  { month: 'Feb', value: 18 },
  { month: 'Mar', value: 15 },
]

function BaseCharts(props: { loading?: boolean; error?: string }) {
  const tokens = useChartTokens()
  // BarChart registers the engine; custom consumers register the ECharts modules
  // they use before mounting ChartBase, as described in the package guide.
  return (
    <div class="grid gap-4 sm:grid-cols-2">
      <ChartCard>
        <BarChart
          title="High-level wrapper"
          data={data}
          x="month"
          y="value"
          loading={props.loading}
          error={props.error}
        />
      </ChartCard>
      <ChartCard>
        <ChartBase
          title="Custom option builder"
          label="Custom activity"
          loading={props.loading}
          error={props.error}
          option={() =>
            buildAxisChartOption(
              normalizeAxisChart({ data, x: 'month', y: 'value' }, 'bar'),
              { tokens: tokens() },
            )
          }
          fallback={{
            columns: ['Month', 'Value'],
            rows: data.map((row) => [row.month, row.value]),
          }}
        />
      </ChartCard>
    </div>
  )
}

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  return <BaseCharts />
}

const meta = {
  title: 'Molecules/ChartBase',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

export const Loading: Story = {
  render: () => <BaseCharts loading />,
}

export const Error: Story = {
  render: () => <BaseCharts error="Could not load activity." />,
}
