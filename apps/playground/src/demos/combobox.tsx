import { Combobox } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="max-w-sm">
      <Combobox
        label="Assignee"
        placeholder="Search people…"
        options={[
          { label: 'Alex Rivera', value: 'alex', description: 'Owner' },
          { label: 'Sam Lee', value: 'sam', description: 'Designer' },
          { label: 'Jordan Park', value: 'jordan' },
        ]}
      />
    </div>
  )
}
