import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { TimePicker } from './TimePicker'

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

describe('TimePicker accessibility', () => {
  it('has no axe violations for a labelled time picker', async () => {
    const { container } = render(() => (
      <TimePicker
        label="Time"
        description="When it happens"
        value="09:30"
        required
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a bare picker with an aria-label', async () => {
    const { container } = render(() => (
      <TimePicker aria-label="Start time" placeholder="Select time" />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
