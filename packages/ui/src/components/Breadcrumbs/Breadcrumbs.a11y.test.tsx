import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { Breadcrumbs } from './Breadcrumbs'

const AXE_OPTIONS = {
  rules: {
    'color-contrast': { enabled: false },
    region: { enabled: false },
  },
}

const ITEMS = [
  { label: 'Home', href: '/', icon: 'lucide-home' },
  { label: 'Sales', route: '/sales' },
  { label: 'Invoice' },
]

function summarize(results: AxeResults) {
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }))
}

describe('Breadcrumbs accessibility', () => {
  it('has no axe violations for a breadcrumb trail', async () => {
    const { container } = render(() => <Breadcrumbs items={ITEMS} />)
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations with a custom label and button crumbs', async () => {
    const { container } = render(() => (
      <Breadcrumbs
        items={[{ label: 'Home' }, { label: 'Sales' }, { label: 'Invoice' }]}
        aria-label="Trail"
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
