import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { Password } from './Password'

// jsdom has no layout, so geometry-dependent rules are disabled; the structural
// rules (labels, ARIA linkage, roles) are the point of this test.
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

describe('Password accessibility', () => {
  it('has no axe violations for the labelled field', async () => {
    const { container } = render(() => (
      <Password
        label="Password"
        description="At least 8 characters"
        error="Too short"
        required
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a bare field with an aria-label', async () => {
    const { container } = render(() => (
      <Password aria-label="Password" placeholder="••••••••" />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
