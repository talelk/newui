import { Stepper } from '@newui/molecules'
import type { JSX } from 'solid-js'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

const STEPS = [
  { value: 'account', label: 'Account', description: 'Who is this for?' },
  { value: 'payment', label: 'Payment', description: 'Card or transfer' },
  { value: 'review', label: 'Review' },
]

export function Demo(): JSX.Element {
  const [step, setStep] = createSignal('payment')
  return (
    <div class="flex max-w-xl flex-col gap-6">
      <Stepper
        steps={STEPS}
        value={step()}
        onValueChange={setStep}
        label="Checkout progress"
      />
      <Stepper
        steps={STEPS}
        linear={false}
        defaultValue="review"
        label="Progress overview"
      />
      <Stepper
        steps={[
          ...STEPS.slice(0, 1),
          { ...STEPS[1], disabled: true },
          STEPS[2],
        ]}
        defaultValue="account"
        label="With a locked step"
      />
    </div>
  )
}

const meta = {
  title: 'Molecules/Navigation/Stepper',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
