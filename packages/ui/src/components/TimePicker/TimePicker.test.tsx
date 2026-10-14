import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TimePicker } from './TimePicker'

function inputOf(): HTMLInputElement {
  return screen.getByRole('combobox') as HTMLInputElement
}

describe('TimePicker', () => {
  it('renders a combobox input', () => {
    render(() => <TimePicker label="Time" />)
    expect(inputOf().getAttribute('role')).toBe('combobox')
    expect(inputOf().getAttribute('aria-expanded')).toBe('false')
  })

  it('shows a controlled value', () => {
    render(() => <TimePicker label="Time" value="09:30" />)
    expect(inputOf().value).toBe('09:30')
  })

  it('opens on click and lists interval-spaced options', async () => {
    render(() => <TimePicker label="Time" interval={60} />)
    await userEvent.click(inputOf())
    expect(await screen.findByRole('option', { name: '09:00' })).toBeTruthy()
    expect(screen.getAllByRole('option')).toHaveLength(24)
    expect(inputOf().getAttribute('aria-expanded')).toBe('true')
  })

  it('selects a time through onValueChange', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <TimePicker label="Time" interval={60} onValueChange={onValueChange} />
    ))

    await userEvent.click(inputOf())
    await userEvent.click(await screen.findByRole('option', { name: '09:00' }))

    expect(onValueChange).toHaveBeenCalledWith('09:00')
    expect(inputOf().value).toBe('09:00')
    expect(inputOf().getAttribute('aria-expanded')).toBe('false')
  })

  it('commits a keyboard selection', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <TimePicker label="Time" interval={60} onValueChange={onValueChange} />
    ))

    await userEvent.click(inputOf())
    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('00:00')
  })

  it('parses a typed time on Enter', async () => {
    const onValueChange = vi.fn()
    render(() => <TimePicker label="Time" onValueChange={onValueChange} />)

    await userEvent.type(inputOf(), '9:30')
    await userEvent.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('09:30')
  })

  it('blocks options outside min and max', async () => {
    render(() => (
      <TimePicker label="Time" interval={60} min="09:00" max="11:00" />
    ))
    await userEvent.click(inputOf())
    expect(screen.getAllByRole('option')).toHaveLength(3)
    expect(screen.queryByRole('option', { name: '08:00' })).toBeNull()
  })

  it('keeps the list open when keepOpen is set', async () => {
    render(() => <TimePicker label="Time" interval={60} keepOpen />)
    await userEvent.click(inputOf())
    await userEvent.click(await screen.findByRole('option', { name: '09:00' }))
    expect(inputOf().getAttribute('aria-expanded')).toBe('true')
  })

  it('wires the shared labelling contract', () => {
    render(() => (
      <TimePicker
        label="Time"
        description="When it happens"
        error="Pick a time"
        required
      />
    ))
    const input = inputOf()
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')?.split(' ').length).toBe(2)
    expect(
      document.querySelector(`label[for="${input.id}"]`)?.textContent,
    ).toContain('Time')
  })

  it('names a bare input from aria-label', () => {
    render(() => <TimePicker aria-label="Start time" />)
    expect(inputOf().getAttribute('aria-label')).toBe('Start time')
  })

  it('does not open when disabled', async () => {
    render(() => <TimePicker label="Time" disabled />)
    await userEvent.click(inputOf())
    expect(screen.queryByRole('option')).toBeNull()
  })
})
