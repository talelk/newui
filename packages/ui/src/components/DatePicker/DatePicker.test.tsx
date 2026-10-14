import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DatePicker } from './DatePicker'

function inputOf(): HTMLInputElement {
  return screen.getByRole('textbox') as HTMLInputElement
}

describe('DatePicker', () => {
  it('shows the formatted controlled value', () => {
    render(() => <DatePicker label="Date" value="2026-10-14" />)
    expect(inputOf().value).toContain('2026')
  })

  it('opens the calendar from the trigger button', async () => {
    render(() => <DatePicker label="Date" value="2026-10-14" />)
    await userEvent.click(screen.getByRole('button', { name: 'Choose date' }))
    // The day grid is a role="grid" table with the selected day marked.
    expect(await screen.findByRole('grid')).toBeTruthy()
    expect(screen.getByText('14')).toBeTruthy()
  })

  it('selects a day through onValueChange', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <DatePicker
        label="Date"
        value="2026-10-14"
        onValueChange={onValueChange}
      />
    ))

    await userEvent.click(inputOf())
    await userEvent.click(await screen.findByText('15'))
    expect(onValueChange).toHaveBeenCalledWith('2026-10-15')
  })

  it('drills from day to month to year views', async () => {
    render(() => <DatePicker label="Date" value="2026-10-14" />)
    await userEvent.click(inputOf())

    // Day view's heading is the visible month; clicking it opens the month grid.
    await userEvent.click(
      await screen.findByRole('button', { name: 'Switch to month view' }),
    )
    expect(screen.getByText('Jan')).toBeTruthy()

    // The month heading drills into the decade.
    await userEvent.click(
      screen.getByRole('button', { name: 'Switch to year view' }),
    )
    expect(screen.getByText('2020 – 2029')).toBeTruthy()
  })

  it('blocks dates outside min and max', async () => {
    render(() => (
      <DatePicker
        label="Date"
        value="2026-10-14"
        min="2026-10-10"
        max="2026-10-20"
      />
    ))
    await userEvent.click(inputOf())

    expect(
      (await screen.findByText('5'))
        .closest('button')
        ?.getAttribute('data-disabled'),
    ).toBe('')
  })

  it('clears the value when clearable', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <DatePicker
        label="Date"
        value="2026-10-14"
        clearable
        onValueChange={onValueChange}
      />
    ))

    await userEvent.click(screen.getByRole('button', { name: 'Clear date' }))
    expect(onValueChange).toHaveBeenCalledWith(null)
  })

  it('wires the shared labelling contract', () => {
    render(() => (
      <DatePicker
        label="Date"
        description="Pick a day"
        error="Required"
        required
      />
    ))
    const input = inputOf()
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')?.split(' ').length).toBe(2)
    expect(
      document.querySelector(`label[for="${input.id}"]`)?.textContent,
    ).toContain('Date')
  })

  it('formats the displayed value with Intl options', () => {
    render(() => (
      <DatePicker
        label="Date"
        value="2026-10-14"
        format={{ year: 'numeric', month: 'long', day: 'numeric' }}
      />
    ))
    expect(inputOf().value).toBe('October 14, 2026')
  })

  it('blocks typing when typeable is false', () => {
    render(() => (
      <DatePicker label="Date" value="2026-10-14" typeable={false} />
    ))
    expect(inputOf().readOnly).toBe(true)
  })

  it('keeps the calendar open after a pick when keepOpen', async () => {
    render(() => <DatePicker label="Date" value="2026-10-14" keepOpen />)
    await userEvent.click(inputOf())
    await userEvent.click(await screen.findByText('15'))
    expect(screen.queryByRole('grid')).not.toBeNull()
  })

  it('positions the popover from side and align', async () => {
    render(() => (
      <DatePicker
        label="Date"
        value="2026-10-14"
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
