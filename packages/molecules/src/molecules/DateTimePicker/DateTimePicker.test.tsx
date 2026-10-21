import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DateTimePicker } from './DateTimePicker'

function inputOf(): HTMLInputElement {
  return screen.getByRole('textbox') as HTMLInputElement
}

function day(iso: string): HTMLElement {
  return document.querySelector(
    `[data-slot="date-time-picker-content"] button[data-value="${iso}"]`,
  ) as HTMLElement
}

function timeOption(value: string): HTMLElement {
  return document.querySelector(
    `[data-slot="date-time-picker-time-option"][data-value="${value}"]`,
  ) as HTMLElement
}

describe('DateTimePicker', () => {
  it('shows the formatted controlled value', () => {
    render(() => <DateTimePicker label="When" value="2026-10-14T09:30" />)
    expect(inputOf().value).toContain('2026')
    expect(inputOf().value).toContain('09:30')
  })

  it('opens the calendar from the trigger button', async () => {
    render(() => <DateTimePicker label="When" value="2026-10-14T09:30" />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Choose date and time' }),
    )
    expect(await screen.findByRole('grid')).toBeTruthy()
  })

  it('selects a date through onValueChange', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <DateTimePicker
        label="When"
        min="2026-10-01"
        max="2026-10-31"
        onValueChange={onValueChange}
      />
    ))

    await userEvent.click(
      screen.getByRole('button', { name: 'Choose date and time' }),
    )
    await userEvent.click(day('2026-10-14'))

    expect(onValueChange).toHaveBeenCalledWith('2026-10-14T00:00')
  })

  it('selects a time from the list', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <DateTimePicker
        label="When"
        defaultValue="2026-10-14T09:30"
        onValueChange={onValueChange}
      />
    ))

    await userEvent.click(
      screen.getByRole('button', { name: 'Choose date and time' }),
    )
    await userEvent.click(timeOption('10:00'))

    expect(onValueChange).toHaveBeenCalledWith('2026-10-14T10:00')
  })

  it('generates time options from interval', async () => {
    render(() => <DateTimePicker label="When" defaultOpen interval={60} />)
    expect(
      document.querySelectorAll('[data-slot="date-time-picker-time-option"]')
        .length,
    ).toBe(24)
  })

  it('blocks dates outside min and max', async () => {
    render(() => (
      <DateTimePicker label="When" min="2026-10-10" max="2026-10-20" />
    ))
    await userEvent.click(
      screen.getByRole('button', { name: 'Choose date and time' }),
    )
    expect(day('2026-10-05').getAttribute('data-disabled')).toBe('')
    expect(day('2026-10-15').getAttribute('data-disabled')).toBeNull()
  })

  it('clears the value when clearable', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <DateTimePicker
        label="When"
        value="2026-10-14T09:30"
        clearable
        onValueChange={onValueChange}
      />
    ))

    await userEvent.click(
      screen.getByRole('button', { name: 'Clear date and time' }),
    )
    expect(onValueChange).toHaveBeenCalledWith(null)
  })

  it('wires the shared labelling contract', () => {
    render(() => (
      <DateTimePicker
        label="When"
        description="Pick a moment"
        error="Required"
        required
      />
    ))
    const input = inputOf()
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')?.split(' ').length).toBe(2)
    expect(
      document.querySelector(`label[for="${input.id}"]`)?.textContent,
    ).toContain('When')
  })

  it('blocks typing when typeable is false', () => {
    render(() => (
      <DateTimePicker label="When" value="2026-10-14T09:30" typeable={false} />
    ))
    expect(inputOf().readOnly).toBe(true)
  })

  it('positions the popover from side and align', async () => {
    render(() => (
      <DateTimePicker
        label="When"
        defaultOpen
        side="top"
        align="end"
        offset={8}
      />
    ))
    const content = await screen.findByRole('application')
    expect(content.getAttribute('data-placement')).toBe('top-end')
  })

  it('does not open when disabled', async () => {
    render(() => <DateTimePicker label="When" disabled />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Choose date and time' }),
    )
    expect(screen.queryByRole('grid')).toBeNull()
  })
})
