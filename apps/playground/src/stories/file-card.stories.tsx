import { Icon } from '@talelk/newui-atoms'
import { FileCard } from '@talelk/newui-molecules'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/** App-owned trailing controls: the card composes them, it does not own them. */
function actions(name: string): JSX.Element {
  return (
    <>
      <button
        type="button"
        aria-label={`Star ${name}`}
        class="grid size-7 place-items-center rounded-3 text-ink-gray-6 hover:bg-surface-gray-3 focus-visible:focus-ring"
      >
        <Icon icon="lucide-star" class="size-4" />
      </button>
      <button
        type="button"
        aria-label={`More actions for ${name}`}
        class="grid size-7 place-items-center rounded-3 text-ink-gray-6 hover:bg-surface-gray-3 focus-visible:focus-ring"
      >
        <Icon icon="lucide-ellipsis-vertical" class="size-4" />
      </button>
    </>
  )
}

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index). The open action and the
 * per-file actions stay siblings: interactive content never nests.
 */
export function Demo(): JSX.Element {
  return (
    <div class="grid max-w-md gap-2">
      <FileCard
        name="Q4 report.pdf"
        meta="Ana Costa · 2.4 MB · 3h ago"
        icon="lucide-file-chart-column"
        suffix={actions('Q4 report.pdf')}
      />
      <FileCard
        name="Brand assets"
        meta="12 files · Shared"
        icon="lucide-folder"
        badge={<span class="text-caption text-ink-gray-6">Shared</span>}
        suffix={actions('Brand assets')}
      />
      <FileCard
        as="button"
        name="Contracts"
        meta="4 files · Private"
        icon="lucide-folder-lock"
      />
    </div>
  )
}

const meta = {
  title: 'Molecules/Display/FileCard',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Selected: the open file carries the blue selection frame. */
export const Selected: Story = {
  render: () => (
    <div class="grid max-w-md gap-2">
      <FileCard
        name="Q4 report.pdf"
        meta="Ana Costa · 2.4 MB · 3h ago"
        selected
        suffix={actions('Q4 report.pdf')}
      />
      <FileCard
        name="Brand assets"
        meta="12 files · Shared"
        icon="lucide-folder"
        suffix={actions('Brand assets')}
      />
    </div>
  ),
}

/** Disabled: an archived file is visible but not actionable. */
export const Disabled: Story = {
  render: () => (
    <div class="grid max-w-md gap-2">
      <FileCard
        name="Old contract.docx"
        meta="Archived · read-only"
        icon="lucide-file-lock"
        disabled
      />
      <FileCard
        name="Current contract.docx"
        meta="Legal · editable"
        suffix={actions('Current contract.docx')}
      />
    </div>
  ),
}
