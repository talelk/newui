import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { NumberInput } from './NumberInput'

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

describe('NumberInput accessibility', () => {
  it('has no axe violations for a labelled, required input with help and error', async () => {
    const { container } = render(() => (
      <NumberInput
        label="Seats"
        description="Seats in this workspace."
        error="Choose at least one seat."
        required
        defaultValue="0"
      />
    ))

    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a bare input with an aria-label', async () => {
    const { container } = render(() => (
      <NumberInput
        aria-label="Quantity"
        min={1}
        max={99}
        step={1}
        defaultValue="1"
      />
    ))

    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
