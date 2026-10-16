import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { createSignal } from 'solid-js'
import { describe, expect, it } from 'vitest'
import {
  ResponsiveShell,
  ResponsiveShellMenu,
  useResponsiveShell,
} from './ResponsiveShell'

/**
 * The frame is chosen by a media query, and jsdom's `matchMedia` is a stub that
 * always answers `false` (see `vitest.setup.ts`) — so these tests drive the
 * query directly. That is the honest place to test a breakpoint from: the
 * component's job is "which frame, and does the drawer behave", not "did the
 * browser report the viewport".
 */
function media(matches: boolean) {
  window.matchMedia = ((query: string) => {
    const listeners = new Set<() => void>()
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: (_: string, listener: () => void) =>
        listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) =>
        listeners.delete(listener),
      addListener: (listener: () => void) => listeners.add(listener),
      removeListener: (listener: () => void) => listeners.delete(listener),
      dispatchEvent: () => false,
    }
  }) as unknown as typeof window.matchMedia
}

const sidebar = () => <p>Sidebar body</p>

describe('ResponsiveShell', () => {
  it('docks the rail and sidebar when there is room', () => {
    media(true)
    render(() => (
      <ResponsiveShell
        rail={<p>Rail</p>}
        sidebar={sidebar()}
        header={<h1>Header</h1>}
        mobileNav={<nav aria-label="Tabs">Tabs</nav>}
      >
        <p>Content</p>
      </ResponsiveShell>
    ))

    expect(screen.getByText('Rail')).toBeVisible()
    expect(screen.getByText('Sidebar body')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Header' })).toBeVisible()
    // One navigation, both frames: on a wide window the phone's chrome is not
    // rendered at all, and neither is the drawer.
    expect(screen.queryByText('Tabs')).toBeNull()
    expect(
      document.querySelector('[data-slot="responsive-shell-drawer"]'),
    ).toBeNull()
  })

  it('becomes a header, a scroller and a bottom nav when there is not', () => {
    media(false)
    render(() => (
      <ResponsiveShell
        rail={<p>Rail</p>}
        sidebar={sidebar()}
        title="Deals"
        mobileNav={<nav aria-label="Tabs">Tabs</nav>}
      >
        <p>Content</p>
      </ResponsiveShell>
    ))

    expect(screen.getByRole('heading', { name: 'Deals' })).toBeVisible()
    expect(screen.getByText('Tabs')).toBeVisible()
    expect(screen.getByText('Content')).toBeVisible()
    // The sidebar lives in the drawer, which is closed: only its trigger shows.
    expect(
      screen.getByRole('button', { name: 'Open navigation' }),
    ).toBeVisible()
  })

  it('opens the drawer, and puts focus back when it closes', async () => {
    media(false)
    render(() => (
      <ResponsiveShell sidebar={sidebar()} title="Deals">
        <p>Content</p>
      </ResponsiveShell>
    ))

    const trigger = screen.getByRole('button', { name: 'Open navigation' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    await userEvent.click(trigger)
    const drawer = document.querySelector<HTMLDialogElement>(
      '[data-slot="responsive-shell-drawer"]',
    )
    expect(drawer?.textContent).toContain('Sidebar body')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    // Closing — Escape, a backdrop click, anything the browser does — restores
    // focus, which is the part a hand-rolled drawer always forgets.
    drawer?.dispatchEvent(new Event('close'))
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
  })

  it('closes the drawer on whatever you press in it', async () => {
    media(false)
    function Filters() {
      const [scope, setScope] = createSignal('all')
      return (
        <div>
          <button type="button" onClick={() => setScope('mine')}>
            My tasks
          </button>
          <button
            type="button"
            data-keep-drawer
            onClick={() => setScope('all')}
          >
            Show everything
          </button>
          <span>{scope()}</span>
        </div>
      )
    }

    render(() => (
      <ResponsiveShell sidebar={<Filters />} title="Tasks">
        <p>Content</p>
      </ResponsiveShell>
    ))

    const opened = () =>
      document
        .querySelector('[data-slot="responsive-shell-drawer"]')
        ?.hasAttribute('open')

    await userEvent.click(
      screen.getByRole('button', { name: 'Open navigation' }),
    )
    // A filter under the drawer updates the page behind it, so the drawer moves.
    await userEvent.click(screen.getByRole('button', { name: 'My tasks' }))
    expect(opened()).toBe(false)

    // Unless it says otherwise: a control that acts *within* the drawer stays.
    await userEvent.click(
      screen.getByRole('button', { name: 'Open navigation' }),
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Show everything' }),
    )
    expect(opened()).toBe(true)
  })

  it('closes the drawer when something in it navigates', async () => {
    media(false)
    render(() => (
      <ResponsiveShell
        sidebar={
          <nav>
            <a href="/deals">Deals</a>
          </nav>
        }
        title="Deals"
      >
        <p>Content</p>
      </ResponsiveShell>
    ))

    await userEvent.click(
      screen.getByRole('button', { name: 'Open navigation' }),
    )
    await userEvent.click(screen.getByRole('link', { name: 'Deals' }))
    expect(
      document
        .querySelector('[data-slot="responsive-shell-drawer"]')
        ?.hasAttribute('open'),
    ).toBe(false)
  })

  it('lets a header place the trigger itself', () => {
    media(false)
    render(() => (
      <ResponsiveShell
        sidebar={sidebar()}
        mobileHeader={
          <header>
            <ResponsiveShellMenu label="Open the menu" />
            <h1>Inbox</h1>
          </header>
        }
      >
        <p>Content</p>
      </ResponsiveShell>
    ))

    expect(screen.getByRole('button', { name: 'Open the menu' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Open navigation' })).toBeNull()
  })

  it('renders no menu button at all while the sidebar is docked', () => {
    media(true)
    render(() => (
      <ResponsiveShell
        sidebar={sidebar()}
        mobileHeader={<ResponsiveShellMenu />}
      >
        <p>Content</p>
      </ResponsiveShell>
    ))

    // A hamburger beside a visible sidebar is a control that does nothing.
    expect(screen.queryByRole('button', { name: 'Open navigation' })).toBeNull()
  })

  it('exposes its state, so any control can open the drawer', async () => {
    media(false)
    function Filters() {
      const { compact, showDrawer } = useResponsiveShell()
      return (
        <button type="button" onClick={() => showDrawer()}>
          {compact() ? 'Filters (drawer)' : 'Filters (inline)'}
        </button>
      )
    }

    render(() => (
      <ResponsiveShell sidebar={sidebar()} title="Deals">
        <Filters />
      </ResponsiveShell>
    ))

    await userEvent.click(
      screen.getByRole('button', { name: 'Filters (drawer)' }),
    )
    expect(
      document
        .querySelector('[data-slot="responsive-shell-drawer"]')
        ?.hasAttribute('open'),
    ).toBe(true)
  })
})
