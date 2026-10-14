import { Avatar } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="flex flex-wrap items-center gap-3">
      <Avatar size="xs" label="Alex Rivera" />
      <Avatar size="md" label="Sam Lee" />
      <Avatar size="lg" theme="blue" label="Jordan Park" />
      <Avatar size="2xl" shape="square" theme="green" label="Frappe" />
    </div>
  )
}
