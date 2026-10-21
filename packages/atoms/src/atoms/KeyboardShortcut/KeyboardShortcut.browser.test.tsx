import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { KeyboardShortcut } from './KeyboardShortcut'

describe('KeyboardShortcut (browser, real CSS)', () => {
  it('gives the chip form a filled, sized key', () => {
    const { container } = render(() => <KeyboardShortcut combo="Mod+K" bg />)
    const key = container.querySelector('[data-slot="key"]') as HTMLElement
    const style = getComputedStyle(key)
    expect(key.getBoundingClientRect().height).toBeGreaterThanOrEqual(24)
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('leaves the plain form unfilled', () => {
    const { container } = render(() => <KeyboardShortcut combo="Mod+K" />)
    const key = container.querySelector('[data-slot="key"]') as HTMLElement
    expect(getComputedStyle(key).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('sizes a drawn key icon and swaps it back to text with useIcons={false}', () => {
    const first = render(() => <KeyboardShortcut combo="Mod+Backspace" />)
    const icon = first.container.querySelector('.lucide-delete') as HTMLElement
    expect(icon).not.toBeNull()
    expect(icon.getBoundingClientRect().width).toBeGreaterThan(0)
    first.unmount()

    const second = render(() => (
      <KeyboardShortcut combo="Mod+Backspace" useIcons={false} />
    ))
    expect(second.container.querySelector('.lucide-delete')).toBeNull()
  })
})
