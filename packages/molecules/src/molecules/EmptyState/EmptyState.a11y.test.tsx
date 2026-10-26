import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { EmptyState } from './EmptyState'

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

describe('EmptyState accessibility', () => {
  it('has no axe violations for a full empty state', async () => {
    const { container } = render(() => (
      <EmptyState
        icon="lucide-inbox"
        title="No invoices yet"
        description="Once a customer pays, the invoice lands here."
        bordered
        action={<button type="button">Create an invoice</button>}
        secondaryAction={<button type="button">Import a ledger</button>}
      />
    ))

    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a title-only empty state', async () => {
    const { container } = render(() => <EmptyState title="Nothing here" />)

    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
