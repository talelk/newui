import { Select } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="max-w-sm">
      <Select
        label="Status"
        placeholder="Choose a status"
        options={[
          { label: 'Draft', value: 'draft', icon: 'lucide-pencil' },
          { label: 'Paid', value: 'paid', icon: 'lucide-check' },
          { label: 'Cancelled', value: 'cancelled', disabled: true },
        ]}
      />
    </div>
  )
}
