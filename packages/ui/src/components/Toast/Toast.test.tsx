import { render, screen } from '@solidjs/testing-library'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createToaster, Toaster, ToastRegion, toast, toaster } from './Toast'

// Long duration so the assertions see the toast before it auto-dismisses.
const NEVER = { duration: 60_000 }

afterEach(() => toaster.remove())

describe('Toast', () => {
  it('renders a toast with its content and a labelled dismiss control', async () => {
    const toaster = createToaster(NEVER)
    render(() => <ToastRegion toaster={toaster} />)

    toaster.success({ title: 'Saved', description: 'All changes stored' })

    const item = await screen.findByRole('status')
    expect(item.textContent).toContain('Saved')
    expect(item.textContent).toContain('All changes stored')
    expect(item.getAttribute('data-type')).toBe('success')

    const close = screen.getByRole('button', { name: 'Dismiss' })
    expect(close.getAttribute('data-part')).toBe('close-trigger')

    // Dismissal drives Zag's exit presence, which needs `animationend` to
    // complete — a real browser proves it, jsdom cannot. Covered by the
    // browser-mode project, not here.
  })

  it('tags errors with data-type=error inside a live region', async () => {
    const toaster = createToaster(NEVER)
    render(() => <ToastRegion toaster={toaster} />)

    toaster.error({ title: 'Failed' })

    const item = await screen.findByRole('status')
    expect(item.getAttribute('data-type')).toBe('error')
    // The region (not each toast) carries the live-region semantics.
    expect(screen.getByRole('region').getAttribute('aria-live')).toBe('polite')
  })
})

describe('toast helpers', () => {
  it('message renders a neutral toast without a type icon', async () => {
    render(() => <Toaster />)
    toast.message({ title: 'Heads up', duration: 60_000 })

    const item = await screen.findByRole('status')
    expect(item.getAttribute('data-type')).toBe('message')
    expect(item.textContent).toContain('Heads up')
    expect(item.querySelector('.lucide-info')).toBeNull()
  })

  it('custom renders the provided body', async () => {
    render(() => <Toaster />)
    toast.custom(() => <span>Custom body</span>, { duration: 60_000 })

    const item = await screen.findByRole('status')
    expect(item.getAttribute('data-type')).toBe('custom')
    expect(item.textContent).toContain('Custom body')
  })

  it('promise moves from loading to success', async () => {
    render(() => <Toaster />)
    let resolve!: (value: string) => void
    const pending = new Promise<string>((r) => {
      resolve = r
    })
    toast.promise(pending, {
      loading: { title: 'Saving…' },
      success: { title: 'Saved' },
    })

    const loading = await screen.findByRole('status')
    expect(loading.getAttribute('data-type')).toBe('loading')
    expect(loading.textContent).toContain('Saving…')

    resolve('ok')
    await vi.waitFor(() => {
      expect(screen.getByRole('status').getAttribute('data-type')).toBe(
        'success',
      )
    })
  })
})
