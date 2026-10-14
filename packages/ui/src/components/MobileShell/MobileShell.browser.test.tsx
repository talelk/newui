import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { MobileShell, PageHeaderMobile } from './MobileShell'

describe('MobileShell (browser, real CSS)', () => {
  it('fills the viewport with a fixed frame and a scrolling body', () => {
    const { container } = render(() => (
      <MobileShell header={<PageHeaderMobile title="Home" />}>
        <p>Body</p>
      </MobileShell>
    ))
    const shell = container.querySelector(
      '[data-slot="mobile-shell"]',
    ) as HTMLElement
    expect(getComputedStyle(shell).position).toBe('fixed')
    expect(shell.getBoundingClientRect().height).toBeGreaterThan(0)

    const scroll = container.querySelector(
      '[data-slot="mobile-shell-scroll"]',
    ) as HTMLElement
    expect(getComputedStyle(scroll).overflowY).toBe('auto')
  })
})
