import { TagInput } from '@talelk/newui-molecules'
import type { JSX } from 'solid-js'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

export function Demo(): JSX.Element {
  const [tags, setTags] = createSignal<string[]>(['invoice', 'q4'])
  return (
    <div class="flex max-w-md flex-col gap-4">
      <TagInput
        label="Labels"
        description="Enter or comma adds a tag."
        placeholder="Add a label…"
        value={tags()}
        onValueChange={setTags}
      />
      <TagInput label="Disabled" defaultValue={['locked']} disabled />
      <TagInput label="Invalid" error="At least one tag" />
    </div>
  )
}

const meta = {
  title: 'Molecules/Fields/TagInput',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** A disabled editor commits and removes nothing. */
export const Disabled: Story = {
  render: () => (
    <div class="max-w-md">
      <TagInput label="Labels" defaultValue={['locked']} disabled />
    </div>
  ),
}

/** The error contract: the field reads invalid with its message linked. */
export const Invalid: Story = {
  render: () => (
    <div class="max-w-md">
      <TagInput label="Labels" error="At least one tag" />
    </div>
  ),
}
