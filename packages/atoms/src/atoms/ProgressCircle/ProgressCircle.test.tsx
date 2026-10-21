import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ProgressCircle } from './ProgressCircle'

describe('ProgressCircle', () => {
  it('is a labelled progressbar when given a value', () => {
    const { container } = render(() => (
      <ProgressCircle value={64} aria-label="Storage used" />
    ))
    const bar = screen.getByRole('progressbar', { name: 'Storage used' })
    expect(bar.getAttribute('aria-valuenow')).toBe('64')
    // The root carries our mode (`determinate`); the track carries Zag's state
    // (`loading` | `complete` | `indeterminate`).
    expect(
      container
        .querySelector('[data-slot="progress-circle"]')
        ?.getAttribute('data-state'),
    ).toBe('determinate')
    expect(bar.getAttribute('data-state')).toBe('loading')
  })

  it('draws a track and a range', () => {
    const { container } = render(() => <ProgressCircle value={50} />)
    expect(
      container.querySelector('[data-slot="progress-circle-track"]'),
    ).toBeTruthy()
    expect(
      container.querySelector('[data-slot="progress-circle-range"]'),
    ).toBeTruthy()
  })

  it('clamps a value above or below the range', () => {
    render(() => <ProgressCircle value={140} aria-label="Over" />)
    expect(
      screen
        .getByRole('progressbar', { name: 'Over' })
        .getAttribute('aria-valuenow'),
    ).toBe('100')
  })

  it('drops aria-valuenow when indeterminate', () => {
    const { container } = render(() => (
      <ProgressCircle indeterminate aria-label="Loading" />
    ))
    const bar = screen.getByRole('progressbar', { name: 'Loading' })
    expect(bar.getAttribute('aria-valuenow')).toBeNull()
    expect(
      container
        .querySelector('[data-slot="progress-circle"]')
        ?.getAttribute('data-state'),
    ).toBe('indeterminate')
  })

  it('reports completion to the machine at 100', () => {
    render(() => <ProgressCircle value={100} aria-label="Done" />)
    expect(
      screen
        .getByRole('progressbar', { name: 'Done' })
        .getAttribute('data-state'),
    ).toBe('complete')
  })

  it('scales the ring with the box so the weight stays constant', () => {
    const small = render(() => <ProgressCircle value={40} size="sm" />)
    const smallStroke = Number(
      small.container
        .querySelector('[data-slot="progress-circle-range"]')
        ?.getAttribute('stroke-width'),
    )
    small.unmount()

    const large = render(() => <ProgressCircle value={40} size="xl" />)
    const largeStroke = Number(
      large.container
        .querySelector('[data-slot="progress-circle-range"]')
        ?.getAttribute('stroke-width'),
    )

    // Same on-screen width (3px vs 6px) over a 32px vs 72px box, so the
    // viewBox-unit widths must differ by roughly the inverse of the boxes.
    expect(smallStroke).toBeGreaterThan(largeStroke)
  })

  it('renders centred content', () => {
    render(() => <ProgressCircle value={72}>72%</ProgressCircle>)
    expect(screen.getByText('72%')).toBeTruthy()
  })
})
