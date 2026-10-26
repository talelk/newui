import { render, screen, waitFor } from '@solidjs/testing-library'
import { SidebarItem } from '@talelk/newui-organisms'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AppShell } from './AppShell'

/**
 * jsdom's matchMedia stub always answers `false`, which puts every shell in
 * the mobile layout. The desktop contract (one docked sidebar, fold) needs the
 * wide answer, so these tests stub the query for the duration of a render.
 */
function withDesktop(run: () => void | Promise<void>): Promise<void> {
  const original = window.matchMedia
  window.matchMedia = ((query: string) => ({
    matches: query.includes('min-width'),
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
  return Promise.resolve()
    .then(run)
    .finally(() => {
      window.matchMedia = original
    })
}

const NAVIGATION = [
  {
    label: 'Workspace',
    items: [
      { label: 'Projects', icon: 'lucide-folders', active: true },
      { label: 'People', icon: 'lucide-users' },
    ],
  },
  {
    label: 'Reports',
    items: [{ label: 'Revenue', icon: 'lucide-chart-no-axes-combined' }],
  },
]

function renderShell(overrides?: Partial<Parameters<typeof AppShell>[0]>) {
  return render(() => (
    <AppShell
      title="Projects"
      brand={<span>Acme</span>}
      brandCollapsed={<span>AC</span>}
      tenant={<button type="button">Acme · Production</button>}
      tenantCollapsed={
        <button type="button" aria-label="Choose tenant">
          AC
        </button>
      }
      navigation={NAVIGATION}
      settings={
        <SidebarItem label="Settings" icon="lucide-settings">
          Settings
        </SidebarItem>
      }
      account={
        <SidebarItem label="Rhea Kapoor" icon="lucide-user-round">
          Rhea Kapoor
        </SidebarItem>
      }
      {...overrides}
    >
      <p>Content</p>
    </AppShell>
  ))
}

describe('AppShell', () => {
  it('uses one sidebar model for the mobile drawer, including tenant and bottom actions', async () => {
    renderShell()

    expect(
      screen.getByRole('heading', { name: 'Projects', level: 1 }),
    ).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
    await userEvent.click(
      screen.getByRole('button', { name: 'Open application navigation' }),
    )
    const drawer = screen.getByRole('dialog', {
      name: 'Application navigation',
    })
    expect(drawer).toBeVisible()
    expect(screen.getByText('Acme')).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Acme · Production' }),
    ).toBeTruthy()
    expect(screen.getByText('Workspace')).toBeTruthy()
    expect(screen.getByText('Reports')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Settings' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Rhea Kapoor' })).toBeTruthy()
    expect(document.querySelector('[data-slot="sidebar-rail"]')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'People' }))
    await waitFor(() => expect(drawer).not.toBeVisible())
  })

  it('closes the drawer from its own close control', async () => {
    renderShell()
    await userEvent.click(
      screen.getByRole('button', { name: 'Open application navigation' }),
    )
    // Focus returns to the trigger through the native `close` event, which the
    // engine owns — the browser harness asserts that half.
    await userEvent.click(
      screen.getByRole('button', { name: 'Close navigation' }),
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('renders exactly one h1 and keeps the mobile bar title a span', () => {
    renderShell({ mobileTitle: <span>Projects</span> })
    const headings = document.querySelectorAll('h1')
    expect(headings.length).toBe(1)
    expect(headings[0]?.textContent).toBe('Projects')
  })

  it('renders the page footer after the content inside the scroller', () => {
    renderShell({ footer: <p>Quarterly summary</p> })
    const content = screen.getByText('Content')
    const footer = screen.getByText('Quarterly summary')
    expect(
      footer.compareDocumentPosition(content) &
        Node.DOCUMENT_POSITION_PRECEDING,
    ).toBeTruthy()
  })

  describe('desktop', () => {
    it('docks the sidebar and folds it through the one fold control', async () => {
      await withDesktop(async () => {
        renderShell()
        const dock = document.querySelector(
          '[data-slot="app-shell-sidebar"]',
        ) as HTMLElement
        expect(dock.className).toContain('w-64')

        // The Sidebar keeps inactive slot copies mounted and hides them with
        // CSS, so the fold control's name and the dock width are the jsdom-
        // visible contract; the compact-slot swap is the browser harness's.
        userEvent.click(
          screen.getByRole('button', { name: 'Collapse sidebar' }),
        )
        await waitFor(() => expect(dock.className).toContain('w-14'))
        expect(
          screen.queryByRole('button', { name: 'Collapse sidebar' }),
        ).toBeNull()

        userEvent.click(screen.getByRole('button', { name: 'Expand sidebar' }))
        await waitFor(() => expect(dock.className).toContain('w-64'))
        expect(
          screen.queryByRole('button', { name: 'Expand sidebar' }),
        ).toBeNull()
      })
    })

    it('stays owned by the app when `collapsed` is controlled', async () => {
      await withDesktop(async () => {
        const onCollapsedChange = vi.fn()
        renderShell({ collapsed: false, onCollapsedChange })
        const dock = document.querySelector(
          '[data-slot="app-shell-sidebar"]',
        ) as HTMLElement
        userEvent.click(
          screen.getByRole('button', { name: 'Collapse sidebar' }),
        )
        await waitFor(() =>
          expect(onCollapsedChange).toHaveBeenCalledWith(true),
        )
        // Controlled: the shell does not move until the app moves it.
        expect(dock.className).toContain('w-64')
      })
    })

    it('renders header actions in the shell header', async () => {
      await withDesktop(async () => {
        renderShell({
          headerActions: <button type="button">Invite</button>,
        })
        expect(screen.getByRole('button', { name: 'Invite' })).toBeTruthy()
      })
    })
  })
})
