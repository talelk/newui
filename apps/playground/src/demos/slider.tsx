import { Slider } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="flex max-w-sm flex-col gap-4">
      <Slider defaultValue={[35]} aria-label="Amount" />
      <Slider size="md" defaultValue={[60]} aria-label="Large amount" />
    </div>
  )
}
