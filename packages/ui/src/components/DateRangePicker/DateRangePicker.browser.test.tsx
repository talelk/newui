import { render, waitFor } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DateRangePicker } from './DateRangePicker'

function day(iso: string): HTMLElement {
  return document.querySelector(
    `[data-slot="date-range-picker-content"] button[data-value="${iso}"]`,
  ) as HTMLElement
}

describe('DateRangePicker (browser, real CSS)', () => {
  it('keeps a non-zero control and an opaque calendar surface', () => {
    const { container } = render(() => (
      <DateRangePicker defaultOpen aria-label="Pick a range" />
    ))

    const control = container.querySelector(
      '[data-slot="date-range-picker-control"]',
    ) as HTMLElement
    expect(control.getBoundingClientRect().height).toBeGreaterThanOrEqual(24)

    const content = document.querySelector(
      '[data-slot="date-range-picker-content"]',
    ) as HTMLElement
    expect(content).not.toBeNull()
    expect(getComputedStyle(content).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )
  })

  it('renders the Intl-formatted range in both inputs', () => {
    const { container } = render(() => (
      <DateRangePicker
        aria-label="Pick a range"
        value={['2026-10-14', '2026-10-16']}
        format={{ year: 'numeric', month: 'long', day: 'numeric' }}
      />
    ))

    const inputs = container.querySelectorAll(
      '[data-slot="date-range-picker-input"], [data-slot="date-range-picker-input-end"]',
    ) as NodeListOf<HTMLInputElement>
    expect(inputs[0]?.value).toBe('October 14, 2026')
    expect(inputs[1]?.value).toBe('October 16, 2026')
  })

  it('selects a range with real pointer events', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <DateRangePicker
        aria-label="Pick a range"
        min="2026-10-01"
        max="2026-10-31"
        onValueChange={onValueChange}
      />
    ))

    await userEvent.click(
      document.querySelector(
        'button[aria-label="Choose date range"]',
      ) as HTMLElement,
    )
    await userEvent.click(day('2026-10-14'))
    await userEvent.click(day('2026-10-16'))

    await waitFor(() =>
      expect(onValueChange).toHaveBeenCalledWith(['2026-10-14', '2026-10-16']),
    )
  })
})
