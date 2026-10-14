import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { FormControl } from './FormControl'

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

describe('FormControl accessibility', () => {
  it('has no axe violations for a labelled text field', async () => {
    const { container } = render(() => (
      <FormControl
        label="Email"
        description="We never share it"
        error="Required"
        required
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a labelled select', async () => {
    const { container } = render(() => (
      <FormControl
        type="select"
        label="Status"
        options={[{ label: 'Draft', value: 'draft' }]}
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a labelled checkbox', async () => {
    const { container } = render(() => (
      <FormControl type="checkbox" label="Agree" />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
