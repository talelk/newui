import { Tooltip } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <Tooltip text="Add a new item">
      <span class="rounded-4 bg-surface-gray-2 px-3 py-1.5 text-base">
        Hover me
      </span>
    </Tooltip>
  )
}
