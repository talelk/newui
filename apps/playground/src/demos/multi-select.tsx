import { MultiSelect } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="max-w-sm">
      <MultiSelect
        label="Labels"
        placeholder="Add labels…"
        options={[
          { label: 'Bug', value: 'bug' },
          { label: 'Feature', value: 'feature' },
          { label: 'Docs', value: 'docs' },
        ]}
      />
    </div>
  )
}
