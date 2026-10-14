import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Popover } from './Popover'

describe('Popover (browser, real CSS)', () => {
  it('paints an opaque popover surface with an edge', () => {
    render(() => (
      <Popover.Root defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content>
          <Popover.Title>Title</Popover.Title>
        </Popover.Content>
      </Popover.Root>
    ))

    const content = document.querySelector(
      '[data-slot="popover-content"]',
    ) as HTMLElement
    expect(content).not.toBeNull()
    const style = getComputedStyle(content)
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    // The edge is a `ring-1` (a box-shadow), not a border.
    expect(style.boxShadow).not.toBe('none')
    expect(content.getBoundingClientRect().width).toBeGreaterThan(0)
  })
})
