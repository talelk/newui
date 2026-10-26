import { Link } from '@talelk/newui-atoms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex max-w-md flex-col gap-2">
      <Link route="/kit">Read the composition guide</Link>
      <Link theme="gray">A quiet link inside chrome</Link>
      <Link href="https://frappe.io" showExternalIcon>
        External documentation
      </Link>
      <p class="text-p-base text-ink-gray-8">
        Inline in prose:{' '}
        <Link theme="gray" route="/architecture">
          atomic design, written down
        </Link>
        .
      </p>
    </div>
  )
}

const meta = {
  title: 'Atoms/Actions/Link',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
