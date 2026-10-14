import { Password } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="max-w-sm">
      <Password
        label="Password"
        description="At least 8 characters"
        placeholder="••••••••"
      />
    </div>
  )
}
