import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { DatePicker } from './DatePicker'

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

describe('DatePicker accessibility', () => {
  it('has no axe violations for a labelled date picker', async () => {
    const { container } = render(() => (
      <DatePicker
        label="Date"
        description="Pick a day"
        value="2026-10-14"
        required
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a bare picker with an aria-label', async () => {
    const { container } = render(() => (
      <DatePicker aria-label="Date" placeholder="Pick a date" />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
