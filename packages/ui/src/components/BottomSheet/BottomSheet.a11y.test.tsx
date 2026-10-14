import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { BottomSheet } from './BottomSheet'

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

describe('BottomSheet accessibility', () => {
  it('has no axe violations for a titled sheet', async () => {
    const { baseElement } = render(() => (
      <BottomSheet open title="Filters">
        Body
      </BottomSheet>
    ))
    expect(summarize(await axe.run(baseElement, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for an untitled sheet', async () => {
    const { baseElement } = render(() => <BottomSheet open>Body</BottomSheet>)
    expect(summarize(await axe.run(baseElement, AXE_OPTIONS))).toEqual([])
  })
})
