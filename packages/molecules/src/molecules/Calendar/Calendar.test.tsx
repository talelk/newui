import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Calendar } from './Calendar'

/** Day cells carry the ISO date at the end of their machine id. */
const dayCell = (container: HTMLElement, iso: string) =>
  container.querySelector<HTMLButtonElement>(
    `button[data-part="table-cell-trigger"][id$=":${iso}"]`,
  )

const dayCells = (container: HTMLElement) =>
  container.querySelectorAll<HTMLButtonElement>(
    'button[data-part="table-cell-trigger"]',
  )

describe('Calendar', () => {
  it('renders a day grid with a selected default', () => {
    const { container } = render(() => (
      <Calendar aria-label="Booking date" defaultValue="2026-10-26" />
    ))
    expect(container.querySelector('[data-slot="calendar"]')).toBeTruthy()
    expect(dayCells(container).length).toBeGreaterThanOrEqual(28)
    expect(
      dayCell(container, '2026-10-26')?.getAttribute('data-selected'),
    ).not.toBeNull()
  })

  it('selects a day and reports it as an ISO string', async () => {
    const onValueChange = vi.fn()
    const { container } = render(() => (
      <Calendar
        aria-label="Booking date"
        defaultValue="2026-10-26"
        onValueChange={onValueChange}
      />
    ))
    await userEvent.click(dayCell(container, '2026-10-14') as HTMLButtonElement)
    expect(onValueChange).toHaveBeenCalledWith('2026-10-14')
    expect(
      dayCell(container, '2026-10-14')?.getAttribute('data-selected'),
    ).not.toBeNull()
  })

  it('steps months with the navigation buttons', async () => {
    render(() => (
      <Calendar aria-label="Booking date" defaultValue="2026-10-26" />
    ))
    expect(screen.getByText(/October 2026/)).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Next month' }))
    expect(screen.getByText(/November 2026/)).toBeTruthy()
  })

  it('honours min and max bounds', () => {
    const { container } = render(() => (
      <Calendar
        aria-label="Scoped"
        defaultValue="2026-10-26"
        min="2026-10-20"
        max="2026-10-28"
      />
    ))
    // Days outside the window are unavailable, not removed.
    const unavailable = container.querySelectorAll(
      'button[data-part="table-cell-trigger"][data-unavailable]',
    )
    expect(unavailable.length).toBeGreaterThan(0)
  })

  it('renders two months with `dualPane`', () => {
    const { container } = render(() => (
      <Calendar aria-label="Period" defaultValue="2026-10-26" dualPane />
    ))
    expect(dayCells(container).length).toBeGreaterThanOrEqual(56)
  })

  it('disables interaction', () => {
    const { container } = render(() => (
      <Calendar aria-label="Booking date" defaultValue="2026-10-26" disabled />
    ))
    expect(
      container
        .querySelector('[data-slot="calendar"]')
        ?.getAttribute('data-disabled'),
    ).toBe('')
    // Zag marks cells rather than removing them: the attribute, not
    // `disabled`, is the machine's contract.
    expect(dayCells(container)[0]?.getAttribute('data-disabled')).not.toBeNull()
  })
})
