import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Select } from './Select'

const OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Paid', value: 'paid' },
]

const RICH_OPTIONS = [
  { label: 'Draft', value: 'draft', icon: 'lucide-file' },
  { label: 'Paid', value: 'paid', icon: 'lucide-check' },
]

describe('Select (browser, real CSS)', () => {
  it('draws a bordered control with a padded trigger', () => {
    const { container } = render(() => (
      <Select options={OPTIONS} placeholder="Choose…" />
    ))
    const control = container.querySelector(
      '[data-slot="select-control"]',
    ) as HTMLElement
    expect(
      Number.parseFloat(getComputedStyle(control).borderTopWidth),
    ).toBeGreaterThan(0)

    const trigger = container.querySelector(
      '[data-slot="select-trigger"]',
    ) as HTMLElement
    expect(
      Number.parseFloat(getComputedStyle(trigger).paddingLeft),
    ).toBeGreaterThan(0)
  })

  it('dims a disabled control against an enabled one', () => {
    const { container, unmount } = render(() => (
      <Select options={OPTIONS} placeholder="Choose…" />
    ))
    const enabled = getComputedStyle(
      container.querySelector('[data-slot="select-control"]') as HTMLElement,
    ).backgroundColor
    unmount()
    const { container: second } = render(() => (
      <Select options={OPTIONS} placeholder="Choose…" disabled />
    ))
    const disabled = getComputedStyle(
      second.querySelector('[data-slot="select-control"]') as HTMLElement,
    ).backgroundColor
    expect(disabled).not.toBe(enabled)
  })

  it('paints a filled subtle control and an unfilled outline one', () => {
    const { container, unmount } = render(() => (
      <Select options={OPTIONS} placeholder="Choose…" variant="subtle" />
    ))
    const subtle = getComputedStyle(
      container.querySelector('[data-slot="select-control"]') as HTMLElement,
    ).backgroundColor
    unmount()
    const { container: second } = render(() => (
      <Select options={OPTIONS} placeholder="Choose…" variant="outline" />
    ))
    const outline = getComputedStyle(
      second.querySelector('[data-slot="select-control"]') as HTMLElement,
    ).backgroundColor
    expect(subtle).not.toBe(outline)
  })

  it('sizes the selected option icon in the trigger', () => {
    const { container } = render(() => (
      <Select options={RICH_OPTIONS} value={['paid']} />
    ))
    const icon = container.querySelector(
      '[data-slot="select-trigger"] .lucide-check',
    ) as HTMLElement
    expect(icon).toBeTruthy()
    const style = getComputedStyle(icon)
    expect(Number.parseFloat(style.width)).toBe(16)
    expect(Number.parseFloat(style.height)).toBe(16)
  })
})
