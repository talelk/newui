import { Collapsible } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="max-w-md rounded-5 border border-outline-gray-1">
      <Collapsible.Root>
        <Collapsible.Trigger>Advanced settings</Collapsible.Trigger>
        <Collapsible.Content>
          Rate limits, retry policy and the webhook secret live here.
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  )
}
