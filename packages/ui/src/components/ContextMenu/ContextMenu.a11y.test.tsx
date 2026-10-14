import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { ContextMenu } from './ContextMenu'

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

describe('ContextMenu accessibility', () => {
  it('has no axe violations when the menu is open', async () => {
    render(() => (
      <ContextMenu.Root defaultOpen>
        <ContextMenu.Trigger>Right-click area</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item value="edit">Edit</ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item value="delete">Delete</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
    ))

    expect(summarize(await axe.run(document.body, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a closed menu', async () => {
    const { container } = render(() => (
      <ContextMenu.Root>
        <ContextMenu.Trigger>Right-click area</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item value="edit">Edit</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
    ))

    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
