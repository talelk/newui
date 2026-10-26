import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Calendar } from './Calendar'

describe('Calendar (browser, real CSS)', () => {
  it('scrolls a dual-pane grid inside its frame instead of pushing the page', () => {
    const { container } = render(() => (
      <div style={{ width: '375px' }}>
        <Calendar aria-label="Period" defaultValue="2026-10-26" dualPane />
      </div>
    ))
    const frame = container.querySelector(
      '[data-slot="calendar"]',
    ) as HTMLElement
    expect(frame.clientWidth).toBeLessThanOrEqual(375)
    // The grid keeps its natural width inside the scroller.
    expect(frame.scrollWidth).toBeGreaterThan(frame.clientWidth)
  })

  it('paints the surface and selected cell', () => {
    const { container } = render(() => (
      <Calendar aria-label="Booking date" defaultValue="2026-10-26" />
    ))
    const frame = container.querySelector(
      '[data-slot="calendar"]',
    ) as HTMLElement
    expect(getComputedStyle(frame).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    const selected = container.querySelector(
      'button[data-selected]',
    ) as HTMLElement
    expect(selected.getBoundingClientRect().height).toBeGreaterThan(0)
  })
})
