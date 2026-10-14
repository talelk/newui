import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { TimePicker } from './TimePicker'

describe('TimePicker (browser, real CSS)', () => {
  it('keeps a non-zero anchor and paints the opened listbox', () => {
    const { container } = render(() => (
      <TimePicker defaultOpen aria-label="Time" />
    ))
    const anchor = container.querySelector(
      '[data-slot="time-picker-anchor"]',
    ) as HTMLElement
    expect(anchor.getBoundingClientRect().height).toBeGreaterThanOrEqual(24)

    const listbox = document.querySelector(
      '[data-slot="time-picker-listbox"]',
    ) as HTMLElement
    expect(listbox).not.toBeNull()
    expect(getComputedStyle(listbox).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )

    const option = document.querySelector(
      '[data-slot="time-picker-option"]',
    ) as HTMLElement
    expect(option.getBoundingClientRect().height).toBeGreaterThan(0)
  })
})
