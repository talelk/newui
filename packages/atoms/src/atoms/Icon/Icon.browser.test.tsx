import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Icon } from './Icon'

describe('Icon (browser, real CSS)', () => {
  it('renders a sized glyph masked with the current colour', () => {
    const { container } = render(() => (
      <Icon icon="lucide-info" class="size-4" />
    ))
    const el = container.firstElementChild as HTMLElement
    const box = el.getBoundingClientRect()
    expect(box.width).toBeCloseTo(16, 0)
    expect(box.height).toBeGreaterThan(0)
    const style = getComputedStyle(el)
    // The icon-pack utility masks an SVG and paints it with currentColor.
    expect(style.maskImage).not.toBe('none')
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})
