import { Tabs } from '@newui/ui'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <Tabs.Root defaultValue="one">
      <Tabs.List>
        <Tabs.Trigger value="one" icon="lucide-house" label="One" />
        <Tabs.Trigger value="two" label="Two" />
      </Tabs.List>
      <Tabs.Content value="one">First panel</Tabs.Content>
      <Tabs.Content value="two">Second panel</Tabs.Content>
    </Tabs.Root>
  )
}

const meta = {
  title: 'Components/Disclosure/Tabs',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Disabled: the second tab cannot be activated; the first still reads. */
export const Disabled: Story = {
  render: () => (
    <Tabs.Root defaultValue="one">
      <Tabs.List>
        <Tabs.Trigger value="one" icon="lucide-house" label="One" />
        <Tabs.Trigger value="two" label="Two" disabled />
      </Tabs.List>
      <Tabs.Content value="one">First panel</Tabs.Content>
      <Tabs.Content value="two">Second panel</Tabs.Content>
    </Tabs.Root>
  ),
}
