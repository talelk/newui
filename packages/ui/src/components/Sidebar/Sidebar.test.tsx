import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  Sidebar,
  SidebarCard,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarRail,
  SidebarRailItem,
  SidebarSearch,
  SidebarSection,
  SidebarTrigger,
  useSidebar,
} from './Sidebar'

function Toggler() {
  const { toggle } = useSidebar()
  return (
    <button type="button" onClick={toggle}>
      Toggle
    </button>
  )
}

describe('Sidebar', () => {
  it('is a named navigation landmark', () => {
    const { getByRole } = render(() => <Sidebar />)
    const nav = getByRole('navigation')
    expect(nav.getAttribute('aria-label')).toBe('Main')
    expect(nav.getAttribute('data-state')).toBe('expanded')
  })

  it('honours a controlled collapsed state', () => {
    const { container } = render(() => <Sidebar collapsed />)
    const nav = container.querySelector('[data-slot="sidebar"]') as HTMLElement
    expect(nav.getAttribute('data-state')).toBe('collapsed')
    expect(nav.style.width).toBe('3rem')
  })

  it('reports a toggle through onCollapsedChange', async () => {
    const onCollapsedChange = vi.fn()
    const { getByRole } = render(() => (
      <Sidebar onCollapsedChange={onCollapsedChange}>
        <Toggler />
      </Sidebar>
    ))
    await userEvent.click(getByRole('button', { name: 'Toggle' }))
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
  })

  it('hides the title block and shows a divider label when collapsed', () => {
    const { container, queryByText } = render(() => (
      <Sidebar collapsed>
        <SidebarHeader title="Workspace" />
        <SidebarLabel divider>General</SidebarLabel>
      </Sidebar>
    ))
    expect(queryByText('Workspace')).toBeNull()
    expect(
      container.querySelector('[data-slot="sidebar-label"] hr'),
    ).toBeTruthy()
  })

  it('renders the header logo box', () => {
    const { container } = render(() => (
      <Sidebar>
        <SidebarHeader title="Workspace" logo="https://example.com/logo.png" />
      </Sidebar>
    ))
    const img = container.querySelector('[data-slot="sidebar-header"] img')
    expect(img?.getAttribute('src')).toBe('https://example.com/logo.png')
  })

  it('falls back to the title initial when no logo is given', () => {
    const { container } = render(() => (
      <Sidebar>
        <SidebarHeader title="workspace" />
      </Sidebar>
    ))
    expect(
      container.querySelector('[data-slot="sidebar-header"]')?.textContent,
    ).toContain('W')
  })

  it('collapses the item label to an accessible-only name', () => {
    const { container } = render(() => (
      <Sidebar collapsed>
        <SidebarItem label="Home">Home</SidebarItem>
      </Sidebar>
    ))
    const label = container.querySelector(
      '[data-slot="sidebar-item"] span',
    ) as HTMLElement
    expect(label.className).toContain('sr-only')
  })
})

describe('SidebarRailItem', () => {
  it('shows an indicator bar for an active subtle item', () => {
    const { container } = render(() => (
      <SidebarRail>
        <SidebarRailItem label="Home" active variant="subtle" />
      </SidebarRail>
    ))
    expect(
      container.querySelector('[data-slot="sidebar-rail-item-indicator"]'),
    ).toBeTruthy()
  })

  it('raises a ghost item instead of drawing a bar', () => {
    const { container } = render(() => (
      <SidebarRail>
        <SidebarRailItem label="Home" active variant="ghost" />
      </SidebarRail>
    ))
    const item = container.querySelector(
      '[data-slot="sidebar-rail-item"]',
    ) as HTMLElement
    expect(item.className).toContain('bg-surface-elevation-3')
    expect(
      container.querySelector('[data-slot="sidebar-rail-item-indicator"]'),
    ).toBeNull()
  })

  it('renders a capped count badge and folds it into the label', () => {
    const { container } = render(() => (
      <SidebarRail>
        <SidebarRailItem label="Inbox" badge={142} />
      </SidebarRail>
    ))
    const item = container.querySelector(
      '[data-slot="sidebar-rail-item"]',
    ) as HTMLElement
    expect(item.getAttribute('aria-label')).toBe('Inbox, 142 unread')
    expect(container.textContent).toContain('99+')
  })

  it('renders a dot badge when badgeStyle is dot', () => {
    const { container } = render(() => (
      <SidebarRail>
        <SidebarRailItem label="Inbox" badge={3} badgeStyle="dot" />
      </SidebarRail>
    ))
    expect(
      container.querySelector('[data-slot="sidebar-rail-item-badge-dot"]'),
    ).toBeTruthy()
  })
})

describe('SidebarSearch', () => {
  it('is a labelled filter that reports what is typed', async () => {
    const onInput = vi.fn()
    render(() => (
      <Sidebar>
        <SidebarSearch placeholder="Filter pages" onInput={onInput} />
      </Sidebar>
    ))

    const field = screen.getByLabelText('Filter pages')
    await userEvent.type(field, 'acc')
    expect(onInput).toHaveBeenLastCalledWith('acc')
  })

  it('hides itself when the sidebar is a rail', () => {
    render(() => (
      <Sidebar collapsed>
        <SidebarSearch placeholder="Filter pages" />
      </Sidebar>
    ))
    expect(screen.queryByLabelText('Filter pages')).toBeNull()
  })
})

