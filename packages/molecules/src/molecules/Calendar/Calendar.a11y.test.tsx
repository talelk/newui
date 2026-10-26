import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { Calendar } from './Calendar'

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

describe('Calendar accessibility', () => {
  it('has no axe violations single and dual pane', async () => {
    const single = render(() => (
      <Calendar aria-label="Booking date" defaultValue="2026-10-26" />
    ))
    expect(summarize(await axe.run(single.container, AXE_OPTIONS))).toEqual([])

    const dual = render(() => (
      <Calendar aria-label="Period" defaultValue="2026-10-26" dualPane />
    ))
    expect(summarize(await axe.run(dual.container, AXE_OPTIONS))).toEqual([])
  })
})
