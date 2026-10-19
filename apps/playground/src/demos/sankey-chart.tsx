import { SankeyChart } from '@newui/charts'
import { ChartDemoControls } from './chart-demo-state'
export default function Demo() {
  return (
    <ChartDemoControls
      data={[
        { from: 'Visits', to: 'Trials', value: 60 },
        { from: 'Trials', to: 'Paid', value: 24 },
      ]}
    >
      {(state) => (
        <SankeyChart
          title="Monthly activity"
          data={state().data}
          source="from"
          target="to"
          value="value"
          loading={state().loading}
          error={state().error}
        />
      )}
    </ChartDemoControls>
  )
}
