import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Combobox } from './Combobox'

const OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Paid', value: 'paid' },
]

const GROUPED = [
  {
    group: 'Active',
    options: [
      { label: 'Draft', value: 'draft', icon: 'lucide-file' },
      { label: 'Paid', value: 'paid' },
    ],
  },
]

describe('Combobox (browser, real CSS)', () => {
  it('paints the subtle control', () => {
    const { container } = render(() => (
      <Combobox options={OPTIONS} placeholder="Pick" />
    ))
    const control = container.querySelector(
      '[data-slot="combobox-control"]',
    ) as HTMLElement
    expect(getComputedStyle(control).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )
  })

  it('keeps the control box at every size', () => {
    for (const size of ['sm', 'lg'] as const) {
      const { container, unmount } = render(() => (
        <Combobox options={OPTIONS} size={size} placeholder="Pick" />
      ))
      const control = container.querySelector(
        '[data-slot="combobox-control"]',
      ) as HTMLElement
      expect(
        control.getBoundingClientRect().height,
        `${size} height`,
      ).toBeGreaterThanOrEqual(24)
      unmount()
    }
  })

  it('renders a visible loading row', () => {
    render(() => (
      <Combobox options={OPTIONS} placeholder="Pick" defaultOpen loading />
    ))
    const loading = document.querySelector(
      '[data-slot="combobox-loading"]',
    ) as HTMLElement
    expect(loading).toBeTruthy()
    expect(loading.getBoundingClientRect().height).toBeGreaterThan(0)
  })

  it('renders a group heading and a sized option icon', () => {
    render(() => <Combobox options={GROUPED} placeholder="Pick" defaultOpen />)
    const label = document.querySelector(
      '[data-slot="combobox-group-label"]',
    ) as HTMLElement
    expect(label.textContent).toContain('Active')

    const icon = document.querySelector(
      '[data-slot="combobox-item"] .lucide-file',
    ) as HTMLElement
    expect(Number.parseFloat(getComputedStyle(icon).width)).toBe(16)
  })
})
