import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { SelectionBar } from './SelectionBar'

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

describe('SelectionBar accessibility', () => {
  it('has no axe violations with a primary action and clear', async () => {
    const { container } = render(() => (
      <SelectionBar
        count={3}
        summary="$14,650"
        primary={{ label: 'Approve expenses', onClick: () => {} }}
        onClear={() => {}}
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations with a secondary control and no summary', async () => {
    const { container } = render(() => (
      <SelectionBar
        count={12}
        primary={{
          label: 'Archive',
          onClick: () => {},
          disabled: true,
        }}
        secondary={<button type="button">Merge</button>}
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
