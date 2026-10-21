import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { KeyboardShortcut, parseCombo, spellOut } from './KeyboardShortcut'

function keysOf(container: HTMLElement): (string | null)[] {
  return Array.from(container.querySelectorAll('[data-slot="key"]')).map(
    (el) => el.textContent?.trim() ?? null,
  )
}

describe('parseCombo', () => {
  it('reads every modifier the grammar defines', () => {
    expect(
      parseCombo('Mod+Ctrl+Meta+Shift+Alt+K', true).map((part) => part.type),
    ).toEqual(['mod', 'ctrl', 'meta', 'shift', 'alt', 'key'])
  })

  it('resolves Mod to ⌘ on macOS and Ctrl elsewhere', () => {
    expect(parseCombo('Mod+I', true).map((part) => part.display)).toEqual([
      '⌘',
      'I',
    ])
    expect(parseCombo('Mod+I', false).map((part) => part.display)).toEqual([
      'Ctrl',
      'I',
    ])
  })

  it('collapses Mod and Ctrl into one chip off macOS', () => {
    expect(parseCombo('Mod+Ctrl+K', false).map((part) => part.display)).toEqual(
      ['Ctrl', 'K'],
    )
  })

  it('reads the key names the grammar defines', () => {
    const display = (combo: string) =>
      parseCombo(combo, false).map((part) => part.display)
    expect(display('Digit1')).toEqual(['1'])
    expect(display('Slash')).toEqual(['/'])
    expect(display('Backtick')).toEqual(['`'])
    expect(display('BracketLeft')).toEqual(['['])
    expect(display('Escape')).toEqual(['Esc'])
    expect(display('F5')).toEqual(['F5'])
    expect(display('k')).toEqual(['K'])
  })

  it('returns nothing for a missing combo', () => {
    expect(parseCombo(undefined, false)).toEqual([])
    expect(parseCombo('', false)).toEqual([])
  })

  it('renders an unknown token as written', () => {
    expect(parseCombo('cmd+K', false).map((part) => part.display)).toEqual([
      'cmd',
      'K',
    ])
  })

  it('spells a combo for an aria-label, punctuation included', () => {
    expect(spellOut(parseCombo('Mod+Shift+ArrowUp', true))).toBe(
      'Command + Shift + Up Arrow',
    )
    expect(spellOut(parseCombo('Mod+BracketLeft', false))).toBe(
      'Control + Bracket Left',
    )
  })
})

