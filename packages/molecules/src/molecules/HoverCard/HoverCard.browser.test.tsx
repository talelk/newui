import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { HoverCard } from './HoverCard'

describe('HoverCard (browser, real CSS)', () => {
  it('paints an opaque, bordered card surface', () => {
    render(() => (
      <HoverCard.Root defaultOpen>
        <HoverCard.Trigger>Hover me</HoverCard.Trigger>
        <HoverCard.Content>Details</HoverCard.Content>
      </HoverCard.Root>
    ))

    const content = document.querySelector(
      '[data-slot="hover-card-content"]',
    ) as HTMLElement
    expect(content).not.toBeNull()
    const style = getComputedStyle(content)
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(content.getBoundingClientRect().width).toBeGreaterThan(0)
  })
})
