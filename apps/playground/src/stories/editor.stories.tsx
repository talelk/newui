import { Editor, EditorToolbar, type EditorValue } from '@talelk/newui-editor'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  const [value, setValue] = createSignal<EditorValue>(
    '<p>Write a team update.</p>',
  )
  return (
    <Editor value={value()} onValueChange={setValue}>
      <EditorToolbar />
    </Editor>
  )
}

const meta = {
  title: 'Organisms/Editor',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** ReadOnly: the document and toolbar stay, but no edit reaches the value. */
export const ReadOnly: Story = {
  render: () => (
    <Editor value="<p>Write a team update.</p>" readonly>
      <EditorToolbar />
    </Editor>
  ),
}
