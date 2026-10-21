import { render, screen } from '@solidjs/testing-library'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { VirtualList } from './VirtualList'

const ROWS = Array.from({ length: 1000 }, (_, index) => ({
  id: `ROW-${index + 1}`,
  title: `Row ${index + 1}`,
}))

/**
 * jsdom has no layout, so the viewport reports a zero rect and the virtualiser
 * renders nothing. The tests give every element a 440px box, which is the only
 * measurement the list needs.
 */
class MeasuredObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}
  observe(target: Element) {
    const rect = target.getBoundingClientRect()
    this.callback(
      [
        {
          target,
          contentRect: rect,
          borderBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
          contentBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
        } as unknown as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    )
  }
  unobserve() {}
  disconnect() {}
}

function withLayout() {
  const rect = {
    width: 600,
    height: 440,
    top: 0,
    left: 0,
    right: 600,
    bottom: 440,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect
  const spy = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockReturnValue(rect)
  // The jsdom shim observes nothing; the virtualiser needs one measurement.
  vi.stubGlobal('ResizeObserver', MeasuredObserver)
  return spy
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('VirtualList', () => {
  it('keeps a bounded DOM, with row positions declared for assistive tech', () => {
    const spy = withLayout()
    render(() => (
      <VirtualList label="Rows" items={ROWS} itemSize={72} height="440px">
        {(row) => <span>{row.title}</span>}
      </VirtualList>
    ))
    const viewport = screen.getByRole('region', { name: 'Rows' })
    expect(viewport.getAttribute('data-slot')).toBe('virtual-list')
    expect(viewport.getAttribute('tabindex')).toBe('0')

    const rows = viewport.querySelectorAll('li')
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.length).toBeLessThan(30)
    const first = rows[0] as HTMLLIElement
    expect(first.getAttribute('aria-posinset')).toBe('1')
    expect(first.getAttribute('aria-setsize')).toBe('1000')
    spy.mockRestore()
  })
})
