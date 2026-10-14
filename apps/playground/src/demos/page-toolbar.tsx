import { PageToolbar } from '@newui/blocks'
import { Button } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="overflow-hidden rounded-6 border border-outline-gray-2">
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
    </div>
  )
}
