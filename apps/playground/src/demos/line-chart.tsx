import { ChartCard, LineChart } from '@newui/charts'
import { ChartDemoControls, MONTHLY_ACTIVITY } from './chart-demo-state'
export default function Demo() {
  return (
    <ChartDemoControls data={MONTHLY_ACTIVITY}>
      {(state) => (
        <ChartCard>
          <LineChart
            title="Monthly activity"
            data={state().data}
            x="month"
            y="value"
            loading={state().loading}
            error={state().error}
          />
        </ChartCard>
      )}
    </ChartDemoControls>
  )
}
