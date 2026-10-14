import { Icon, TextInput } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="flex max-w-sm flex-col gap-3">
      <TextInput label="Full name" placeholder="Jane Doe" />
      <TextInput
        label="Search"
        placeholder="Search…"
        prefix={<Icon icon="lucide-search" class="size-4" />}
      />
      <TextInput label="Email" error="This email is invalid" value="nope" />
    </div>
  )
}
