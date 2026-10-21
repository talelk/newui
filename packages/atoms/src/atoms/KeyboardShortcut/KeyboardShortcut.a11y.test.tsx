import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { KeyboardShortcut } from './KeyboardShortcut'

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

describe('KeyboardShortcut accessibility', () => {
  it('has no axe violations for a plain combo', async () => {
    const { container } = render(() => <KeyboardShortcut combo="Mod+Shift+K" />)
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a chip combo with alternatives', async () => {
    const { container } = render(() => (
      <KeyboardShortcut combo="Mod+Backspace" altCombos={['Delete']} bg />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for the fallback content', async () => {
    const { container } = render(() => (
      <KeyboardShortcut>Press a key</KeyboardShortcut>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
