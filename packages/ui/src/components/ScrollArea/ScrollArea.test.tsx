import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ScrollArea } from './ScrollArea'

describe('ScrollArea', () => {
  it('renders a viewport with a vertical scrollbar and thumb', () => {
    const { container } = render(() => (
      <ScrollArea.Root class="h-40">
        <ScrollArea.Viewport>
          <div>Long content</div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" />
      </ScrollArea.Root>
    ))

    const viewport = container.querySelector(
      '[data-slot="scroll-area-viewport"]',
    )
    expect(viewport?.textContent).toContain('Long content')
    expect(
      container.querySelector('[data-slot="scroll-area-scrollbar"]'),
    ).not.toBeNull()
    expect(
      container.querySelector('[data-slot="scroll-area-thumb"]'),
    ).not.toBeNull()
  })

  it('is an overlay that hides itself when there is nothing to scroll', () => {
    const { container } = render(() => (
      <ScrollArea.Root class="h-40">
        <ScrollArea.Viewport>
          <div>Short content</div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" />
        <ScrollArea.Scrollbar orientation="horizontal" />
      </ScrollArea.Root>
    ))

    const bars = container.querySelectorAll(
      '[data-slot="scroll-area-scrollbar"]',
    )
    // No gray gutter: the content reaches the edge, and a bar whose axis does
    // not overflow takes no space and shows nothing.
    expect(bars[0]?.className).toContain('bg-transparent')
    expect(bars[0]?.className).toContain('data-[overflow-y=false]:hidden')
    expect(bars[1]?.className).toContain('data-[overflow-x=false]:hidden')
    expect(bars[0]?.className).toContain('pointer-events-none')

    // The thumb is invisible until the pointer or a scroll arrives, and only
    // then does it accept a drag.
    const thumb = container.querySelector('[data-slot="scroll-area-thumb"]')
    expect(thumb?.className).toContain('opacity-0')
    expect(thumb?.className).toContain('group-data-[hover]:opacity-100')
    expect(thumb?.className).toContain('group-data-[hover]:pointer-events-auto')
  })
})
