import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BottomSheet } from './BottomSheet'

describe('BottomSheet', () => {
  it('renders nothing when closed', () => {
    render(() => <BottomSheet title="Filters">Body</BottomSheet>)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders an open sheet with its title and body', () => {
    render(() => (
      <BottomSheet open title="Filters">
        Sheet body
      </BottomSheet>
    ))
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('Filters')).toBeTruthy()
    expect(screen.getByText('Sheet body')).toBeTruthy()
  })

  it('closes on Escape when dismissible', async () => {
    const onOpenChange = vi.fn()
    render(() => (
      <BottomSheet open title="Filters" onOpenChange={onOpenChange}>
        Body
      </BottomSheet>
    ))
    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('does not close on Escape when not dismissible', async () => {
    const onOpenChange = vi.fn()
    render(() => (
      <BottomSheet open dismissible={false} onOpenChange={onOpenChange}>
        Body
      </BottomSheet>
    ))
    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('falls back to an aria-label when there is no title', () => {
    render(() => <BottomSheet open>Body</BottomSheet>)
    expect(screen.getByRole('dialog').getAttribute('aria-label')).toBe(
      'Bottom sheet',
    )
  })
})
