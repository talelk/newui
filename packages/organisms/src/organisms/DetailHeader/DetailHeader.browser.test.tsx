import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { DetailHeader } from './DetailHeader'

describe('DetailHeader (browser, real CSS)', () => {
  it('sets the title in the metric scale above the muted subtitle', () => {
    const { container } = render(() => (
      <DetailHeader title="Q3 report.pdf" subtitle="1.2 MB · updated 2h ago" />
    ))
    const title = container.querySelector('h1') as HTMLElement
    const subtitle = container.querySelector('p') as HTMLElement
    // `text-metric` is 1.75rem — the largest type on a record page.
    expect(Number.parseFloat(getComputedStyle(title).fontSize)).toBeGreaterThan(
      24,
    )
    expect(Number.parseFloat(getComputedStyle(subtitle).fontSize)).toBeLessThan(
      Number.parseFloat(getComputedStyle(title).fontSize),
    )
  })

  it('keeps the action buttons real, with the primary one painted', () => {
    const { container } = render(() => (
      <DetailHeader
        title="Report"
        actions={[{ label: 'Share' }, { label: 'Download' }]}
      />
    ))
    const buttons = Array.from(container.querySelectorAll('button'))
    const primary = buttons.at(-1) as HTMLElement
    expect(primary.getBoundingClientRect().height).toBeGreaterThanOrEqual(24)
    // `variant="solid"` must paint — a transparent primary is an invisible CTA.
    expect(getComputedStyle(primary).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )
  })

  it('draws the status pill as a rounded chip', () => {
    const { container } = render(() => (
      <DetailHeader
        title="Report"
        status={{ label: 'Shared', theme: 'blue' }}
      />
    ))
    const badge = container.querySelector('[data-slot="badge"]') as HTMLElement
    const style = getComputedStyle(badge)
    expect(style.borderRadius).not.toBe('0px')
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(badge.getBoundingClientRect().height).toBeGreaterThan(0)
  })
})
