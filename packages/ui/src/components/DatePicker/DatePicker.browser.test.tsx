import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { DatePicker } from './DatePicker'

describe('DatePicker (browser, real CSS)', () => {
  it('keeps a non-zero control and an opaque calendar surface', () => {
    const { container } = render(() => (
      <DatePicker defaultOpen aria-label="Pick a date" />
    ))

    const control = container.querySelector(
      '[data-slot="date-picker-control"]',
    ) as HTMLElement
    expect(control.getBoundingClientRect().height).toBeGreaterThanOrEqual(24)

    const content = document.querySelector(
      '[data-slot="date-picker-content"]',
    ) as HTMLElement
    expect(content).not.toBeNull()
    expect(getComputedStyle(content).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )
  })

  it('renders the Intl-formatted value in the input', () => {
    const { container } = render(() => (
      <DatePicker
        aria-label="Pick a date"
        value="2026-10-14"
        format={{ year: 'numeric', month: 'long', day: 'numeric' }}
      />
    ))

    const input = container.querySelector(
      '[data-slot="date-picker-input"]',
    ) as HTMLInputElement
    expect(input.value).toBe('October 14, 2026')
  })
})
