import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Switch } from './Switch'

describe('Switch (browser, real CSS)', () => {
  it('keeps a non-zero track', () => {
    const { container } = render(() => <Switch label="Notify" />)
    const control = container.querySelector(
      '[data-slot="switch-control"]',
    ) as HTMLElement
    const box = control.getBoundingClientRect()
    expect(box.width).toBeGreaterThan(0)
    expect(box.height).toBeGreaterThan(0)
  })

  it('paints the checked track differently from the unchecked one', () => {
    const { container } = render(() => (
      <div>
        <Switch label="Off" />
        <Switch label="On" defaultChecked />
      </div>
    ))
    const [off, on] = Array.from(
      container.querySelectorAll('[data-slot="switch-control"]'),
    )
    expect(getComputedStyle(on as HTMLElement).backgroundColor).not.toBe(
      getComputedStyle(off as HTMLElement).backgroundColor,
    )
  })

  it('renders each size at its own track and thumb dimensions', () => {
    const { container } = render(() => (
      <div>
        <Switch label="Small" size="sm" />
        <Switch label="Large" size="md" />
      </div>
    ))
    const controls = container.querySelectorAll('[data-slot="switch-control"]')
    const thumbs = container.querySelectorAll('[data-slot="switch-thumb"]')
    const smTrack = (controls[0] as HTMLElement).getBoundingClientRect()
    const mdTrack = (controls[1] as HTMLElement).getBoundingClientRect()
    expect(smTrack.width).toBeCloseTo(26, 0)
    expect(mdTrack.width).toBeCloseTo(32, 0)
    expect(mdTrack.height).toBeGreaterThan(smTrack.height)

    const smThumb = (thumbs[0] as HTMLElement).getBoundingClientRect()
    const mdThumb = (thumbs[1] as HTMLElement).getBoundingClientRect()
    expect(mdThumb.width).toBeGreaterThan(smThumb.width)
  })

  it('gives a padded row its fixed compact height', () => {
    const { container } = render(() => <Switch padded label="Row" />)
    const surface = container.firstElementChild as HTMLElement
    // `sm` padded label-only rows are `h-7` (28px).
    expect(surface.getBoundingClientRect().height).toBeCloseTo(28, 0)
  })
})
