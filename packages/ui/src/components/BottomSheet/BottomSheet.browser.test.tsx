import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { BottomSheet } from './BottomSheet'

describe('BottomSheet (browser, real CSS)', () => {
  it('paints its surface and anchors to the bottom of the viewport', () => {
    render(() => (
      <BottomSheet defaultOpen title="Filters">
        <p>Body</p>
      </BottomSheet>
    ))

    const content = document.querySelector(
      '[data-slot="bottom-sheet-content"]',
    ) as HTMLElement
    const positioner = document.querySelector(
      '[data-slot="bottom-sheet-positioner"]',
    ) as HTMLElement

    expect(content).not.toBeNull()
    expect(getComputedStyle(content).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )
    // `items-end` pins the sheet's bottom edge to the positioner's.
    const gap =
      positioner.getBoundingClientRect().bottom -
      content.getBoundingClientRect().bottom
    expect(gap).toBeLessThan(2)
  })
})
