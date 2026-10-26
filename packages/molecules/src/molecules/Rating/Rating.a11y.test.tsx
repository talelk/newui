import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { Rating } from './Rating'

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

describe('Rating accessibility', () => {
  it('has no axe violations for a labelled rating with description and error', async () => {
    const { container } = render(() => (
      <Rating
        label="Satisfaction"
        description="How was your experience?"
        error="A rating is required."
        required
        defaultValue={3}
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a half-step rating with a value', async () => {
    const { container } = render(() => (
      <Rating defaultValue={2.5} step={0.5} max={4} />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
