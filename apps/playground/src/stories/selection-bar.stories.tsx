import { SelectionBar } from '@talelk/newui-organisms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DemoFrame } from './demo-frame'

export function Demo(): JSX.Element {
  return (
    <DemoFrame>
      <SelectionBar
        count={3}
        summary="$14,650"
        primary={{ label: 'Approve expenses', onClick: () => {} }}
        onClear={() => {}}
      />
    </DemoFrame>
  )
}

const meta = {
  title: 'Organisms/SelectionBar',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sticky: Story = {
  render: () => (
    <DemoFrame medium>
      <div class="h-full w-full bg-surface-base p-4">
        <SelectionBar
          count={2}
          placement="sticky"
          primary={{ label: 'Record payments', onClick: () => {} }}
          onClear={() => {}}
        />
        <p class="mt-4 text-caption text-ink-gray-7">
          Below 640px the bar fixes to the bottom edge; the frame clips the
          preview.
        </p>
      </div>
    </DemoFrame>
  ),
}
