import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Slider } from './Slider'

describe('Slider (browser, real CSS)', () => {
  it('keeps a non-zero thumb, track and filled range', () => {
    const { container } = render(() => (
      <Slider defaultValue={[50]} aria-label="Amount" />
    ))
    const thumb = container.querySelector(
      '[data-slot="slider-thumb"]',
    ) as HTMLElement
    const track = container.querySelector(
      '[data-slot="slider-track"]',
    ) as HTMLElement
    const range = container.querySelector(
      '[data-slot="slider-range"]',
    ) as HTMLElement

    expect(thumb.getBoundingClientRect().width).toBeGreaterThan(0)
    expect(track.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(range.getBoundingClientRect().width).toBeGreaterThan(0)
  })

  it('renders each size at its own thumb and track dimensions', () => {
    const { container } = render(() => (
      <div>
        <Slider defaultValue={[50]} size="sm" aria-label="Small" />
        <Slider defaultValue={[50]} size="md" aria-label="Large" />
      </div>
    ))
    const thumbs = container.querySelectorAll('[data-slot="slider-thumb"]')
    const tracks = container.querySelectorAll('[data-slot="slider-track"]')
    const smThumb = (thumbs[0] as HTMLElement).getBoundingClientRect()
    const mdThumb = (thumbs[1] as HTMLElement).getBoundingClientRect()
    expect(smThumb.width).toBeCloseTo(16, 0)
    expect(mdThumb.width).toBeCloseTo(20, 0)

    const smTrack = (tracks[0] as HTMLElement).getBoundingClientRect()
    const mdTrack = (tracks[1] as HTMLElement).getBoundingClientRect()
    expect(mdTrack.height).toBeGreaterThan(smTrack.height)
  })
})
