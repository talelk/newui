import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { TagInput } from './TagInput'

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

describe('TagInput accessibility', () => {
  it('has no axe violations for a labelled input holding tokens', async () => {
    const { container } = render(() => (
      <TagInput
        label="Labels"
        description="Press Enter to add a label."
        defaultValue={['design', 'urgent']}
        placeholder="Add label…"
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a bare, invalid input with an aria-label', async () => {
    const { container } = render(() => (
      <TagInput
        aria-label="Recipients"
        error="At least one recipient."
        required
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
