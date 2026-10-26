import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { TabButtons } from './TabButtons'

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
  { label: 'List', value: 'list', icon: 'lucide-list' },
  { label: 'Board', value: 'board' },
  { label: 'Calendar', value: 'calendar', disabled: true },
]

describe('TabButtons accessibility', () => {
  it('has no axe violations for a labelled radiogroup with a selection', async () => {
    const { container } = render(() => (
      <TabButtons label="View" options={OPTIONS} defaultValue="board" />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a vertical underline variant', async () => {
    const { container } = render(() => (
      <TabButtons label="View" options={OPTIONS} vertical variant="underline" />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
