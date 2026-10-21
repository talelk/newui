import { render, screen } from '@solidjs/testing-library'
import { afterEach, describe, expect, it } from 'vitest'
import { createToaster, Toaster, ToastRegion, toast, toaster } from './Toast'

// Long duration so the assertions see the toasts before they auto-dismiss.
const NEVER = { duration: 60_000 }

afterEach(() => toaster.remove())

describe('Toast (browser, real CSS)', () => {
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
