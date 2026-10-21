import { ContextMenu, toast } from '@talelk/newui-molecules'
import { createSignal, onMount } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

function Example(props: {
  open?: boolean
  onOpenChange?: (value: boolean) => void
}) {
  return (
    <ContextMenu.Root
      open={props.open}
      onOpenChange={props.onOpenChange}
      onSelect={(value) => toast.info({ title: `Selected ${value}` })}
    >
      <ContextMenu.Trigger class="grid min-h-32 place-content-center rounded-5 border border-dashed border-outline-gray-3 p-6 text-interface text-ink-gray-7 focus-visible:focus-ring">
        Right-click, or press Shift+F10
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item value="copy">Copy</ContextMenu.Item>
        <ContextMenu.Item value="rename">Rename</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  return <Example />
}

const meta = {
  title: 'Molecules/Actions/ContextMenu',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** The menu open on first render; Escape still dismisses it. */
export const Open: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)

    onMount(() => {
      // A context menu is anchored at the pointer, not the trigger: a
      // controlled open with no gesture has no point, so the machine parks the
      // panel off-screen. Send the event a right-click would, which anchors it
      // without asking the parent to close.
      const triggers = document.querySelectorAll<HTMLElement>(
        '[data-slot="context-menu-trigger"]',
      )
      // Docs mode renders every story into one document; this story's trigger
      // is the last one mounted.
      const trigger = Array.from(triggers).at(-1)
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      trigger.dispatchEvent(
        new MouseEvent('contextmenu', {
          bubbles: true,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
        }),
      )
    })

    return <Example open={open()} onOpenChange={setOpen} />
  },
}
