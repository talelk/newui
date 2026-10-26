import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Timeline } from './Timeline'

const ITEMS = [
  { title: 'Opened', timestamp: '1d ago', icon: 'lucide-plus' },
  {
    title: 'Reviewed',
    description: 'Approved.',
    timestamp: '5h ago',
    tone: 'blue' as const,
  },
  {
    title: 'Deployed',
    description: 'Went live.',
    timestamp: '2h ago',
    tone: 'green' as const,
  },
]

describe('Timeline (browser, real CSS)', () => {
  it('draws a round marker at its declared size', () => {
    const { container } = render(() => <Timeline items={ITEMS} />)
    const marker = container.querySelector(
      '[data-slot="timeline-marker"]',
    ) as HTMLElement
    const rect = marker.getBoundingClientRect()
    // `size-6` — the rail halves are measured from this 24px box.
    expect(rect.width).toBeGreaterThan(20)
    expect(rect.height).toBeGreaterThan(20)
    expect(
      Number.parseFloat(getComputedStyle(marker).borderRadius),
    ).toBeGreaterThan(rect.width / 2)
    // Tinted tile, not a bare dot container.
    expect(getComputedStyle(marker).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )
  })

  it('paints the rail between the markers', () => {
    const { container } = render(() => <Timeline items={ITEMS} />)
    const rows = container.querySelectorAll('[data-slot="timeline-item"]')
    const rail = rows[1]?.querySelector(
      '[aria-hidden="true"] span',
    ) as HTMLElement
    const rect = rail.getBoundingClientRect()
    expect(rect.width).toBe(1)
    expect(rect.height).toBeGreaterThan(0)
    expect(getComputedStyle(rail).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('spaces every row but the last', () => {
    const { container } = render(() => <Timeline items={ITEMS} />)
    const rows = container.querySelectorAll('[data-slot="timeline-item"]')
    const text = (row: Element) =>
      getComputedStyle(
        row.querySelector(':scope > div:last-child') as HTMLElement,
      ).paddingBottom
    expect(Number.parseFloat(text(rows[0] as Element))).toBe(24)
    expect(Number.parseFloat(text(rows[2] as Element))).toBe(0)
  })
})
