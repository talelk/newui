import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { type Stat, StatGrid } from './StatGrid'

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

const STATS: Stat[] = [
  {
    label: 'Revenue',
    value: '$4.2m',
    delta: { value: '+5.1%', direction: 'up', good: true },
  },
  {
    label: 'Open deals',
    value: '38',
    hint: 'vs 42 last quarter',
    delta: { value: '-0.4 pts', direction: 'down', good: false },
  },
]

describe('StatGrid accessibility', () => {
  it('has no axe violations for a KPI row', async () => {
    const { container } = render(() => <StatGrid stats={STATS} columns={2} />)
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
