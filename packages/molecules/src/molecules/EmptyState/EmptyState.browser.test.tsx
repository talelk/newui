import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { EmptyState } from './EmptyState'

describe('EmptyState (browser, real CSS)', () => {
  it('paints the tinted tile behind the icon', () => {
    const { container } = render(() => (
      <EmptyState icon="lucide-inbox" title="No invoices yet" />
    ))
    const tile = container.querySelector(
      '[data-slot="empty-state-icon"]',
    ) as HTMLElement
    expect(tile.getBoundingClientRect().width).toBeGreaterThan(0)
    expect(getComputedStyle(tile).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('gives the larger sizes more vertical room', () => {
    const small = render(() => <EmptyState title="Empty" size="sm" />)
    const smallPad = Number.parseFloat(
      getComputedStyle(
        small.container.querySelector(
          '[data-slot="empty-state"]',
        ) as HTMLElement,
      ).paddingTop,
    )
    small.unmount()

    const large = render(() => <EmptyState title="Empty" size="lg" />)
    const largePad = Number.parseFloat(
      getComputedStyle(
        large.container.querySelector(
          '[data-slot="empty-state"]',
        ) as HTMLElement,
      ).paddingTop,
    )
    // `py-6` on sm, `py-16` on lg — a dropped size utility levels them.
    expect(smallPad).toBe(24)
    expect(largePad).toBe(64)
  })

  it('draws a real dashed frame when bordered', () => {
    const { container } = render(() => (
      <EmptyState title="Drop files here" bordered />
    ))
    const box = container.querySelector(
      '[data-slot="empty-state"]',
    ) as HTMLElement
    const style = getComputedStyle(box)
    expect(style.borderTopStyle).toBe('dashed')
    expect(Number.parseFloat(style.borderTopWidth)).toBeGreaterThan(0)
  })
})
