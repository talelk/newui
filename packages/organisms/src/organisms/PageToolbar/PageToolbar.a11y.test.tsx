import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { PageToolbar } from './PageToolbar'

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

describe('PageToolbar accessibility', () => {
  it('has no axe violations with a menu and a primary action', async () => {
    const { container } = render(() => (
      <PageToolbar
        title="Q4 invoices"
        menu={[
          { label: 'Rename', onClick: () => {} },
          { label: 'Archive', onClick: () => {} },
        ]}
        action={{ label: 'New invoice', onClick: () => {} }}
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
