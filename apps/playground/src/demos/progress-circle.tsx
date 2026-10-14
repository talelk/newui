import { ProgressCircle } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="flex flex-wrap items-center gap-8">
      <ProgressCircle value={72} size="sm" />
      <ProgressCircle value={72}>
        <span class="text-2xs">72%</span>
      </ProgressCircle>
      <ProgressCircle value={32} size="lg" aria-label="Storage used" />
      <ProgressCircle indeterminate size="lg" aria-label="Loading" />
      <ProgressCircle value={100} size="xl" />
    </div>
  )
}
