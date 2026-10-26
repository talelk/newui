import { Image } from '@talelk/newui-atoms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

const REMOTE =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&q=60'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="grid max-w-xl grid-cols-2 gap-4">
      <Image
        src={REMOTE}
        alt="A mountain ridge at dawn"
        ratio="16/9"
        class="rounded-4"
      />
      <Image
        src={REMOTE}
        alt="The same ridge in a square frame"
        ratio="1/1"
        fit="contain"
        class="rounded-4"
      />
    </div>
  )
}

const meta = {
  title: 'Atoms/Display/Image',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/**
 * A failed source swaps to the fallback inside the same box, so the layout
 * holds. (Deliberately absent from `Default`: a broken request logs a 404,
 * and the design contract allows no console noise. `no-sweep` is the states.md
 * escape hatch for a story that demonstrates a defect on purpose.)
 */
export const Fallback: Story = {
  tags: ['no-sweep'],
  render: () => (
    <Image
      src="/not-a-real-image.png"
      alt="A missing attachment"
      ratio="16/9"
      class="max-w-xs rounded-4"
      fallback={
        <span class="grid h-full w-full place-items-center text-2xs text-ink-gray-6">
          No preview
        </span>
      }
    />
  ),
}
