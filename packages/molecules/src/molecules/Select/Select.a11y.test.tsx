import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { Select } from './Select'

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

const OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Paid', value: 'paid' },
]

describe('Select accessibility', () => {
  it('has no axe violations for a labelled, pre-selected select', async () => {
    const { container } = render(() => (
      <Select
        options={OPTIONS}
        label="Status"
        description="Where the invoice stands"
        value="draft"
        required
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a bare select with an aria-label', async () => {
    const { container } = render(() => (
      <Select options={OPTIONS} aria-label="Status" placeholder="Choose…" />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
