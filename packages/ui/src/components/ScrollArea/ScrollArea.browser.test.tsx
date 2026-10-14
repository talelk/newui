import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ScrollArea } from './ScrollArea'

describe('ScrollArea (browser, real CSS)', () => {
  it('clips the root and draws a real scrollbar', () => {
    const { container } = render(() => (
      <ScrollArea.Root class="h-40">
        <ScrollArea.Viewport>
          <div>Long content</div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" />
      </ScrollArea.Root>
    ))

    const root = container.querySelector(
      '[data-slot="scroll-area"]',
    ) as HTMLElement
    expect(getComputedStyle(root).overflow).toBe('hidden')

    const scrollbar = container.querySelector(
      '[data-slot="scroll-area-scrollbar"]',
    ) as HTMLElement
    expect(scrollbar.getBoundingClientRect().width).toBeGreaterThan(0)
  })
})
