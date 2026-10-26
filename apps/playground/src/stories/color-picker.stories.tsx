import { ColorPicker } from '@talelk/newui-molecules'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex max-w-md flex-col gap-6">
      <ColorPicker label="Brand color" defaultValue="#1a56db" />
      <ColorPicker label="Accent" defaultValue="#0b7285" />
      <ColorPicker label="Swatch only" editable={false} />
    </div>
  )
}

const meta = {
  title: 'Molecules/Inputs/ColorPicker',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** A disabled picker still reads as itself. */
export const Disabled: Story = {
  render: () => <ColorPicker label="Brand color" disabled />,
}

/** A field-level error shows with the contract's error styling. */
export const Invalid: Story = {
  render: () => (
    <ColorPicker label="Brand color" error="Pick a color inside the palette" />
  ),
}
