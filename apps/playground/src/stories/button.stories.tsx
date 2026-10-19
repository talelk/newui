import { Button } from '@newui/ui'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <Button variant="solid" theme="gray">
          Solid
        </Button>
        <Button variant="solid" theme="blue">
          Primary
        </Button>
        <Button variant="subtle">Subtle</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Button size="xs">xs</Button>
        <Button size="sm">sm</Button>
        <Button size="md">md</Button>
        <Button size="lg">lg</Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
        <Button icon="lucide-plus" aria-label="Add" />
      </div>
    </div>
  )
}

const meta = {
  title: 'Components/Actions/Button',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Disabled: the label survives, the affordance does not. */
export const Disabled: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-2">
      <Button disabled>Disabled</Button>
      <Button variant="outline" disabled>
        Outline
      </Button>
    </div>
  ),
}

/** Loading: the spinner takes the icon slot and the label stays. */
export const Loading: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-2">
      <Button loading>Loading</Button>
      <Button loading loadingText="Saving…">
        Save
      </Button>
    </div>
  ),
}
