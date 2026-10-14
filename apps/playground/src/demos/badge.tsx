import { Badge, Icon } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="flex flex-wrap items-center gap-2">
      <Badge variant="solid" theme="gray" label="Default" />
      <Badge variant="subtle" theme="blue" label="Info" />
      <Badge variant="outline" theme="green" label="Active" />
      <Badge variant="ghost" theme="amber" label="Pending" />
      <Badge variant="solid" theme="red" label="Failed" />
      <Badge
        theme="green"
        label="Verified"
        prefix={<Icon icon="lucide-check" class="size-2.5" />}
      />
    </div>
  )
}
