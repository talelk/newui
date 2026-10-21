import { Button } from '@newui/atoms'
import { PageToolbar } from '@newui/organisms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DemoFrame } from './demo-frame'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <DemoFrame>
      <PageToolbar
        title="Tickets"
        menu={[{ label: 'Archive', icon: 'lucide-archive' }]}
        action={{ label: 'New ticket' }}
      >
        <Button
          variant="ghost"
          size="sm"
          icon="lucide-download"
          aria-label="Export"
        />
      </PageToolbar>
    </DemoFrame>
  )
}

const meta = {
  title: 'Organisms/PageToolbar',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
