import { Stepper, type StepperStep } from '@newui/molecules'
import type { JSX } from 'solid-js'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

const STEPS: StepperStep[] = [
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
        steps={STEPS.map((step, index) =>
          index === 1 ? { ...step, disabled: true } : step,
        )}
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
