import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { TextInput } from './TextInput'

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

describe('TextInput accessibility', () => {
  it('has no axe violations for the labelled form', async () => {
    const { container } = render(() => (
      <TextInput
        label="Email"
        description="We never share it"
        error="Required"
        required
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a bare input with an aria-label', async () => {
    const { container } = render(() => (
      <TextInput aria-label="Search" placeholder="Search…" />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
