import { ScatterChart } from '@newui/charts'
import { ChartDemoControls } from './chart-demo-state'
export default function Demo() {
  return (
    <ChartDemoControls
      data={[
        { cost: 10, revenue: 20 },
        { cost: 20, revenue: 35 },
      ]}
    >
      {(state) => (
        <ScatterChart
          title="Monthly activity"
          data={state().data}
          x="cost"
          y="revenue"
          loading={state().loading}
          error={state().error}
        />
      )}
    </ChartDemoControls>
  )
}
