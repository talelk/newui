import { Rating } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="flex flex-col gap-3">
      <Rating defaultValue={3} />
      <Rating defaultValue={3.5} step={0.5} />
      <Rating defaultValue={3} max={10} />
    </div>
  )
}
