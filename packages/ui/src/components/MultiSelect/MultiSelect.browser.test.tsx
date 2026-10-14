import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { MultiSelect } from './MultiSelect'

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

describe('MultiSelect (browser, real CSS)', () => {
  it('keeps a non-zero control and paints its chips', () => {
    const { container } = render(() => (
      <MultiSelect options={OPTIONS} value={['draft']} placeholder="Pick" />
    ))
    const control = container.querySelector(
      '[data-slot="multiselect-control"]',
    ) as HTMLElement
    expect(control.getBoundingClientRect().height).toBeGreaterThanOrEqual(24)

    const chip = container.querySelector(
      '[data-slot="multiselect-chip"]',
    ) as HTMLElement
    expect(getComputedStyle(chip).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('renders a visible loading row', () => {
    render(() => (
      <MultiSelect options={OPTIONS} placeholder="Pick" defaultOpen loading />
    ))
    const loading = document.querySelector(
      '[data-slot="multiselect-loading"]',
    ) as HTMLElement
    expect(loading).toBeTruthy()
    expect(loading.getBoundingClientRect().height).toBeGreaterThan(0)
  })

  it('renders a group heading and a sized option icon', () => {
    render(() => (
      <MultiSelect options={GROUPED} placeholder="Pick" defaultOpen />
    ))
    const label = document.querySelector(
      '[data-slot="multiselect-group-label"]',
    ) as HTMLElement
    expect(label.textContent).toContain('Active')

    const icon = document.querySelector(
      '[data-slot="multiselect-item"] .lucide-file',
    ) as HTMLElement
    expect(Number.parseFloat(getComputedStyle(icon).width)).toBe(16)
  })
})
