import { DesktopShell, PageHeader } from '@newui/ui'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  return (
    <div class="h-72 overflow-hidden rounded-5 border border-outline-gray-1">
      <DesktopShell
        sidebar={
          <aside class="hidden w-36 border-e border-outline-gray-1 p-4 text-caption sm:block">
            Workspace navigation
          </aside>
        }
      >
        <PageHeader>
          <h3 class="text-section">Analytics</h3>
        </PageHeader>
        <div class="p-4 text-interface text-ink-gray-7">
          A scrolling desktop workspace.
        </div>
      </DesktopShell>
    </div>
  )
}

const meta = {
  title: 'Components/Layout/DesktopShell',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
