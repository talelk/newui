import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SelectionBar } from './SelectionBar'

describe('SelectionBar', () => {
  it('renders nothing without a selection', () => {
    const { container } = render(() => <SelectionBar count={0} />)
    expect(container.querySelector('[data-slot="selection-bar"]')).toBeNull()
  })

  it('shows the count, action and clear control', async () => {
    const onAction = vi.fn()
    const onClear = vi.fn()
    render(() => (
      <SelectionBar
        count={3}
        summary="$14,650"
        primary={{ label: 'Approve expenses', onClick: onAction }}
        onClear={onClear}
      />
    ))
    expect(
      screen.getByRole('region', { name: 'Selection actions' }),
    ).toBeTruthy()
    expect(screen.getByText('3 selected')).toBeTruthy()
    expect(screen.getByText('$14,650')).toBeTruthy()
    await userEvent.click(
      screen.getByRole('button', { name: 'Approve expenses' }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onAction).toHaveBeenCalled()
    expect(onClear).toHaveBeenCalled()
  })
})
