import { render, screen, waitFor } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DateRangePicker } from './DateRangePicker'

function inputsOf(): HTMLInputElement[] {
  return screen.getAllByRole('textbox') as HTMLInputElement[]
}

/** A day cell trigger for an exact ISO date. */
function day(iso: string): HTMLElement {
  return document.querySelector(
    `[data-slot="date-range-picker-content"] button[data-value="${iso}"]`,
  ) as HTMLElement
}

describe('DateRangePicker', () => {
  it('shows the formatted controlled range', () => {
    render(() => (
      <DateRangePicker label="Range" value={['2026-10-14', '2026-10-16']} />
    ))
    const [from, to] = inputsOf()
    expect(from?.value).toContain('2026')
    expect(to?.value).toContain('2026')
  })

  it('opens the calendar from the trigger button', async () => {
    render(() => <DateRangePicker label="Range" />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Choose date range' }),
    )
    expect(await screen.findByRole('grid')).toBeTruthy()
  })

  it('selects a range through onValueChange', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <DateRangePicker
        label="Range"
        min="2026-10-01"
        max="2026-10-31"
        onValueChange={onValueChange}
      />
    ))

    await userEvent.click(
      screen.getByRole('button', { name: 'Choose date range' }),
    )
    day('2026-10-14').click()
    day('2026-10-16').click()

    await waitFor(() =>
      expect(onValueChange).toHaveBeenCalledWith(['2026-10-14', '2026-10-16']),
    )
  })

  it('renders two months when dualPane is set', async () => {
    render(() => <DateRangePicker label="Range" dualPane />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Choose date range' }),
    )
    expect(await screen.findAllByRole('grid')).toHaveLength(2)
  })

  it('blocks dates outside min and max', async () => {
    render(() => (
      <DateRangePicker label="Range" min="2026-10-10" max="2026-10-20" />
    ))
    await userEvent.click(
      screen.getByRole('button', { name: 'Choose date range' }),
    )
    expect(day('2026-10-05').getAttribute('data-disabled')).toBe('')
    expect(day('2026-10-15').getAttribute('data-disabled')).toBeNull()
  })

  it('clears the value when clearable', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <DateRangePicker
        label="Range"
        value={['2026-10-14', '2026-10-16']}
        clearable
        onValueChange={onValueChange}
      />
    ))

    await userEvent.click(
      screen.getByRole('button', { name: 'Clear date range' }),
    )
    expect(onValueChange).toHaveBeenCalledWith([])
  })

  it('wires the shared labelling contract', () => {
    render(() => (
      <DateRangePicker
        label="Range"
        description="Pick a span"
        error="Required"
        required
      />
    ))
    const [from] = inputsOf()
    expect(from?.getAttribute('aria-invalid')).toBe('true')
    expect(from?.getAttribute('aria-describedby')?.split(' ').length).toBe(2)
    expect(
      document.querySelector(`label[for="${from?.id}"]`)?.textContent,
    ).toContain('Range')
  })

  it('formats the displayed range with Intl options', () => {
    render(() => (
      <DateRangePicker
        label="Range"
        value={['2026-10-14', '2026-10-16']}
        format={{ year: 'numeric', month: 'long', day: 'numeric' }}
      />
    ))
    const [from, to] = inputsOf()
    expect(from?.value).toBe('October 14, 2026')
    expect(to?.value).toBe('October 16, 2026')
  })

  it('blocks typing when typeable is false', () => {
    render(() => <DateRangePicker label="Range" typeable={false} />)
    for (const input of inputsOf()) expect(input.readOnly).toBe(true)
  })

  it('keeps the calendar open after a pick when keepOpen', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <DateRangePicker
        label="Range"
        min="2026-10-01"
        max="2026-10-31"
        keepOpen
        onValueChange={onValueChange}
      />
    ))
    await userEvent.click(
      screen.getByRole('button', { name: 'Choose date range' }),
    )
    day('2026-10-14').click()
    day('2026-10-16').click()
    await waitFor(() =>
      expect(onValueChange).toHaveBeenCalledWith(['2026-10-14', '2026-10-16']),
    )
    expect(screen.queryByRole('grid')).not.toBeNull()
  })

  it('positions the popover from side and align', async () => {
    render(() => (
      <DateRangePicker
        label="Range"
        defaultOpen
        side="top"
        align="end"
        offset={8}
      />
    ))
    const content = await screen.findByRole('application')
    expect(content.getAttribute('data-placement')).toBe('top-end')
  })
})
