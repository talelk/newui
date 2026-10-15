import { LoadingText, Spinner } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="flex items-center gap-4">
      <LoadingText>Loading records…</LoadingText>
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" track />
      <Spinner theme="blue" />
      <Spinner theme="red" />
    </div>
  )
}
