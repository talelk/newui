import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { PaneLayout } from './PaneLayout'

function panes(props: Partial<Parameters<typeof PaneLayout>[0]> = {}) {
  return render(() => (
    <PaneLayout start={<p>Conversations</p>} end={<p>Message</p>} {...props} />
  ))
}

const handle = () =>
  screen.getByRole('separator', { name: 'Resize panes' }) as HTMLElement

const startPane = () =>
  screen.getByText('Conversations').parentElement as HTMLElement
const endPane = () => screen.getByText('Message').parentElement as HTMLElement

describe('PaneLayout', () => {
  it('renders both panes and an adjustable separator', () => {
    panes({ defaultSize: 40 })
    expect(screen.getByText('Conversations')).toBeTruthy()
    expect(screen.getByText('Message')).toBeTruthy()
    expect(handle().getAttribute('aria-orientation')).toBe('vertical')
    expect(handle().getAttribute('aria-valuenow')).toBe('40')
    expect(handle().getAttribute('aria-valuemin')).toBe('20')
    expect(handle().getAttribute('aria-valuemax')).toBe('70')
  })

  it('moves with the keyboard, and jumps to the bounds', async () => {
    panes({ defaultSize: 40 })
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
    panes({ defaultSize: 40, minStartSize: 45, maxStartSize: 55 })
    handle().focus()
    await userEvent.keyboard('{Home}')
    expect(handle().getAttribute('aria-valuenow')).toBe('45')
    await userEvent.keyboard('{End}')
    expect(handle().getAttribute('aria-valuenow')).toBe('55')
  })

  it('returns to the default split on double-click', async () => {
    panes({ defaultSize: 40 })
    handle().focus()
    await userEvent.keyboard('{End}')
    expect(handle().getAttribute('aria-valuenow')).toBe('70')
    await userEvent.dblClick(handle())
    expect(handle().getAttribute('aria-valuenow')).toBe('40')
  })

  it('shows one pane on a compact viewport, by `active`', () => {
    const { unmount } = panes()
    // Default: the list stays, the record is hidden until one is chosen.
    expect(endPane().className).toContain('max-lg:hidden')
    unmount()

    panes({ active: 'end' })
    expect(startPane().className).toContain('max-lg:hidden')
    expect(endPane().className).not.toContain('max-lg:hidden')
  })

  it('can be a fixed split with no control in the tab order', () => {
    panes({ resizable: false, defaultSize: 30 })
    expect(screen.queryByRole('separator')).toBeNull()
    expect(screen.getByText('Conversations')).toBeTruthy()
    expect(screen.getByText('Message')).toBeTruthy()
  })

  describe('size control', () => {
    it('starts at `defaultSize` and reports uncontrolled changes', async () => {
      const onSizeChange = vi.fn()
      panes({ defaultSize: 45, onSizeChange })
      expect(handle().getAttribute('aria-valuenow')).toBe('45')
      handle().focus()
      await userEvent.keyboard('{ArrowRight}')
      expect(handle().getAttribute('aria-valuenow')).toBe('47')
      expect(onSizeChange).toHaveBeenCalledWith(47)
    })

    it('keeps `startSize` working as the old default', () => {
      panes({ startSize: 45 })
      expect(handle().getAttribute('aria-valuenow')).toBe('45')
    })

    it('moves only when the app applies `size`', async () => {
      const onSizeChange = vi.fn()
      panes({ size: 40, onSizeChange })
      handle().focus()
      await userEvent.keyboard('{ArrowRight}')
      // The request is reported; the layout waits for the controlled value.
      expect(onSizeChange).toHaveBeenCalledWith(42)
      expect(handle().getAttribute('aria-valuenow')).toBe('40')
    })

    it('follows `size` when the app drives it', async () => {
      const [size, setSize] = createSignal(40)
      const onSizeChange = vi.fn((value: number) => setSize(value))
      render(() => (
        <PaneLayout
          start={<p>Conversations</p>}
          end={<p>Message</p>}
          size={size()}
          onSizeChange={onSizeChange}
        />
      ))
      handle().focus()
      await userEvent.keyboard('{End}')
      expect(onSizeChange).toHaveBeenCalledWith(70)
      // Solid is reactive: the app's signal moves the controlled layout.
      expect(handle().getAttribute('aria-valuenow')).toBe('70')
    })
  })

  describe('collapsing', () => {
    it('folds the start pane with Enter and unfolds it again', async () => {
      const onCollapseChange = vi.fn()
      panes({
        defaultSize: 40,
        collapsible: 'start',
        onCollapseChange,
      })
      handle().focus()
      await userEvent.keyboard('{Enter}')
      expect(startPane().classList.contains('hidden')).toBe(true)
      expect(handle().getAttribute('aria-valuenow')).toBe('0')
      expect(handle().getAttribute('aria-valuemin')).toBe('0')
      expect(onCollapseChange).toHaveBeenCalledWith('start')

      await userEvent.keyboard('{Enter}')
      expect(startPane().classList.contains('hidden')).toBe(false)
      expect(handle().getAttribute('aria-valuenow')).toBe('40')
      expect(onCollapseChange).toHaveBeenLastCalledWith('none')
    })

    it('folds the detail pane when that is the collapsible side', async () => {
      panes({ defaultSize: 40, collapsible: 'end' })
      handle().focus()
      await userEvent.keyboard('{Enter}')
      expect(endPane().classList.contains('hidden')).toBe(true)
      expect(handle().getAttribute('aria-valuenow')).toBe('100')
      expect(handle().getAttribute('aria-valuemax')).toBe('100')
    })

    it('marks the frame with `data-collapsed`', async () => {
      panes({ collapsible: 'both' })
      handle().focus()
      await userEvent.keyboard('{Enter}')
      const frame = handle().closest('[data-slot="pane-layout"]') as HTMLElement
      expect(frame.getAttribute('data-collapsed')).toBe('start')
    })

    it('unfolds from the keyboard and returns to the remembered size', async () => {
      panes({ defaultSize: 40, collapsible: 'start' })
      handle().focus()
      await userEvent.keyboard('{Enter}')
      expect(handle().getAttribute('aria-valuenow')).toBe('0')
      // Any key that needs a width unfolds first, from the remembered size.
      await userEvent.keyboard('{End}')
      expect(handle().getAttribute('aria-valuenow')).toBe('70')
      await userEvent.keyboard('{Enter}')
      expect(handle().getAttribute('aria-valuenow')).toBe('0')
      await userEvent.keyboard('{Enter}')
      expect(handle().getAttribute('aria-valuenow')).toBe('70')
    })

    it('is a controllable signal too', async () => {
      const onCollapseChange = vi.fn()
      panes({ collapsed: 'end', collapsible: 'end', onCollapseChange })
      expect(endPane().classList.contains('hidden')).toBe(true)
      handle().focus()
      await userEvent.keyboard('{Enter}')
      expect(onCollapseChange).toHaveBeenCalledWith('none')
      // Still folded until the app applies the new state.
      expect(endPane().classList.contains('hidden')).toBe(true)
    })

    it('renders a collapsed detail pane as the compact single-pane state', () => {
      panes({ collapsed: 'end', active: 'end' })
      // Below the breakpoint the list is shown, not hidden by `active`.
      expect(startPane().classList.contains('max-lg:hidden')).toBe(false)
      expect(endPane().classList.contains('hidden')).toBe(true)
    })
  })
})
