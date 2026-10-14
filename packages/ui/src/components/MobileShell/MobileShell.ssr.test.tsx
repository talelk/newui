import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { MobileNav, MobileNavItem } from '../MobileNav'
import { MobileShell, PageHeaderMobile } from './MobileShell'

describe('SSR smoke', () => {
  it('MobileShell renders header, body and nav to a string', () => {
    const html = renderToString(() => (
      <MobileShell
        header={<PageHeaderMobile title="Home" />}
        nav={
          <MobileNav aria-label="Primary">
            <MobileNavItem label="Home" icon="lucide-house" active />
            <MobileNavItem label="Search" route="/search" />
          </MobileNav>
        }
      >
        Body
      </MobileShell>
    ))

    expect(html).toContain('data-slot="mobile-shell"')
    expect(html).toContain('data-slot="mobile-shell-scroll"')
    expect(html).toContain('data-slot="page-header-mobile"')
    expect(html).toContain('data-slot="mobile-nav"')
    expect(html).toContain('data-state="active"')
    expect(html).toContain('Home')
    expect(html).toContain('Body')
  })
})
