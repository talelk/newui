import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createToaster, Toaster, ToastRegion, toast, toaster } from './Toast'

// Long duration so the assertions see the toasts before they auto-dismiss.
const NEVER = { duration: 60_000 }

afterEach(() => toaster.remove())

describe('Toast (browser, real CSS)', () => {
  it('dismisses through the close trigger', async () => {
    const toaster = createToaster(NEVER)
    render(() => <ToastRegion toaster={toaster} />)

    toaster.success({ title: 'Saved' })
    const close = await screen.findByRole('button', { name: 'Dismiss' })
    await userEvent.click(close)
    await waitForElementToBeRemoved(() => screen.queryByRole('status'), {
      timeout: 2_000,
    })
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('keeps one DOM node per toast when the store re-syncs records', async () => {
    // The store hands back fresh record objects on every sync. Keying the
    // items by anything other than the toast id remounts the item's machine
    // on each sync — and a pointerdown→mouseup pair straddling that
    // replacement never fires its click (the bug this file guards).
    const toaster = createToaster(NEVER)
    render(() => <ToastRegion toaster={toaster} />)

    toaster.success({ id: 'stable', title: 'First words' })
    const node = await screen.findByRole('status')
    toaster.success({ id: 'stable', title: 'Updated words' })
    await screen.findByText('Updated words')
    expect(screen.getByRole('status')).toBe(node)
  })

  it('lifts earlier toasts when a second one mounts', async () => {
    const toaster = createToaster(NEVER)
    render(() => <ToastRegion toaster={toaster} />)

    toaster.success({ title: 'First' })
    toaster.error({ title: 'Second' })
    await screen.findAllByRole('status')
    // The lift rides the group's measured heights, which settle a frame after
    // the second toast mounts.
    await vi.waitFor(() => {
      const tops = screen
        .getAllByRole('status')
        .map((toast) => toast.getBoundingClientRect().top)
      expect(new Set(tops).size).toBe(2)
    })
  })

  it('paints a dark bar and tints the icon per type', async () => {
    const toaster = createToaster(NEVER)
    render(() => <ToastRegion toaster={toaster} />)

    toaster.success({ title: 'Saved' })
    toaster.error({ title: 'Failed' })

    const toasts = await screen.findAllByRole('status')
    expect(toasts.length).toBe(2)
    const [success, error] = toasts as HTMLElement[]
    expect(getComputedStyle(success as HTMLElement).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )
    // frappe tints the icon, not a border: error gets `text-ink-red-4`.
    const successIcon = success?.querySelector(
      'span[aria-hidden="true"]',
    ) as HTMLElement
    const errorIcon = error?.querySelector(
      'span[aria-hidden="true"]',
    ) as HTMLElement
    expect(getComputedStyle(errorIcon).color).not.toBe(
      getComputedStyle(successIcon).color,
    )
  })

  it('paints a custom toast body on the dark shell', async () => {
    render(() => <Toaster />)
    toast.custom(() => <span class="font-medium">Custom body</span>, {
      duration: 60_000,
    })

    const item = await screen.findByRole('status')
    expect(item.textContent).toContain('Custom body')
    expect(getComputedStyle(item).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})
