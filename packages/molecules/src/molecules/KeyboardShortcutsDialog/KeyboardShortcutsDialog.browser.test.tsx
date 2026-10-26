import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog'

const SHORTCUTS = [
  { group: 'General', label: 'Open command palette', combo: 'Mod+K' },
  {
    group: 'General',
    label: 'Show keyboard shortcuts',
    combo: 'Mod+Shift+Slash',
  },
  { group: 'Editing', label: 'Undo', combo: 'Mod+Z' },
]

describe('KeyboardShortcutsDialog (browser, real CSS)', () => {
  it('paints an opaque panel wide enough for its columns', () => {
    render(() => <KeyboardShortcutsDialog open shortcuts={SHORTCUTS} />)

    const content = document.querySelector(
      '[data-slot="dialog-content"]',
    ) as HTMLElement
    expect(content).not.toBeNull()
    expect(getComputedStyle(content).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )
    expect(content.getBoundingClientRect().width).toBeGreaterThan(0)
  })

  it('makes the group list a capped, scrollable region', () => {
    render(() => <KeyboardShortcutsDialog open shortcuts={SHORTCUTS} />)

    const groups = document.querySelector(
      '[data-slot="shortcut-groups"]',
    ) as HTMLElement
    const style = getComputedStyle(groups)
    // `max-h-[70vh]` must resolve against the real viewport, and the region
    // must actually scroll — a long list that silently overflows the dialog
    // fails here, not on a reader's screen.
    expect(Number.parseFloat(style.maxHeight)).toBeGreaterThan(
      window.innerHeight * 0.5,
    )
    expect(style.overflowY).toBe('auto')
  })

  it('draws each combo as a filled key chip', () => {
    render(() => <KeyboardShortcutsDialog open shortcuts={SHORTCUTS} />)

    const key = document.querySelector('[data-slot="key"]') as HTMLElement
    expect(key.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(getComputedStyle(key).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})
