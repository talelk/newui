import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TimeRangePicker } from './TimeRangePicker'

const startInput = () =>
  screen.getByRole('combobox', { name: 'Start time' }) as HTMLInputElement
const endInput = () =>
  screen.getByRole('combobox', { name: 'End time' }) as HTMLInputElement

describe('TimeRangePicker (browser, real clicks)', () => {
  it('completes the range across the two pickers', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <TimeRangePicker
        label="Shift"
        interval={60}
        onValueChange={onValueChange}
      />
    ))

    await userEvent.click(startInput())
    await userEvent.click(await screen.findByRole('option', { name: '09:00' }))
    // Half-open: the start is held, nothing is reported yet.
    expect(onValueChange).not.toHaveBeenCalled()

    await userEvent.click(endInput())
    await userEvent.click(await screen.findByRole('option', { name: '17:00' }))
    expect(onValueChange).toHaveBeenCalledWith(['09:00', '17:00'])
    expect(startInput().value).toBe('09:00')
    expect(endInput().value).toBe('17:00')
  })

  it('reports a night-shift range as-is', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <TimeRangePicker
        label="Shift"
        interval={60}
        onValueChange={onValueChange}
      />
    ))
    await userEvent.click(startInput())
    await userEvent.click(await screen.findByRole('option', { name: '22:00' }))
    await userEvent.click(endInput())
    await userEvent.click(await screen.findByRole('option', { name: '06:00' }))
    // Ends before it starts — reported, not reordered.
    expect(onValueChange).toHaveBeenCalledWith(['22:00', '06:00'])
  })
})