describe('SidebarItem while collapsed', () => {
  it('names itself and offers a real tooltip, not a bare title', async () => {
    render(() => (
      <Sidebar collapsed>
        <SidebarItem label="Accordion" prefix={<span>icon</span>}>
          Accordion
        </SidebarItem>
      </Sidebar>
    ))

    const item = screen.getByRole('button', { name: 'Accordion' })
    expect(item.getAttribute('title')).toBeNull()

    await userEvent.hover(item)
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Accordion')
  })

  it('keeps the label visible when it is not a rail', () => {
    render(() => (
      <Sidebar>
        <SidebarItem label="Accordion">Accordion</SidebarItem>
      </Sidebar>
    ))
    expect(screen.getByText('Accordion')).toBeTruthy()
  })
})

describe('SidebarItem links (frappe-ui parity)', () => {
  it('renders a route as a same-tab link and marks the active row', () => {
    render(() => (
      <Sidebar>
        <SidebarItem route="/inbox" active>
          Inbox
        </SidebarItem>
        <SidebarItem href="https://example.com">External</SidebarItem>
      </Sidebar>
    ))
    const inbox = screen.getByRole('link', { name: 'Inbox' })
    expect(inbox.getAttribute('href')).toBe('/inbox')
    expect(inbox.getAttribute('aria-current')).toBe('page')
    expect(inbox.getAttribute('target')).toBeNull()
    const external = screen.getByRole('link', { name: 'External' })
    expect(external.getAttribute('target')).toBe('_blank')
  })

  it('keeps the suffix beside the link so it may hold a button', () => {
    const { container } = render(() => (
      <Sidebar>
        <SidebarItem
          route="/inbox"
          icon="lucide-inbox"
          suffix={<button type="button">Options</button>}
        >
          Inbox
        </SidebarItem>
      </Sidebar>
    ))
    const link = screen.getByRole('link', { name: 'Inbox' })
    const options = screen.getByRole('button', { name: 'Options' })
    expect(link.contains(options)).toBe(false)
    expect(
      container.querySelector('[data-slot="sidebar-item"] .lucide-inbox'),
    ).toBeTruthy()
  })

  it('renders a rail route as a link with aria-current', () => {
    render(() => (
      <SidebarRail>
        <SidebarRailItem label="Home" route="/" active />
      </SidebarRail>
    ))
    const item = screen.getByRole('link', { name: 'Home' })
    expect(item.getAttribute('href')).toBe('/')
    expect(item.getAttribute('aria-current')).toBe('page')
  })
})

describe('SidebarSection controlled state', () => {
  it('honours controlled collapsed and reports toggles', async () => {
    const onCollapsedChange = vi.fn()
    render(() => (
      <Sidebar>
        <SidebarSection
          label="Projects"
          collapsible
          collapsed
          onCollapsedChange={onCollapsedChange}
        >
          <SidebarItem>Website</SidebarItem>
        </SidebarSection>
      </Sidebar>
    ))
    expect(screen.queryByText('Website')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: /Projects/ }))
    expect(onCollapsedChange).toHaveBeenCalledWith(false)
    // Controlled: the parent did not flip the prop, so the body stays shut.
    expect(screen.queryByText('Website')).toBeNull()
  })
})

describe('SidebarCard', () => {
  it('hides itself when the sidebar is a rail', () => {
    render(() => (
      <Sidebar collapsed>
        <SidebarCard title="Trial ends soon" />
      </Sidebar>
    ))
    expect(screen.queryByText('Trial ends soon')).toBeNull()
  })

  it('hands the action a dismiss that fires onDismiss', async () => {
    const onDismiss = vi.fn()
    render(() => (
      <SidebarCard
        title="Trial ends soon"
        onDismiss={onDismiss}
        action={{
          label: 'Upgrade',
          onClick: ({ dismiss }) => dismiss(),
        }}
      />
    ))
    await userEvent.click(screen.getByRole('button', { name: 'Upgrade' }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })
})

describe('SidebarTrigger', () => {
  it('folds the sidebar and says so', async () => {
    const onCollapsedChange = vi.fn()
    render(() => (
      <Sidebar onCollapsedChange={onCollapsedChange}>
        <SidebarTrigger />
      </Sidebar>
    ))

    const trigger = screen.getByRole('button', { name: 'Collapse sidebar' })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    await userEvent.click(trigger)
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeTruthy()
  })

  it('is bound to ⌘B and Ctrl+B', async () => {
    const onCollapsedChange = vi.fn()
    render(() => <Sidebar onCollapsedChange={onCollapsedChange} />)

    await userEvent.keyboard('{Meta>}b{/Meta}')
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true)
    await userEvent.keyboard('{Control>}b{/Control}')
    expect(onCollapsedChange).toHaveBeenLastCalledWith(false)
  })

  it('leaves the key alone when the shortcut is off', async () => {
    const onCollapsedChange = vi.fn()
    render(() => (
      <Sidebar shortcut={false} onCollapsedChange={onCollapsedChange} />
    ))

    await userEvent.keyboard('{Meta>}b{/Meta}')
    expect(onCollapsedChange).not.toHaveBeenCalled()
  })
})
