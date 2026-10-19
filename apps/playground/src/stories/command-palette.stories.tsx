import {
  CommandGroup,
  CommandItem,
  CommandPalette,
  KeyboardShortcut,
} from '@newui/ui'
import { createSignal, type JSX, onMount } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

function Example(props: {
  open?: boolean
  onOpenChange?: (value: boolean) => void
  empty?: JSX.Element
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = createSignal(false)
  const [chosen, setChosen] = createSignal('')

  const open = () => props.open ?? uncontrolledOpen()
  const setOpen = (value: boolean) => {
    if (props.open === undefined) setUncontrolledOpen(value)
    props.onOpenChange?.(value)
  }

  const choose = (value: string) => {
    setChosen(value)
    setOpen(false)
  }

  return (
    <div class="flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        class="flex w-full max-w-sm items-center justify-between gap-3 rounded-4 border border-outline-gray-2 bg-surface-base px-3 py-2 text-base text-ink-gray-7 hover:bg-surface-gray-2 focus-visible:focus-ring"
      >
        <span>Search commands…</span>
        <KeyboardShortcut combo="Mod+K" />
      </button>

      <p class="text-sm text-ink-gray-7">
        {chosen() ? `Ran ${chosen()}.` : 'Press ⌘K, then type.'}
      </p>

      <CommandPalette
        open={open()}
        onOpenChange={setOpen}
        label="Demo commands"
        empty={props.empty ?? 'Nothing matches that.'}
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

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return <Example />
}

const meta = {
  title: 'Components/Overlays/CommandPalette',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** The palette open on first render; Escape still dismisses it. */
export const Open: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)
    return <Example open={open()} onOpenChange={setOpen} />
  },
}

/**
 * The query matches nothing, so the palette shows its designed empty surface.
 * There is no `query` prop: the story drives the field the way a typist would,
 * on mount, so the state is the picture rather than a click away.
 */
export const Empty: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)

    onMount(() => {
      const palettes = document.querySelectorAll<HTMLElement>(
        '[data-slot="command-palette"]',
      )
      // Docs mode renders every story into one document; this story's portal is
      // the last one appended, so scope to it rather than the first palette.
      const field = Array.from(palettes)
        .at(-1)
        ?.querySelector<HTMLInputElement>('input')
      if (!field) return
      field.value = 'zzzz'
      field.dispatchEvent(new InputEvent('input', { bubbles: true }))
    })

    return (
      <Example
        open={open()}
        onOpenChange={setOpen}
        empty="Nothing matches that."
      />
    )
  },
}
