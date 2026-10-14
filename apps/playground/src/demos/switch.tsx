import { Switch } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="flex max-w-sm flex-col gap-3">
      <Switch label="Notifications" defaultChecked />
      <Switch
        label="Email digest"
        description="A weekly summary delivered every Friday."
        controlPosition="end"
      />
      <Switch label="Disabled" disabled />
    </div>
  )
}
