import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ContextMenu } from './ContextMenu'

describe('ContextMenu (browser, real CSS)', () => {
  it('paints the opened menu surface and its rows', () => {
    render(() => (
      <ContextMenu.Root defaultOpen>
        <ContextMenu.Trigger>Right-click area</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item value="edit">Edit</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
    ))

    const content = document.querySelector(
      '[data-slot="context-menu-content"]',
    ) as HTMLElement
    const item = document.querySelector(
      '[data-slot="context-menu-item"]',
    ) as HTMLElement

    expect(content).not.toBeNull()
    expect(getComputedStyle(content).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )
    expect(content.getBoundingClientRect().width).toBeGreaterThan(0)
    expect(
      Number.parseFloat(getComputedStyle(item).paddingTop),
    ).toBeGreaterThan(0)
  })
})
