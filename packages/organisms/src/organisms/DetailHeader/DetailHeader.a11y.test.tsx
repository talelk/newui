import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { DetailHeader } from './DetailHeader'

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

describe('DetailHeader accessibility', () => {
  it('has no axe violations for a record header', async () => {
    const { container } = render(() => (
      <DetailHeader
        breadcrumbs={[
          { label: 'Files', route: '/files' },
          { label: 'Reports', route: '/files/reports' },
          { label: 'Q3' },
        ]}
        title="Q3 report.pdf"
        subtitle="1.2 MB · updated 2h ago"
        status={{ label: 'Shared', theme: 'blue' }}
        actions={[
          { label: 'Share', onClick: () => {} },
          { label: 'Download', onClick: () => {} },
        ]}
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations with a lower heading level', async () => {
    const { container } = render(() => (
      <DetailHeader
        title="INV-1042"
        headingLevel={2}
        subtitle="Unpaid · due Oct 30"
        actions={[{ label: 'Edit', onClick: () => {} }]}
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
