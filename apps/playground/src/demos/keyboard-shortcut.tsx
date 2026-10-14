import { KeyboardShortcut } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="flex flex-wrap items-center gap-4">
      <KeyboardShortcut combo="Mod+K" />
      <KeyboardShortcut combo="Mod+Shift+P" />
      <KeyboardShortcut combo="Ctrl+Alt+Delete" />
    </div>
  )
}
