import { Breadcrumbs } from '@talelk/newui-molecules'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <Breadcrumbs
      items={[
        { label: 'Home', route: '/' },
        { label: 'Projects', route: '/projects' },
        { label: 'Website' },
      ]}
    />
  )
}

const meta = {
  title: 'Molecules/Navigation/Breadcrumbs',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
