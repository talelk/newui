import { Pagination } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="flex flex-col gap-4">
      <Pagination.Root
        aria-label="Early pages"
        count={348}
        pageSize={20}
        defaultPage={2}
      >
        <Pagination.PrevTrigger />
        <Pagination.Pages />
        <Pagination.NextTrigger />
        <Pagination.Range class="ms-2" />
      </Pagination.Root>
      <Pagination.Root
        aria-label="Middle pages"
        count={348}
        pageSize={20}
        defaultPage={9}
        size="md"
      >
        <Pagination.PrevTrigger />
        <Pagination.Pages />
        <Pagination.NextTrigger />
      </Pagination.Root>
    </div>
  )
}
