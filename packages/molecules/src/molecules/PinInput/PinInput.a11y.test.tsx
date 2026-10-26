import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { PinInput } from './PinInput'

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

describe('PinInput accessibility', () => {
  it('has no axe violations labelled, with an error, and bare', async () => {
    const labelled = render(() => (
      <PinInput
        length={4}
        label="Verification code"
        description="We sent it to your phone"
        error="Wrong code"
        required
      />
    ))
    expect(summarize(await axe.run(labelled.container, AXE_OPTIONS))).toEqual(
      [],
    )

    const bare = render(() => (
      <PinInput length={6} aria-label="One-time code" otp />
    ))
    expect(summarize(await axe.run(bare.container, AXE_OPTIONS))).toEqual([])
  })
})
