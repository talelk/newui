import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { MobileNav, MobileNavItem } from '../MobileNav'
import { MobileShell, PageHeaderMobile } from './MobileShell'

const AXE_OPTIONS = {
  rules: {
    'color-contrast': { enabled: false },
    region: { enabled: false },
  },
}

function summarize(results: AxeResults) {
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }))
}

describe('MobileShell accessibility', () => {
  it('has no axe violations for a full shell', async () => {
    const { container } = render(() => (
      <MobileShell
        header={
          <PageHeaderMobile
            title="Home"
            prefix={
              <button type="button" aria-label="Back">
                Back
              </button>
            }
          />
        }
        nav={
          <MobileNav aria-label="Primary">
            <MobileNavItem label="Home" icon="lucide-house" active />
            <MobileNavItem
              label="Search"
              icon="lucide-search"
              route="/search"
            />
            <MobileNavItem label="You" href="/more" />
          </MobileNav>
        }
      >
        <p>Content</p>
      </MobileShell>
    ))

    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
