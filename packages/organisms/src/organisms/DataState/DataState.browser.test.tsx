import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { DataState } from './DataState'

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
}

describe('DataState (browser, real CSS)', () => {
  it('renders loading skeletons as real painted rows', async () => {
    const { container } = render(() => (
      <DataState status="loading" skeleton="rows" rows={3} />
    ))
    await nextFrame()
    const rows = container.querySelectorAll(
      '[data-slot="skeleton"]',
    ) as unknown as HTMLElement[]
    expect(rows.length).toBe(3)
    const row = rows[0] as HTMLElement
    // `h-9` per row — a dropped height utility collapses the placeholder.
    expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(32)
    // The paint lives on the shimmering line inside the row wrapper.
    const line = row.querySelector('[data-slot="skeleton-line"]') as HTMLElement
    expect(line).toBeTruthy()
    expect(getComputedStyle(line).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('paints the empty state icon tile', () => {
    const { container } = render(() => (
      <DataState status="empty" title="No expenses" />
    ))
    const tile = container.querySelector(
      '[data-slot="empty-state-icon"]',
    ) as HTMLElement
    expect(tile.getBoundingClientRect().width).toBeGreaterThan(0)
    expect(getComputedStyle(tile).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('keeps the retry button a real target', async () => {
    const { container } = render(() => (
      <DataState status="error" error="The request failed" onRetry={() => {}} />
    ))
    await nextFrame()
    const button = Array.from(container.querySelectorAll('button')).find(
      (node) => node.textContent === 'Try again',
    ) as HTMLElement
    expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(24)
    expect(getComputedStyle(button).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )
  })
})
