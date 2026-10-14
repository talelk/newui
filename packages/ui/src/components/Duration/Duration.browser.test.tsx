import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Duration } from './Duration'

describe('Duration (browser, real CSS)', () => {
  it('keeps a non-zero box and paints the subtle fill', () => {
    const { container } = render(() => <Duration aria-label="Duration" />)
    const input = container.querySelector(
      '[data-slot="duration"]',
    ) as HTMLElement
    const style = getComputedStyle(input)
    expect(input.getBoundingClientRect().height).toBeGreaterThanOrEqual(24)
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('grows from sm to lg', () => {
    const { container, unmount } = render(() => (
      <Duration size="sm" aria-label="Duration" />
    ))
    const small = (
      container.querySelector('[data-slot="duration"]') as HTMLElement
    ).getBoundingClientRect().height
    unmount()
    const { container: second } = render(() => (
      <Duration size="lg" aria-label="Duration" />
    ))
    const large = (
      second.querySelector('[data-slot="duration"]') as HTMLElement
    ).getBoundingClientRect().height
    expect(large).toBeGreaterThan(small)
  })
})
