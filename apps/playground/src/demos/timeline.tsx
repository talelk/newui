import { Timeline } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="max-w-md">
      <Timeline
        items={[
          {
            title: 'Deployed to production',
            description: 'v2.4.1 · 3 minutes',
            timestamp: '2h ago',
            icon: 'lucide-rocket',
            tone: 'green',
          },
          {
            title: 'Reviewed by Ana Costa',
            description: 'Approved with two comments.',
            timestamp: '5h ago',
            icon: 'lucide-check',
            tone: 'blue',
          },
          {
            title: 'Opened by Sam Rivera',
            description: 'Fixes the empty state on the invoices list.',
            timestamp: '1d ago',
          },
        ]}
      />
    </div>
  )
}
