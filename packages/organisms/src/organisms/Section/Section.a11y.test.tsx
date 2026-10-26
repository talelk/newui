import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { Section } from './Section'

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

describe('Section accessibility', () => {
  it('has no axe violations for the full region anatomy', async () => {
    const { container } = render(() => (
      <Section
        id="expenses"
        title="Pending expenses"
        description="Waiting for approval"
        actions={<button type="button">Export</button>}
        toolbar={<div>Filters</div>}
        footer={<span>18 records</span>}
      >
        <ul>
          <li>Taxi to client</li>
          <li>Team lunch</li>
        </ul>
      </Section>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations when named by label alone', async () => {
    const { container } = render(() => (
      <Section label="Recent activity" headingLevel={3} surface="card">
        <p>Nothing today.</p>
      </Section>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
