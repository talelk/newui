import { TransferList } from '@talelk/newui-molecules'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

const MEMBERS = [
  { value: 'rhea', label: 'Rhea Kapoor' },
  { value: 'marco', label: 'Marco Diaz' },
  { value: 'ada', label: 'Ada Lovelace' },
  { value: 'linus', label: 'Linus Ahlberg' },
  { value: 'sofia', label: 'Sofia Marino' },
]

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <TransferList
      options={MEMBERS}
      defaultValue={['ada']}
      availableLabel="Candidates"
      pickedLabel="Assignees"
      search
      class="max-w-2xl"
    />
  )
}

const meta = {
  title: 'Molecules/Selection/TransferList',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
