import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { DesktopShell } from './DesktopShell'

describe('SSR smoke', () => {
  it('DesktopShell renders to a string', () => {
    const html = renderToString(() => (
      <DesktopShell rail={<span>Rail</span>} sidebar={<span>Sidebar</span>}>
        Page
      </DesktopShell>
    ))
    expect(html).toContain('data-slot="app-shell"')
    expect(html).toContain('data-slot="desktop-shell-content"')
    expect(html).toContain('data-scroll="page"')
    expect(html).toContain('Page')
  })

  it('renders the pane overflow mode on the server', () => {
    const html = renderToString(() => (
      <DesktopShell scroll={false}>Page</DesktopShell>
    ))
    expect(html).toContain('data-scroll="panes"')
    expect(html).toContain('overflow-hidden')
  })
})
