import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DataState } from './DataState'

describe('DataState', () => {
  it('renders ready children unchanged', () => {
    render(() => (
      <DataState status="ready">
        <p>Rows</p>
      </DataState>
    ))
    expect(screen.getByText('Rows')).toBeTruthy()
  })

  it('announces loading and renders the requested skeleton', () => {
    const { container } = render(() => (
      <DataState status="loading" skeleton="cards" />
    ))
    expect(screen.getByRole('status', { name: 'Loading' })).toBeTruthy()
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBe(4)
  })

  it('renders an empty state action', () => {
    render(() => (
      <DataState
        status="empty"
        title="No expenses"
        action={<button type="button">Clear filters</button>}
      />
    ))
    expect(screen.getByText('No expenses')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeTruthy()
  })

  it('offers retry on error', async () => {
    const onRetry = vi.fn()
    render(() => (
      <DataState status="error" error="The request failed" onRetry={onRetry} />
    ))
    expect(screen.getByRole('alert')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalled()
  })
})
