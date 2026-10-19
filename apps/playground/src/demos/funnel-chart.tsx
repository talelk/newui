import { FunnelChart } from '@newui/charts'
import { ChartDemoControls, STAGE_ACTIVITY } from './chart-demo-state'
export default function Demo() {
  return (
    <ChartDemoControls data={STAGE_ACTIVITY}>
      {(state) => (
        <FunnelChart
          title="Monthly activity"
          data={state().data}
          category="name"
          value="value"
          loading={state().loading}
          error={state().error}
        />
      )}
    </ChartDemoControls>
  )
}
