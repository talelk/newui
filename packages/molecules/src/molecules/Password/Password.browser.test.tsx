import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Password } from './Password'

describe('Password (browser, real CSS)', () => {
  it('keeps a non-zero input and a real reveal toggle', () => {
    const { container } = render(() => (
      <Password aria-label="Password" defaultValue="secret" />
    ))
    const input = container.querySelector('input') as HTMLElement
    expect(input.getBoundingClientRect().height).toBeGreaterThanOrEqual(24)
    expect(getComputedStyle(input).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')

    const toggle = container.querySelector(
      'button[aria-label="Show password"]',
    ) as HTMLElement
    const box = toggle.getBoundingClientRect()
    expect(box.width).toBeGreaterThan(0)
    expect(box.height).toBeGreaterThan(0)
  })
})
