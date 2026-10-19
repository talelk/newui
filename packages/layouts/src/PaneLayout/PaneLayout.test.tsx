import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PaneLayout } from './PaneLayout'

function panes(props: Partial<Parameters<typeof PaneLayout>[0]> = {}) {
  return render(() => (
    <PaneLayout start={<p>Conversations</p>} end={<p>Message</p>} {...props} />
  ))
}

const handle = () =>
  screen.getByRole('separator', { name: 'Resize panes' }) as HTMLElement

describe('PaneLayout', () => {
  it('renders both panes and an adjustable separator', () => {
    panes({ startSize: 40 })
    expect(screen.getByText('Conversations')).toBeTruthy()
    expect(screen.getByText('Message')).toBeTruthy()
    expect(handle().getAttribute('aria-orientation')).toBe('vertical')
    expect(handle().getAttribute('aria-valuenow')).toBe('40')
    expect(handle().getAttribute('aria-valuemin')).toBe('20')
    expect(handle().getAttribute('aria-valuemax')).toBe('70')
  })

  it('moves with the keyboard, and jumps to the bounds', async () => {
    panes({ startSize: 40 })
    handle().focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(handle().getAttribute('aria-valuenow')).toBe('42')
    await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}')
    expect(handle().getAttribute('aria-valuenow')).toBe('32')
    await userEvent.keyboard('{Home}')
    expect(handle().getAttribute('aria-valuenow')).toBe('20')
    await userEvent.keyboard('{End}')
    expect(handle().getAttribute('aria-valuenow')).toBe('70')
  })

  it('clamps the split to the minimum and maximum', async () => {
    panes({ startSize: 40, minStartSize: 45, maxStartSize: 55 })
    handle().focus()
    await userEvent.keyboard('{Home}')
    expect(handle().getAttribute('aria-valuenow')).toBe('45')
    await userEvent.keyboard('{End}')
    expect(handle().getAttribute('aria-valuenow')).toBe('55')
  })

  it('returns to the default split on double-click', async () => {
    panes({ startSize: 40 })
    handle().focus()
    await userEvent.keyboard('{End}')
    expect(handle().getAttribute('aria-valuenow')).toBe('70')
    await userEvent.dblClick(handle())
    expect(handle().getAttribute('aria-valuenow')).toBe('40')
  })

  it('shows one pane on a compact viewport, by `active`', () => {
    const { unmount } = panes()
    // Default: the list stays, the record is hidden until one is chosen.
    expect(screen.getByText('Message').parentElement?.className).toContain(
      'max-lg:hidden',
    )
    unmount()

    panes({ active: 'end' })
    expect(
      screen.getByText('Conversations').parentElement?.className,
    ).toContain('max-lg:hidden')
    expect(screen.getByText('Message').parentElement?.className).not.toContain(
      'max-lg:hidden',
    )
  })

  it('can be a fixed split with no control in the tab order', () => {
    panes({ resizable: false, startSize: 30 })
    expect(screen.queryByRole('separator')).toBeNull()
    expect(screen.getByText('Conversations')).toBeTruthy()
    expect(screen.getByText('Message')).toBeTruthy()
  })
})
