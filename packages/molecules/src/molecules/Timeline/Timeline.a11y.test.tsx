import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { Timeline } from './Timeline'

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

const ITEMS = [
  { title: 'Opened', timestamp: '1d ago', icon: 'lucide-plus' },
  {
    title: 'Reviewed',
    description: 'Approved by the reviewer.',
    timestamp: '5h ago',
    tone: 'blue' as const,
  },
  {
    title: 'Deployed',
    description: 'Went live on production.',
    timestamp: '2h ago',
    tone: 'green' as const,
  },
]

describe('Timeline accessibility', () => {
  it('has no axe violations for a mixed-tone timeline', async () => {
    const { container } = render(() => <Timeline items={ITEMS} />)
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a single event without an icon', async () => {
    const { container } = render(() => (
      <Timeline items={[{ title: 'No icon', description: 'A plain dot.' }]} />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