describe('<KeyboardShortcut />', () => {
  it('draws each part of the combo as a <kbd>', () => {
    const { container } = render(() => <KeyboardShortcut combo="Mod+K" />)
    expect(keysOf(container)).toEqual(['Ctrl', 'K'])
    expect(container.querySelectorAll('[data-slot="separator"]').length).toBe(1)
  })

  it('draws no separator in the chip variant', () => {
    const { container } = render(() => <KeyboardShortcut combo="Mod+K" bg />)
    expect(keysOf(container)).toEqual(['Ctrl', 'K'])
    expect(container.querySelectorAll('[data-slot="separator"]').length).toBe(0)
    expect(container.querySelector('[data-slot="key"]')?.className).toContain(
      'bg-surface-gray-2',
    )
  })

  it('marks the chip variant with data-bg', () => {
    const { container } = render(() => <KeyboardShortcut combo="Mod+K" bg />)
    expect(
      container
        .querySelector('[data-slot="keyboard-shortcut"]')
        ?.getAttribute('data-bg'),
    ).toBe('true')
  })

  it('labels the whole sequence as a role="img"', () => {
    const { container } = render(() => (
      <KeyboardShortcut combo="Mod+Backspace" altCombos={['Delete']} />
    ))
    const root = container.querySelector('[data-slot="keyboard-shortcut"]')
    expect(root?.getAttribute('role')).toBe('img')
    expect(root?.getAttribute('aria-label')).toBe(
      'Shortcut Control + Backspace, or Delete',
    )
  })

  it('leaves the chips unlabelled, since the root role replaces them', () => {
    const { container } = render(() => (
      <KeyboardShortcut combo="Mod+Shift+Enter" />
    ))
    expect(
      container.querySelectorAll('[data-slot="key"] [aria-label]').length,
    ).toBe(0)
  })

  it('takes no role without a combo, so the fallback stays readable', () => {
    const { container, getByText } = render(() => (
      <KeyboardShortcut>Press a key</KeyboardShortcut>
    ))
    const root = container.querySelector('[data-slot="keyboard-shortcut"]')
    expect(root?.hasAttribute('role')).toBe(false)
    expect(root?.hasAttribute('aria-label')).toBe(false)
    expect(getByText('Press a key')).toBeTruthy()
  })

  it('draws alternatives after a /, dropping one that matches the main combo', () => {
    const { container } = render(() => (
      <KeyboardShortcut combo="Mod+K" altCombos={['Mod+J', 'Mod+K']} />
    ))
    const alt = container.querySelector('[data-slot="alt-combos"]')
    expect(alt).not.toBeNull()
    expect(alt?.textContent?.replace(/\s+/g, '')).toContain('/')
    // `Mod+K` repeats the main combo, so only `Mod+J` remains.
    expect(
      container.querySelectorAll(
        '[data-slot="alt-combos"] [data-slot="keyboard-shortcut"]',
      ).length,
    ).toBe(1)
  })

  it('applies a caller class once, merged last', () => {
    const { container } = render(() => (
      <KeyboardShortcut combo="Mod+K" class="px-1" />
    ))
    const className =
      container.querySelector('[data-slot="keyboard-shortcut"]')?.className ??
      ''
    expect(className.split(/\s+/).filter((c) => c === 'px-1')).toEqual(['px-1'])
  })

  it('draws non-modifier keys as icons by default', () => {
    const { container } = render(() => (
      <KeyboardShortcut combo="Mod+Backspace" />
    ))
    expect(container.querySelector('.lucide-delete')).not.toBeNull()
  })

  it('draws non-modifier keys as text when useIcons is false', () => {
    const { container } = render(() => (
      <KeyboardShortcut combo="Mod+Backspace" useIcons={false} />
    ))
    expect(container.querySelector('.lucide-delete')).toBeNull()
    expect(keysOf(container)).toEqual(['Ctrl', '⌫'])
  })

  it('omits the plus when either side is an icon (auto)', () => {
    const { container } = render(() => (
      <KeyboardShortcut combo="Mod+Backspace" />
    ))
    expect(container.querySelectorAll('[data-slot="separator"]').length).toBe(0)
  })

  it('forces the plus with showPlus', () => {
    const { container } = render(() => (
      <KeyboardShortcut combo="Mod+Backspace" showPlus />
    ))
    expect(container.querySelectorAll('[data-slot="separator"]').length).toBe(1)
  })

  it('suppresses the plus with showPlus={false}', () => {
    const { container } = render(() => (
      <KeyboardShortcut combo="Mod+K" showPlus={false} />
    ))
    expect(container.querySelectorAll('[data-slot="separator"]').length).toBe(0)
  })

  it('draws chip key icons when useIcons is on', () => {
    const { container } = render(() => (
      <KeyboardShortcut combo="Mod+ArrowUp" bg />
    ))
    expect(container.querySelector('.lucide-arrow-up')).not.toBeNull()
  })

  it('keeps chip modifier glyphs as text except ⌘', () => {
    const { container } = render(() => (
      <KeyboardShortcut combo="Mod+Shift+K" bg />
    ))
    // Off macOS `Mod` is Ctrl, which has no chip icon.
    expect(container.querySelector('.lucide-command')).toBeNull()
    expect(keysOf(container)).toEqual(['Ctrl', '⇧', 'K'])
  })
})
