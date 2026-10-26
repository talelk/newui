import { render, screen } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { VirtualList } from './VirtualList'

const AXE_OPTIONS = {
  rules: {
    'color-contrast': { enabled: false },
    region: { enabled: false },
  },
}

function summarize(results: AxeResults) {
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }))
}

const ROWS = Array.from({ length: 1000 }, (_, index) => ({
  id: `ROW-${index + 1}`,
  title: `Row ${index + 1}`,
}))

interface Row {
  id: string
  title: string
}

const EMPTY: Row[] = []

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

describe('VirtualList accessibility', () => {
  it('has no axe violations for a virtualised list of rows', async () => {
    withLayout()
    const { container } = render(() => (
      <VirtualList label="Rows" items={ROWS} itemSize={72} height="440px">
        {(row) => <span>{row.title}</span>}
      </VirtualList>
    ))
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0)
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for the empty state', async () => {
    const { container } = render(() => (
      <VirtualList
        label="Rows"
        items={EMPTY}
        itemSize={72}
        emptyTitle="No rows yet"
        emptyDescription="Create the first one."
      >
        {(row) => <span>{row.title}</span>}
      </VirtualList>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
