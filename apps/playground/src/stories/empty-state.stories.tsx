import { Button } from '@newui/atoms'
import { EmptyState } from '@newui/molecules'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="max-w-lg rounded-6 border border-outline-gray-2">
      <EmptyState
        icon="lucide-inbox"
        title="No invoices yet"
        description="Once a customer pays, the invoice lands here with its PDF and receipt."
        action={<Button variant="solid">Create an invoice</Button>}
        secondaryAction={<Button variant="ghost">Import from CSV</Button>}
      />
    </div>
  )
}

const meta = {
  title: 'Molecules/Display/EmptyState',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
