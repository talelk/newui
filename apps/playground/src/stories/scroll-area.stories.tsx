import { ScrollArea } from '@newui/atoms'
import { For, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
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

const meta = {
  title: 'Atoms/Overlays/ScrollArea',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
