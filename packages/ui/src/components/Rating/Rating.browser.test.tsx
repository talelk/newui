import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Rating } from './Rating'

describe('Rating (browser, real CSS)', () => {
  it('renders sized, coloured stars', () => {
    const { container } = render(() => (
      <Rating defaultValue={3} aria-label="Rating" />
    ))
    const stars = container.querySelectorAll(
      '[data-slot="rating-control"] > span',
    )
    expect(stars.length).toBe(5)
    const star = stars[0] as HTMLElement
    expect(star.getBoundingClientRect().width).toBeGreaterThan(0)
    expect(getComputedStyle(star).color).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('renders each size at its own star dimensions', () => {
    const { container } = render(() => (
      <div>
        <Rating size="xs" aria-label="Small" />
        <Rating size="lg" aria-label="Large" />
      </div>
    ))
    const items = container.querySelectorAll('[data-slot="rating-item"]')
    const xs = (items[0] as HTMLElement).getBoundingClientRect()
    const lg = (items[5] as HTMLElement).getBoundingClientRect()
    expect(xs.width).toBeCloseTo(14, 0)
    expect(lg.width).toBeCloseTo(24, 0)
    expect(lg.width).toBeGreaterThan(xs.width)
  })

  it('fills only the left half of the half-star', () => {
    const { container } = render(() => (
      <Rating defaultValue={2.5} step={0.5} aria-label="Half" />
    ))
    const halves = container.querySelectorAll(
      '[data-slot="rating-item"]:nth-of-type(3) [data-slot="rating-half"]',
    )
    const left = getComputedStyle(halves[0] as HTMLElement).color
    const right = getComputedStyle(halves[1] as HTMLElement).color
    expect(left).not.toBe(right)
  })
})
