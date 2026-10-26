import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ProgressCircle } from './ProgressCircle'

describe('ProgressCircle (browser, real CSS)', () => {
  it('paints the track and the range strokes', () => {
    const { container } = render(() => (
      <ProgressCircle value={50} aria-label="Upload" />
    ))
    const track = container.querySelector(
      '[data-slot="progress-circle-track"]',
    ) as SVGCircleElement
    const range = container.querySelector(
      '[data-slot="progress-circle-range"]',
    ) as SVGCircleElement
    expect(getComputedStyle(track).stroke).not.toContain('none')
    expect(getComputedStyle(range).stroke).not.toContain('none')
    expect(getComputedStyle(range).stroke).not.toBe(
      getComputedStyle(track).stroke,
    )
  })

  it('keeps the box on every size step', () => {
    for (const [size, px] of [
      ['sm', 32],
      ['md', 40],
      ['xl', 72],
    ] as const) {
      const { container, unmount } = render(() => (
        <ProgressCircle value={40} size={size} aria-label={size} />
      ))
      const box = (
        container.querySelector('[data-slot="progress-circle"]') as HTMLElement
      ).getBoundingClientRect()
      expect(box.width, size).toBe(px)
      expect(box.height, size).toBe(px)
      unmount()
    }
  })

  it('rotates the ring so the fill starts at twelve o’clock', () => {
    const { container } = render(() => <ProgressCircle value={10} />)
    const svg = container.querySelector('svg') as SVGElement
    // Tailwind v4's `-rotate-90` sets the standalone `rotate` property.
    expect(getComputedStyle(svg).rotate).toBe('-90deg')
  })
})
