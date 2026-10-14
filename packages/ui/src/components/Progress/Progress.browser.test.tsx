import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Progress } from './Progress'

describe('Progress (browser, real CSS)', () => {
  it('keeps a non-zero track and a bar proportional to the value', () => {
    const { getByRole } = render(() => (
      <Progress value={50} aria-label="Half" />
    ))
    const track = getByRole('progressbar')
    const bar = track.firstElementChild as HTMLElement
    const trackWidth = track.getBoundingClientRect().width
    const barWidth = bar.getBoundingClientRect().width
    expect(track.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(barWidth).toBeGreaterThan(0)
    expect(barWidth).toBeLessThan(trackWidth)
    expect(getComputedStyle(track).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('grows the track with size', () => {
    const { getByRole, unmount } = render(() => (
      <Progress value={10} size="sm" aria-label="Small" />
    ))
    const small = getByRole('progressbar').getBoundingClientRect().height
    unmount()
    const { getByRole: second } = render(() => (
      <Progress value={10} size="xl" aria-label="Large" />
    ))
    const large = second('progressbar').getBoundingClientRect().height
    expect(large).toBeGreaterThan(small)
  })

  it('draws the label row above the track', () => {
    const { getByText, getByRole } = render(() => (
      <Progress value={40} label="Uploading" hint />
    ))
    expect(getByText('Uploading')).toBeTruthy()
    expect(getByText('40%')).toBeTruthy()
    expect(
      getByText('Uploading').getBoundingClientRect().top,
    ).toBeLessThanOrEqual(getByRole('progressbar').getBoundingClientRect().top)
  })
})
