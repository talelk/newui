import { render, waitFor } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DateTimePicker } from './DateTimePicker'

describe('DateTimePicker (browser, real CSS)', () => {
  it('keeps a non-zero control, an opaque surface and a tappable time list', () => {
    const { container } = render(() => (
      <DateTimePicker defaultOpen aria-label="Pick a moment" interval={60} />
    ))

    const control = container.querySelector(
      '[data-slot="date-time-picker-control"]',
    ) as HTMLElement
    expect(control.getBoundingClientRect().height).toBeGreaterThanOrEqual(24)

    const content = document.querySelector(
      '[data-slot="date-time-picker-content"]',
    ) as HTMLElement
    expect(content).not.toBeNull()
    expect(getComputedStyle(content).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )

    const option = document.querySelector(
      '[data-slot="date-time-picker-time-option"]',
    ) as HTMLElement
    expect(option.getBoundingClientRect().height).toBeGreaterThan(0)
  })

  it('renders the Intl-formatted value in the input', () => {
    const { container } = render(() => (
      <DateTimePicker
        aria-label="Pick a moment"
        value="2026-10-14T09:30"
        format={{
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }}
      />
    ))

    const input = container.querySelector(
      '[data-slot="date-time-picker-input"]',
    ) as HTMLInputElement
    expect(input.value).toContain('October 14, 2026')
    expect(input.value).toContain('09:30')
  })

  it('selects a time with real pointer events', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <DateTimePicker
        aria-label="Pick a moment"
        defaultValue="2026-10-14T09:30"
        onValueChange={onValueChange}
      />
    ))

    await userEvent.click(
      document.querySelector(
        'button[aria-label="Choose date and time"]',
      ) as HTMLElement,
    )
    await userEvent.click(
      document.querySelector(
        '[data-slot="date-time-picker-time-option"][data-value="10:00"]',
      ) as HTMLElement,
    )

    await waitFor(() =>
      expect(onValueChange).toHaveBeenCalledWith('2026-10-14T10:00'),
    )
  })
})
