import { PinInput } from '@talelk/newui-molecules'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <div class="flex max-w-md flex-col gap-6">
      <PinInput length={6} label="Verification code" otp />
      <PinInput length={4} label="Recovery key" type="alphanumeric" />
      <PinInput length={4} label="PIN" mask />
    </div>
  )
}

const meta = {
  title: 'Molecules/Inputs/PinInput',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** A disabled code field still reads as itself. */
export const Disabled: Story = {
  render: () => <PinInput length={6} label="Verification code" otp disabled />,
}

/** A wrong code shows in the cell borders and the field error. */
export const Invalid: Story = {
  render: () => (
    <PinInput
      length={6}
      label="Verification code"
      error="That code has expired"
    />
  ),
}
