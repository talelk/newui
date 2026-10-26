import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { DataState } from './DataState'

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

describe('DataState accessibility', () => {
  it('has no axe violations while loading', async () => {
    const { container } = render(() => (
      <DataState status="loading" skeleton="cards" />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for the empty state', async () => {
    const { container } = render(() => (
      <DataState
        status="empty"
        title="No expenses"
        description="Try a different month."
        action={<button type="button">Clear filters</button>}
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for the error state', async () => {
    const { container } = render(() => (
      <DataState status="error" error="The request failed" onRetry={() => {}} />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations when ready', async () => {
    const { container } = render(() => (
      <DataState status="ready">
        <ul>
          <li>Alpha</li>
          <li>Beta</li>
        </ul>
      </DataState>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
