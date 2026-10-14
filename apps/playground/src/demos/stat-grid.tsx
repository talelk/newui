import { StatGrid } from '@newui/blocks'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <StatGrid
      stats={[
        {
          label: 'Net revenue',
          value: '$220.2K',
          hint: 'vs last month',
          delta: { value: '5.1%', direction: 'up' },
          icon: 'lucide-trending-up',
        },
        {
          label: 'Orders shipped',
          value: '2,560',
          hint: 'vs last month',
          delta: { value: '4.4%', direction: 'up' },
          icon: 'lucide-package',
        },
        {
          label: 'Monthly churn',
          value: '2.1%',
          hint: 'vs last month',
          delta: { value: '0.4 pts', direction: 'down', good: true },
          icon: 'lucide-user-minus',
        },
        {
          label: 'Average order value',
          value: '$86.02',
          hint: 'vs last month',
          delta: { value: '2.4%', direction: 'up' },
          icon: 'lucide-receipt',
        },
      ]}
    />
  )
}
