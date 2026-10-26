import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { Alert } from './Alert'

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

describe('Alert accessibility', () => {
  it('has no axe violations as a dismissible danger banner with actions', async () => {
    const { container } = render(() => (
      <Alert
        theme="red"
        title="Delete this invoice?"
        description="The action cannot be undone."
        dismissible
        primaryAction={{ label: 'Delete', variant: 'solid', theme: 'red' }}
        secondaryAction={{ label: 'Cancel' }}
      />
    ))

    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations as a row alert with a single action', async () => {
    const { container } = render(() => (
      <Alert
        theme="amber"
        title="Unsaved changes"
        action={{ label: 'Retry' }}
        dismissible
      />
    ))

    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
