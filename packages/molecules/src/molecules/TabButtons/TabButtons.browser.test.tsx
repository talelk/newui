import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { TabButtons } from './TabButtons'

const OPTIONS = [
  { label: 'List', value: 'list' },
  { label: 'Board', value: 'board' },
]

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
}

describe('TabButtons (browser, real CSS)', () => {
  it('paints the segmented track and positions the indicator on the active tab', async () => {
    const { container } = render(() => (
      <TabButtons options={OPTIONS} defaultValue="list" />
    ))
    await nextFrame()
    const track = container.querySelector(
      '[data-slot="tab-buttons"]',
    ) as HTMLElement
    expect(getComputedStyle(track).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')

    const indicator = container.querySelector(
      '[data-slot="tab-indicator"]',
    ) as HTMLElement
    expect(indicator.getBoundingClientRect().width).toBeGreaterThan(0)

    const buttons = Array.from(
      container.querySelectorAll('button'),
    ) as HTMLElement[]
    expect(buttons.length).toBe(2)
    expect(
      (buttons[0] as HTMLElement).getBoundingClientRect().height,
    ).toBeGreaterThanOrEqual(24)
  })

  it('moves the indicator to the selected tab', async () => {
    const { container } = render(() => (
      <TabButtons options={OPTIONS} defaultValue="board" />
    ))
    await nextFrame()
    // Layout must be font-stable: `font-display: swap` re-measures the
    // indicator when Inter lands, and a read between the swap and the
    // re-measure sees stale subpixel geometry.
    await document.fonts.ready
    await nextFrame()
    const indicator = container.querySelector(
      '[data-slot="tab-indicator"]',
    ) as HTMLElement
    const buttons = Array.from(
      container.querySelectorAll('button'),
    ) as HTMLElement[]
    const second = buttons[1] as HTMLElement
    expect(
      Math.abs(
        indicator.getBoundingClientRect().left -
          second.getBoundingClientRect().left,
      ),
    ).toBeLessThan(2)
  })

  it('draws an underline rail for the underline variant', () => {
    const { container } = render(() => (
      <TabButtons options={OPTIONS} variant="underline" />
    ))
    const track = container.querySelector(
      '[data-slot="tab-buttons"]',
    ) as HTMLElement
    expect(
      Number.parseFloat(getComputedStyle(track).borderBottomWidth),
    ).toBeGreaterThan(0)
  })
})
