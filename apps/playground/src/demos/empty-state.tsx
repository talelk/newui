import { Button, EmptyState } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="max-w-lg rounded-6 border border-outline-gray-2">
      <EmptyState
        icon="lucide-inbox"
        title="No invoices yet"
        description="Once a customer pays, the invoice lands here with its PDF and receipt."
        action={<Button variant="solid">Create an invoice</Button>}
        secondaryAction={<Button variant="ghost">Import from CSV</Button>}
      />
    </div>
  )
}
