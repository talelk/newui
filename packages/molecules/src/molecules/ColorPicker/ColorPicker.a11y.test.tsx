import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { ColorPicker } from './ColorPicker'

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

describe('ColorPicker accessibility', () => {
  it('has no axe violations labelled, bare, swatch-only, and disabled', async () => {
    const labelled = render(() => (
      <ColorPicker
        label="Brand color"
        description="Used on the sign-in card"
        required
      />
    ))
    expect(summarize(await axe.run(labelled.container, AXE_OPTIONS))).toEqual(
      [],
    )

    const bare = render(() => <ColorPicker aria-label="Accent" />)
    expect(summarize(await axe.run(bare.container, AXE_OPTIONS))).toEqual([])

    const swatchOnly = render(() => (
      <ColorPicker aria-label="Accent" editable={false} />
    ))
    expect(summarize(await axe.run(swatchOnly.container, AXE_OPTIONS))).toEqual(
      [],
    )

    const disabled = render(() => <ColorPicker aria-label="Accent" disabled />)
    expect(summarize(await axe.run(disabled.container, AXE_OPTIONS))).toEqual(
      [],
    )
  })
})
