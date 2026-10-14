import { NumberInput } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="max-w-sm">
      <NumberInput label="Seats" defaultValue="4" min={1} max={20} />
    </div>
  )
}
