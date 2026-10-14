import { Progress } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="flex max-w-sm flex-col gap-3">
      <Progress value={40} />
      <Progress value={72} />
      <Progress value={30} label="Uploading" hint />
      <Progress indeterminate />
    </div>
  )
}
