import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { MultiSelect } from './MultiSelect'

const AXE_OPTIONS = {
  rules: {
    'color-contrast': { enabled: false },
    region: { enabled: false },
  },
}

const OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Paid', value: 'paid' },
]

function summarize(results: AxeResults) {
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }))
}

describe('MultiSelect accessibility', () => {
  it('has no axe violations for a labelled, pre-selected multi-select', async () => {
    const { container } = render(() => (
      <MultiSelect
        options={OPTIONS}
        label="Status"
        description="Pick any"
        value={['draft']}
        required
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a bare multi-select with an aria-label', async () => {
    const { container } = render(() => (
      <MultiSelect options={OPTIONS} aria-label="Status" />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
