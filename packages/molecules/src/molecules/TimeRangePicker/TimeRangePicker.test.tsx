import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TimeRangePicker } from './TimeRangePicker'

const startInput = () =>
  screen.getByRole('combobox', { name: 'Start time' }) as HTMLInputElement
const endInput = () =>
  screen.getByRole('combobox', { name: 'End time' }) as HTMLInputElement

/**
 * The popover-to-popover flow (pick start, pick end, see the pair) is covered
 * by the browser tier, where real click timing makes the adjacent Zag
 * popovers deterministic. Here: the render and state contracts.
 */
describe('TimeRangePicker', () => {
  it('renders two named time fields under one range label', () => {
    render(() => <TimeRangePicker label="Shift" />)
    expect(screen.getByText('Shift')).toBeTruthy()
    expect(startInput()).toBeTruthy()
    expect(endInput()).toBeTruthy()
  })

  it('shows the controlled pair', () => {
    render(() => <TimeRangePicker label="Shift" value={['22:00', '06:00']} />)
    expect(startInput().value).toBe('22:00')
    expect(endInput().value).toBe('06:00')
  })

  it('holds a half-open range until the end exists', async () => {
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
    // Only the start is picked: nothing is reported yet, and it stays shown.
    expect(onValueChange).not.toHaveBeenCalled()
    expect(startInput().value).toBe('09:00')
    expect(endInput().value).toBe('')
  })

  it('disables both fields together', () => {
    render(() => <TimeRangePicker label="Shift" disabled />)
    expect(startInput().disabled).toBe(true)
    expect(endInput().disabled).toBe(true)
  })
})
