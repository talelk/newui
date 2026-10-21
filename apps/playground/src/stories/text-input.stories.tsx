import { Icon, TextInput } from '@talelk/newui-atoms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex max-w-sm flex-col gap-3">
      <TextInput label="Full name" placeholder="Jane Doe" />
      <TextInput
        label="Search"
        placeholder="Search…"
        prefix={<Icon icon="lucide-search" class="size-4" />}
      />
      <TextInput label="Email" error="This email is invalid" value="nope" />
    </div>
  )
}

const meta = {
  title: 'Atoms/Inputs/TextInput',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Disabled: the field keeps its shape but cannot be operated. */
export const Disabled: Story = {
  render: () => (
    <div class="max-w-sm">
      <TextInput label="Full name" placeholder="Jane Doe" disabled />
    </div>
  ),
}

/** Invalid: the error message and styling are visible on the field. */
export const Invalid: Story = {
  render: () => (
    <div class="max-w-sm">
      <TextInput label="Email" value="nope" error="This email is invalid" />
    </div>
  ),
}
