import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { DesktopShell } from './DesktopShell'

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

describe('DesktopShell accessibility', () => {
  it('has no axe violations for a shell with rail and sidebar', async () => {
    const { container } = render(() => (
      <DesktopShell
        rail={<nav aria-label="Workspaces">R</nav>}
        sidebar={<nav aria-label="Navigation">S</nav>}
      >
        <main aria-label="Content">Page</main>
      </DesktopShell>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations when panes own the overflow', async () => {
    const { container } = render(() => (
      <DesktopShell scroll={false}>
        <main aria-label="Content">Page</main>
      </DesktopShell>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
