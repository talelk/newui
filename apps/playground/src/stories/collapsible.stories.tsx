import { Collapsible } from '@talelk/newui-molecules'
import { createSignal, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="max-w-md rounded-5 border border-outline-gray-1">
      <Collapsible.Root>
        <Collapsible.Trigger>Advanced settings</Collapsible.Trigger>
        <Collapsible.Content>
          Rate limits, retry policy and the webhook secret live here.
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  )
}

const meta = {
  title: 'Molecules/Disclosure/Collapsible',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Open: the panel is visible before any interaction. */
export const Open: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true)
    return (
      <div class="max-w-md rounded-5 border border-outline-gray-1">
        <Collapsible.Root open={open()} onOpenChange={setOpen}>
          <Collapsible.Trigger>Advanced settings</Collapsible.Trigger>
          <Collapsible.Content>
            Rate limits, retry policy and the webhook secret live here.
          </Collapsible.Content>
        </Collapsible.Root>
      </div>
    )
  },
}

/** Disabled: the trigger reads as inert and does not open the panel. */
export const Disabled: Story = {
  render: () => (
    <div class="max-w-md rounded-5 border border-outline-gray-1">
      <Collapsible.Root disabled>
        <Collapsible.Trigger>Advanced settings</Collapsible.Trigger>
        <Collapsible.Content>
          Rate limits, retry policy and the webhook secret live here.
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  ),
}
