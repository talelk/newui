import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { DesktopShell } from './DesktopShell'

function slot(name: string): HTMLElement | null {
  return document.querySelector(`[data-slot="${name}"]`)
}

describe('DesktopShell', () => {
  it('renders the rail, sidebar and content regions', () => {
    render(() => (
      <DesktopShell rail={<span>Rail</span>} sidebar={<span>Sidebar</span>}>
        Page
      </DesktopShell>
    ))
    expect(slot('app-shell')).not.toBeNull()
    expect(slot('desktop-shell-content')?.textContent).toContain('Page')
    expect(screen.getByText('Rail')).toBeInTheDocument()
    expect(screen.getByText('Sidebar')).toBeInTheDocument()
  })

  it('owns the page scroller by default', () => {
    render(() => <DesktopShell>Page</DesktopShell>)
    const content = slot('desktop-shell-content') as HTMLElement
    expect(content.getAttribute('data-scroll')).toBe('page')
    expect(content.className).toContain('overflow-y-auto')
  })

  it('hands overflow to the panes when scroll is false', () => {
    render(() => <DesktopShell scroll={false}>Page</DesktopShell>)
    const content = slot('desktop-shell-content') as HTMLElement
    expect(content.getAttribute('data-scroll')).toBe('panes')
    expect(content.className).toContain('overflow-hidden')
    expect(content.className).not.toContain('overflow-y-auto')
  })

  it('merges a root class through to the frame', () => {
    render(() => <DesktopShell class="h-[620px]">Page</DesktopShell>)
    expect(slot('app-shell')?.className).toContain('h-[620px]')
  })

  it('renders without a rail or sidebar', () => {
    render(() => <DesktopShell>Only content</DesktopShell>)
    expect(slot('sidebar')).toBeNull()
    expect(slot('sidebar-rail')).toBeNull()
  })

  it('keeps the content region a full-height flex column', () => {
    render(() => <DesktopShell>Page</DesktopShell>)
    const content = slot('desktop-shell-content') as HTMLElement
    expect(content.className).toContain('flex-1')
    expect(content.className).toContain('flex-col')
    expect(content.className).toContain('min-h-0')
  })
})
