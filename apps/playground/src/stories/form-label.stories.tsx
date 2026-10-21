import { FormLabel, TextInput } from '@talelk/newui-atoms'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  return (
    <div class="max-w-sm space-y-1.5">
      <FormLabel id="demo-workspace-name" label="Workspace name" required />
      <TextInput id="demo-workspace-name" placeholder="Acme" required />
    </div>
  )
}

const meta = {
  title: 'Atoms/Inputs/FormLabel',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Disabled: the label dims with the control it names. */
export const Disabled: Story = {
  render: () => (
    <div class="max-w-sm space-y-1.5">
      <FormLabel
        id="demo-workspace-name-disabled"
        label="Workspace name"
        required
        disabled
      />
      <TextInput
        id="demo-workspace-name-disabled"
        placeholder="Acme"
        required
        disabled
      />
    </div>
  ),
}
