import { Pagination } from '@newui/ui'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex flex-col gap-4">
      <Pagination.Root
        aria-label="Early pages"
        count={348}
        pageSize={20}
        defaultPage={2}
      >
        <Pagination.PrevTrigger />
        <Pagination.Pages />
        <Pagination.NextTrigger />
        <Pagination.Range class="ms-2" />
      </Pagination.Root>
      <Pagination.Root
        aria-label="Middle pages"
        count={348}
        pageSize={20}
        defaultPage={9}
        size="md"
      >
        <Pagination.PrevTrigger />
        <Pagination.Pages />
        <Pagination.NextTrigger />
      </Pagination.Root>
    </div>
  )
}

const meta = {
  title: 'Components/Navigation/Pagination',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Disabled: the pager keeps its layout and range, but no page is reachable. */
export const Disabled: Story = {
  render: () => (
    <div class="flex flex-col gap-4">
      <Pagination.Root
        aria-label="Early pages"
        count={348}
        pageSize={20}
        defaultPage={2}
        disabled
      >
        <Pagination.PrevTrigger />
        <Pagination.Pages />
        <Pagination.NextTrigger />
        <Pagination.Range class="ms-2" />
      </Pagination.Root>
      <Pagination.Root
        aria-label="Middle pages"
        count={348}
        pageSize={20}
        defaultPage={9}
        size="md"
        disabled
      >
        <Pagination.PrevTrigger />
        <Pagination.Pages />
        <Pagination.NextTrigger />
      </Pagination.Root>
    </div>
  ),
}
