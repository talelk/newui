import { KeyboardShortcut } from '@talelk/newui-atoms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex flex-wrap items-center gap-4">
      <KeyboardShortcut combo="Mod+K" />
      <KeyboardShortcut combo="Mod+Shift+P" />
      <KeyboardShortcut combo="Ctrl+Alt+Delete" />
    </div>
  )
}

const meta = {
  title: 'Atoms/Actions/KeyboardShortcut',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
