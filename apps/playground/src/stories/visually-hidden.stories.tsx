import { TextInput, VisuallyHidden } from '@talelk/newui-atoms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index). The heading names the
 * group on screen; the hint rides along only for assistive tech.
 */
export function Demo(): JSX.Element {
  return (
    <fieldset class="flex max-w-sm flex-col gap-2">
      <legend>
        Workspace{' '}
        <VisuallyHidden>(name is visible to your teammates)</VisuallyHidden>
      </legend>
      <TextInput label="Name" value="Acme" />
    </fieldset>
  )
}

const meta = {
  title: 'Atoms/Display/VisuallyHidden',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
