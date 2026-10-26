import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { RadioGroup } from './RadioGroup'

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

const ITEMS = [
  { value: 'email', label: 'Email', description: 'A monthly digest' },
  { value: 'push', label: 'Push' },
  { value: 'none', label: 'None', disabled: true },
]

describe('RadioGroup accessibility', () => {
  it('has no axe violations for a labelled group with description and error', async () => {
    const { container } = render(() => (
      <RadioGroup
        items={ITEMS}
        label="Notifications"
        description="How should we reach you?"
        error="Choose a channel."
        required
        defaultValue="email"
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a bare group with an aria-label', async () => {
    const { container } = render(() => (
      <RadioGroup
        items={ITEMS}
        aria-label="Notifications"
        defaultValue="push"
        orientation="horizontal"
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
