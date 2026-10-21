import { Accordion } from '@newui/molecules'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="max-w-md">
      <Accordion.Root defaultValue={['tokens']}>
        <Accordion.Item value="tokens">
          <Accordion.Trigger icon="lucide-palette">Tokens</Accordion.Trigger>
          <Accordion.Content>
            Semantic colour, type, radius and elevation. The whole system
            retunes by overriding three custom-property families.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="components">
          <Accordion.Trigger icon="lucide-box">Components</Accordion.Trigger>
          <Accordion.Content>
            Atoms over Zag primitives — keyboard, focus and ARIA come from the
            machine, never from hand-written handlers.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="legacy" disabled>
          <Accordion.Trigger icon="lucide-archive">Legacy</Accordion.Trigger>
          <Accordion.Content>Not available.</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  )
}

const meta = {
  title: 'Molecules/Disclosure/Accordion',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Disabled: the item keeps its label but cannot be opened. */
export const Disabled: Story = {
  render: () => (
    <div class="max-w-md">
      <Accordion.Root>
        <Accordion.Item value="legacy" disabled>
          <Accordion.Trigger icon="lucide-archive">Legacy</Accordion.Trigger>
          <Accordion.Content>Not available.</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  ),
}
