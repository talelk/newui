import { render, screen } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { Menu } from './Menu'

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

describe('Menu accessibility', () => {
  it('has no axe violations when the menu is open', async () => {
    render(() => (
      <Menu.Root defaultOpen>
        <Menu.Trigger aria-label="Actions">
          <span aria-hidden="true">•••</span>
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item value="edit">Edit</Menu.Item>
          <Menu.Separator />
          <Menu.Item value="delete">Delete</Menu.Item>
        </Menu.Content>
      </Menu.Root>
    ))

    expect(screen.getByRole('menu')).toBeTruthy()
    expect(screen.getAllByRole('menuitem')).toHaveLength(2)
    expect(summarize(await axe.run(document.body, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations when the menu is closed', async () => {
    const { container } = render(() => (
      <Menu.Root>
        <Menu.Trigger aria-label="Actions">
          <span aria-hidden="true">•••</span>
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item value="edit">Edit</Menu.Item>
        </Menu.Content>
      </Menu.Root>
    ))

    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
