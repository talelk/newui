import { ChartLegend } from '@newui/charts'
import { createSignal } from 'solid-js'
export default function Demo() {
  const [hidden, setHidden] = createSignal(false)
  return (
    <ChartLegend
      items={[
        {
          name: 'revenue',
          label: 'Revenue',
          color: 'var(--chart-1)',
          hidden: hidden(),
        },
      ]}
      onToggle={() => setHidden(!hidden())}
    />
  )
}
