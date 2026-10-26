import { KeyValue } from '@talelk/newui-atoms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex max-w-md flex-col gap-2">
      <KeyValue label="Email digests">Weekly</KeyValue>
      <KeyValue label="Plan">Team</KeyValue>
      <KeyValue label="Seats" value="14 of 20" />
    </div>
  )
}

const meta = {
  title: 'Atoms/Display/KeyValue',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Vertical: the pair stacks where the value is long or a form follows. */
export const Vertical: Story = {
  render: () => (
    <div class="flex max-w-md flex-col gap-2">
      <KeyValue label="Billing address" orientation="vertical">
        4821 Harbor Lane, Rotterdam
      </KeyValue>
      <KeyValue
        label="Payment method"
        orientation="vertical"
        value="Visa ···· 4417"
      />
    </div>
  ),
}
