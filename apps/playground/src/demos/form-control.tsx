import { FormControl } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="flex max-w-sm flex-col gap-4">
      <FormControl label="Title" description="Shown in the list" />
      <FormControl type="textarea" label="Description" />
      <FormControl
        type="select"
        label="Status"
        placeholder="Choose"
        options={[
          { label: 'Draft', value: 'draft' },
          { label: 'Paid', value: 'paid' },
        ]}
      />
      <FormControl type="checkbox" label="Notify the team" />
    </div>
  )
}
