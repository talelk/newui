import { AppShell, PageBody, PageHeader } from '@newui/ui'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  return (
    <div class="h-72 overflow-hidden rounded-5 border border-outline-gray-1">
      <AppShell
        sidebar={
          <aside class="hidden w-36 border-e border-outline-gray-1 bg-surface-elevation-1 p-4 text-caption sm:block">
            Acme workspace
          </aside>
        }
      >
        <PageHeader>
          <h3 class="text-section">Overview</h3>
        </PageHeader>
        <PageBody>
          <p class="text-interface text-ink-gray-7">
            A structured frame with local content scrolling.
          </p>
        </PageBody>
      </AppShell>
    </div>
  )
}

const meta = {
  title: 'Components/Layout/AppShell',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
