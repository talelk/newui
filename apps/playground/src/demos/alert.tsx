import { Alert } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="flex max-w-md flex-col gap-2">
      <Alert theme="green" title="Saved" description="All changes stored." />
      <Alert
        theme="amber"
        title="Unsaved"
        description="Your edits are not stored."
      />
      <Alert theme="red" title="Could not connect" dismissible />
    </div>
  )
}
