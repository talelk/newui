import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { Stepper } from './Stepper'

const AXE_OPTIONS = {
  rules: {
    'color-contrast': { enabled: false },
    region: { enabled: false },
  },
}

function summarize(results: AxeResults) {
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }))
}

const STEPS = [
  { value: 'account', label: 'Account' },
  { value: 'payment', label: 'Payment' },
  { value: 'review', label: 'Review' },
]

describe('Stepper accessibility', () => {
  it('has no axe violations in linear and free modes', async () => {
    const linear = render(() => (
      <Stepper steps={STEPS} defaultValue="payment" label="Checkout progress" />
    ))
    expect(summarize(await axe.run(linear.container, AXE_OPTIONS))).toEqual([])

    const free = render(() => (
      <Stepper
        steps={STEPS}
        linear={false}
        defaultValue="account"
        label="Progress"
      />
    ))
    expect(summarize(await axe.run(free.container, AXE_OPTIONS))).toEqual([])
  })
})
