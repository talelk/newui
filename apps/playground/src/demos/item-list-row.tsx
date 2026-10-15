import { Icon, ItemListRow } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="flex max-w-sm flex-col gap-1">
      <ItemListRow active prefix={<Icon icon="lucide-house" class="size-4" />}>
        Home
      </ItemListRow>
      <ItemListRow prefix={<Icon icon="lucide-search" class="size-4" />}>
        Search
      </ItemListRow>
      <ItemListRow
        disabled
        aria-disabled="true"
        prefix={<Icon icon="lucide-settings" class="size-4" />}
      >
        Settings
      </ItemListRow>
    </div>
  )
}
