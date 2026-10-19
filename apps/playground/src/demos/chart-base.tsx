import {
  BarChart,
  buildAxisChartOption,
  ChartBase,
  ChartCard,
  normalizeAxisChart,
  useChartTokens,
} from '@newui/charts'

const data = [
  { month: 'Jan', value: 12 },
  { month: 'Feb', value: 18 },
  { month: 'Mar', value: 15 },
]
export default function Demo() {
  const tokens = useChartTokens()
  // BarChart registers the engine; custom consumers register the ECharts modules
  // they use before mounting ChartBase, as described in the package guide.
  return (
    <div class="grid gap-4 sm:grid-cols-2">
      <ChartCard>
        <BarChart title="High-level wrapper" data={data} x="month" y="value" />
      </ChartCard>
      <ChartCard>
        <ChartBase
          title="Custom option builder"
          label="Custom activity"
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
