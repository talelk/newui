import { ChartCard, ChartLegend, DonutChart } from '@newui/charts'
import { ChartDemoControls, STAGE_ACTIVITY } from './chart-demo-state'
export default function Demo() {
  return (
    <ChartDemoControls data={STAGE_ACTIVITY}>
      {(state) => (
        <ChartCard>
          <DonutChart
            title="Monthly activity"
            data={state().data}
            category="name"
            value="value"
            loading={state().loading}
            error={state().error}
          />
          <ChartLegend
            items={state().data.map((row, index) => ({
              name: row.name,
              label: row.name,
              color: `var(--chart-${index + 1})`,
              hint: String(row.value),
            }))}
          />
        </ChartCard>
      )}
    </ChartDemoControls>
  )
}
