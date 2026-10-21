import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { Pagination } from './Pagination'

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

describe('Pagination accessibility', () => {
  it('has no axe violations for a named pager', async () => {
    const { container } = render(() => (
      <Pagination.Root count={348} pageSize={20} aria-label="Invoices pages">
        <Pagination.PrevTrigger />
        <Pagination.Pages />
        <Pagination.NextTrigger />
        <Pagination.Range />
      </Pagination.Root>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
