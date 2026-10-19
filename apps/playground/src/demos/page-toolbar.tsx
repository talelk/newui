import { PageToolbar } from '@newui/blocks'
import { Button } from '@newui/ui'
import type { JSX } from 'solid-js'
import { DemoFrame } from './demo-frame'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <DemoFrame>
      <PageToolbar
        title="Tickets"
        menu={[{ label: 'Archive', icon: 'lucide-archive' }]}
        action={{ label: 'New ticket' }}
      >
        <Button
          variant="ghost"
          size="sm"
          icon="lucide-download"
          aria-label="Export"
        />
      </PageToolbar>
    </DemoFrame>
  )
}
