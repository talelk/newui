import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { KeyboardShortcut } from './KeyboardShortcut'

describe('KeyboardShortcut SSR smoke', () => {
  it('renders a combo to a string', () => {
    const html = renderToString(() => <KeyboardShortcut combo="Mod+Shift+K" />)
    expect(html).toContain('data-slot="keyboard-shortcut"')
    expect(html).toContain('data-slot="key"')
    expect(html).toContain('aria-label="Shortcut Control + Shift + K"')
  })

  it('renders the fallback content without a role', () => {
    const html = renderToString(() => (
      <KeyboardShortcut>Press a key</KeyboardShortcut>
    ))
    expect(html).toContain('Press a key')
    expect(html).not.toContain('role="img"')
  })
})
