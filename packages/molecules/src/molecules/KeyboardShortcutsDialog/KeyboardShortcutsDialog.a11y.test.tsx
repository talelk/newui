import { render, screen } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import {
  type KeyboardShortcutEntry,
  KeyboardShortcutsDialog,
} from './KeyboardShortcutsDialog'

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

const SHORTCUTS: KeyboardShortcutEntry[] = [
  { group: 'General', label: 'Open command palette', combo: 'Mod+K' },
  {
    group: 'General',
    label: 'Show keyboard shortcuts',
    combo: 'Mod+Shift+Slash',
  },
  { group: 'Editing', label: 'Undo', combo: 'Mod+Z' },
  { group: 'Editing', label: 'Redo', combo: 'Mod+Shift+Z' },
]

describe('KeyboardShortcutsDialog accessibility', () => {
  it('has no axe violations when open with grouped shortcuts', async () => {
    render(() => <KeyboardShortcutsDialog open shortcuts={SHORTCUTS} />)

    expect(screen.getByText('Open command palette')).toBeTruthy()
    expect(summarize(await axe.run(document.body, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations with the search field shown', async () => {
    render(() => (
      <KeyboardShortcutsDialog open shortcuts={SHORTCUTS} searchThreshold={1} />
    ))

    expect(
      screen.getByRole('textbox', { name: 'Search shortcuts' }),
    ).toBeTruthy()
    expect(summarize(await axe.run(document.body, AXE_OPTIONS))).toEqual([])
  })
})
