import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { CommandGroup, CommandItem, CommandPalette } from './CommandPalette'

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

describe('CommandPalette accessibility', () => {
  it('has no axe violations for an open palette of grouped commands', async () => {
    // The dialog portals to the body, so the audit runs there — the same
    // shape the SettingsDialog a11y test uses.
    render(() => (
      <CommandPalette defaultOpen label="Commands">
        <CommandGroup label="Pages">
          <CommandItem value="intro" icon="lucide-house">
            Introduction
          </CommandItem>
          <CommandItem value="blocks" keywords="patterns sections">
            Blocks
          </CommandItem>
        </CommandGroup>
        <CommandGroup label="Actions">
          <CommandItem value="theme" shortcut="⌘B">
            Toggle theme
          </CommandItem>
          <CommandItem value="soon" disabled>
            Coming soon
          </CommandItem>
        </CommandGroup>
      </CommandPalette>
    ))
    expect(summarize(await axe.run(document.body, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations while commands are loading', async () => {
    render(() => (
      <CommandPalette defaultOpen label="Commands" loading>
        <CommandGroup label="Pages">
          <CommandItem value="intro">Introduction</CommandItem>
        </CommandGroup>
      </CommandPalette>
    ))
    expect(summarize(await axe.run(document.body, AXE_OPTIONS))).toEqual([])
  })
})
