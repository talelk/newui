import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { DesktopShell } from './DesktopShell'

describe('DesktopShell (browser, real CSS)', () => {
  it('owns the page scroller by default', () => {
    const { container } = render(() => (
      <DesktopShell>
        <p>Body</p>
      </DesktopShell>
    ))
    const content = container.querySelector(
      '[data-slot="desktop-shell-content"]',
    ) as HTMLElement
    expect(content.getAttribute('data-scroll')).toBe('page')
    expect(getComputedStyle(content).overflowY).toBe('auto')
  })

  it('defers overflow to the panes when scroll is false', () => {
    const { container } = render(() => (
      <DesktopShell scroll={false}>
        <p>Body</p>
      </DesktopShell>
    ))
    const content = container.querySelector(
      '[data-slot="desktop-shell-content"]',
    ) as HTMLElement
    expect(content.getAttribute('data-scroll')).toBe('panes')
    expect(getComputedStyle(content).overflowY).toBe('hidden')
  })
})
