import { Popover } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <Popover.Root>
      <Popover.Trigger class="rounded-4 border border-outline-gray-2 px-3 py-1.5 text-base">
        Filters
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Filters</Popover.Title>
        <Popover.Description>
          Anchored to the trigger, portalled to the body.
        </Popover.Description>
      </Popover.Content>
    </Popover.Root>
  )
}
