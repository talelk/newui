import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { SelectionBar } from './SelectionBar'

describe('SelectionBar (browser, real CSS)', () => {
  it('paints a raised card over the data', () => {
    const { container } = render(() => <SelectionBar count={3} />)
    const bar = container.querySelector(
      '[data-slot="selection-bar"]',
    ) as HTMLElement
    const style = getComputedStyle(bar)
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    // `shadow-sm` is what lifts it off the table it covers.
    expect(style.boxShadow).not.toBe('none')
    expect(Number.parseFloat(style.borderRadius)).toBeGreaterThan(0)
    expect(bar.getBoundingClientRect().height).toBeGreaterThanOrEqual(24)
  })

  it('sets the count in the medium interface weight', () => {
    const { container } = render(() => (
      <SelectionBar count={3} summary="$14,650" />
    ))
    const count = Array.from(container.querySelectorAll('span')).find(
      (node) => node.textContent === '3 selected',
    ) as HTMLElement
    expect(
      Number.parseInt(getComputedStyle(count).fontWeight, 10),
    ).toBeGreaterThanOrEqual(500)
    // The summary is a quieter line: it must not match the count's colour.
    const summary = Array.from(container.querySelectorAll('span')).find(
      (node) => node.textContent === '$14,650',
    ) as HTMLElement
    expect(getComputedStyle(summary).color).not.toBe(
      getComputedStyle(count).color,
    )
  })

  it('pins a sticky bar above the bottom edge on the harness phone viewport', () => {
    // This project renders at 414px — below the `sm` breakpoint, which is
    // exactly where `placement="sticky"` becomes `max-sm:fixed`.
    const { container } = render(() => (
      <SelectionBar count={3} placement="sticky" />
    ))
    const bar = container.querySelector(
      '[data-slot="selection-bar"]',
    ) as HTMLElement
    expect(getComputedStyle(bar).position).toBe('fixed')
    expect(Number.parseFloat(getComputedStyle(bar).bottom)).toBeGreaterThan(0)

    // The inline default stays in flow at the same width.
    const inline = render(() => <SelectionBar count={3} />)
    const inlineBar = inline.container.querySelector(
      '[data-slot="selection-bar"]',
    ) as HTMLElement
    expect(getComputedStyle(inlineBar).position).not.toBe('fixed')
  })
})
