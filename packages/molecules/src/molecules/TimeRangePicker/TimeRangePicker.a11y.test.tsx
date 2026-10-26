import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { TimeRangePicker } from './TimeRangePicker'

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

describe('TimeRangePicker accessibility', () => {
  it('has no axe violations labelled, bare, and disabled', async () => {
    const labelled = render(() => (
      <TimeRangePicker
        label="Shift"
        description="When the shift starts and ends"
        required
      />
    ))
    expect(summarize(await axe.run(labelled.container, AXE_OPTIONS))).toEqual(
      [],
    )

    const bare = render(() => <TimeRangePicker aria-label="Shift times" />)
    expect(summarize(await axe.run(bare.container, AXE_OPTIONS))).toEqual([])

    const disabled = render(() => <TimeRangePicker label="Shift" disabled />)
    expect(summarize(await axe.run(disabled.container, AXE_OPTIONS))).toEqual(
      [],
    )
  })
})
