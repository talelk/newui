import {
  CommandGroup,
  CommandItem,
  CommandPalette,
  KeyboardShortcut,
} from '@newui/ui'
import { createSignal, type JSX } from 'solid-js'

/** Registered in `demos.tsx`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  const [open, setOpen] = createSignal(false)
  const [chosen, setChosen] = createSignal('')

  const choose = (value: string) => {
    setChosen(value)
    setOpen(false)
  }

  return (
    <div class="flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        class="flex w-full max-w-sm items-center justify-between gap-3 rounded-4 border border-outline-gray-2 bg-surface-base px-3 py-2 text-base text-ink-gray-6 hover:bg-surface-gray-2 focus-visible:focus-ring"
      >
        <span>Search commands…</span>
        <KeyboardShortcut combo="Mod+K" />
      </button>

      <p class="text-sm text-ink-gray-6">
        {chosen() ? `Ran ${chosen()}.` : 'Press ⌘K, then type.'}
      </p>

      <CommandPalette
        open={open()}
        onOpenChange={setOpen}
        label="Demo commands"
        empty="Nothing matches that."
      >
        <CommandGroup label="Pages">
          <CommandItem
            value="button"
            icon="lucide-square"
            keywords="solid outline ghost"
            onSelect={choose}
          >
            Button
          </CommandItem>
          <CommandItem
            value="dialog"
            icon="lucide-app-window"
            keywords="modal overlay"
            onSelect={choose}
          >
            Dialog
          </CommandItem>
          <CommandItem
            value="kanban"
            icon="lucide-columns-3"
            keywords="board columns drag deals"
            onSelect={choose}
          >
            KanbanBoard
          </CommandItem>
        </CommandGroup>
        <CommandGroup label="Actions">
          <CommandItem
            value="theme"
            icon="lucide-sun-moon"
            shortcut="⌘B"
            onSelect={choose}
          >
            Toggle colour scheme
          </CommandItem>
          <CommandItem
            value="shortcuts"
            icon="lucide-keyboard"
            shortcut="?"
            onSelect={choose}
          >
            Keyboard shortcuts
          </CommandItem>
          <CommandItem
            value="invite"
            icon="lucide-mail"
            disabled
            onSelect={choose}
          >
            Invite a teammate
          </CommandItem>
        </CommandGroup>
      </CommandPalette>
    </div>
  )
}
