import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { MobileNav, MobileNavItem } from './MobileNav'

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

describe('MobileNav accessibility', () => {
  it('has no axe violations for a tab bar of links and buttons', async () => {
    const { container } = render(() => (
      <MobileNav aria-label="Primary">
        <MobileNavItem
          label="Home"
          icon="lucide-house"
          active
          aria-current="page"
        />
        <MobileNavItem label="Search" icon="lucide-search" route="/search" />
        <MobileNavItem label="You" icon="lucide-user-round" />
      </MobileNav>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations with custom content in place of an icon', async () => {
    const { container } = render(() => (
      <MobileNav aria-label="Primary">
        <MobileNavItem label="Home" active>
          <span>AC</span>
        </MobileNavItem>
        <MobileNavItem label="More" icon="lucide-ellipsis" />
      </MobileNav>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
