import { HeatmapChart } from '@newui/charts'
import { ChartDemoControls } from './chart-demo-state'
export default function Demo() {
  return (
    <ChartDemoControls
      data={[
        { day: 'Mon', team: 'Sales', value: 12 },
        { day: 'Tue', team: 'Sales', value: 18 },
      ]}
    >
      {(state) => (
        <HeatmapChart
          title="Monthly activity"
          data={state().data}
          x="day"
          y="team"
          value="value"
          loading={state().loading}
          error={state().error}
        />
      )}
    </ChartDemoControls>
  )
}
