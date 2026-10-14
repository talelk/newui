import { ScrollArea } from '@newui/ui'
import { For, type JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <ScrollArea.Root class="h-32 w-64 rounded-4 border border-outline-gray-1">
      <ScrollArea.Viewport class="p-3">
        <For each={Array.from({ length: 12 })}>
          {(_, i) => <p class="text-base text-ink-gray-7">Row {i() + 1}</p>}
        </For>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar />
    </ScrollArea.Root>
  )
}
