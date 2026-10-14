import { Divider } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="flex max-w-md flex-col gap-4">
      <Divider />
      <Divider label="or" />
      <Divider label="Section" action={{ label: 'Clear', onClick: () => {} }} />
    </div>
  )
}
