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
})
