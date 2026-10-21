import { ErrorMessage } from '@newui/atoms'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  return (
    <ErrorMessage
      message={[
        'The workspace name is already taken.',
        'Choose another name to continue.',
      ]}
    />
  )
}

const meta = {
  title: 'Atoms/Inputs/ErrorMessage',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
