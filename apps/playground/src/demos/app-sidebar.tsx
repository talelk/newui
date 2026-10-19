import { AppSidebar } from '@newui/blocks'
import type { JSX } from 'solid-js'
import { DemoFrame } from './demo-frame'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <DemoFrame medium>
      <AppSidebar
        title="Acme support"
        subtitle="18 members"
        showLogo={false}
        groups={[
          {
            items: [
              {
                label: 'Tickets',
                icon: 'lucide-ticket',
                count: 24,
                active: true,
              },
              { label: 'Customers', icon: 'lucide-building-2' },
            ],
          },
          {
            label: 'Knowledge',
            items: [
              { label: 'Articles', icon: 'lucide-book-open' },
              { label: 'Agents', icon: 'lucide-headset' },
            ],
          },
        ]}
      />
    </DemoFrame>
  )
}
