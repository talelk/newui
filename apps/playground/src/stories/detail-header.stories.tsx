import { DetailHeader } from '@newui/blocks'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <DetailHeader
      breadcrumbs={[
        { label: 'Files', route: '/files' },
        { label: 'Q3 report.pdf' },
      ]}
      title="Q3 report.pdf"
      subtitle="1.2 MB · updated 2h ago by Priya Nair"
      status={{ label: 'Shared', theme: 'blue' }}
      actions={[{ label: 'Share' }, { label: 'Download' }]}
    />
  )
}

const meta = {
  title: 'Blocks/DetailHeader',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
