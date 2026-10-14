import { Checkbox } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="flex flex-col gap-3">
      <Checkbox label="Email me" defaultChecked />
      <Checkbox label="Subscribe" />
      <Checkbox label="Indeterminate" indeterminate />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Padded row" padded />
    </div>
  )
}
