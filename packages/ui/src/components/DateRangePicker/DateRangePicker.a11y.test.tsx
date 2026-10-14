import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { DateRangePicker } from './DateRangePicker'

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

describe('DateRangePicker accessibility', () => {
  it('has no axe violations for a labelled range picker', async () => {
    const { container } = render(() => (
      <DateRangePicker
        label="Range"
        description="Pick a span"
        value={['2026-10-14', '2026-10-16']}
        required
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a bare picker with an aria-label', async () => {
    const { container } = render(() => (
      <DateRangePicker aria-label="Range" placeholder="Pick a range" />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
