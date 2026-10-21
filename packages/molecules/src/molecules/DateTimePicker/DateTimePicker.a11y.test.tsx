import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { DateTimePicker } from './DateTimePicker'

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

describe('DateTimePicker accessibility', () => {
  it('has no axe violations for a labelled picker', async () => {
    const { container } = render(() => (
      <DateTimePicker
        label="When"
        description="Pick a moment"
        value="2026-10-14T09:30"
        required
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a bare picker with an aria-label', async () => {
    const { container } = render(() => (
      <DateTimePicker aria-label="When" placeholder="Pick a moment" />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
