import { HoverCard } from '@newui/molecules'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

function Example(props: {
  open?: boolean
  onOpenChange?: (value: boolean) => void
}) {
  return (
    <HoverCard.Root open={props.open} onOpenChange={props.onOpenChange}>
      <HoverCard.Trigger class="rounded-3 text-ink-blue-link underline decoration-dotted focus-visible:focus-ring">
        @rhea
      </HoverCard.Trigger>
      <HoverCard.Content>
        <p class="font-medium">Rhea Kapoor</p>
        <p class="mt-2 text-caption text-ink-gray-7">
          Product designer · Acme workspace
        </p>
      </HoverCard.Content>
    </HoverCard.Root>
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
  title: 'Molecules/Overlays/HoverCard',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** The card rendered open, anchored to its trigger. */
export const Open: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)
    return <Example open={open()} onOpenChange={setOpen} />
  },
}
