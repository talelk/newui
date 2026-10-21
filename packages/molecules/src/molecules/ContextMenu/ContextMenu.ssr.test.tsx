import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { ContextMenu } from './ContextMenu'

describe('SSR smoke', () => {
  it('ContextMenu renders to a string', () => {
    const html = renderToString(() => (
      <ContextMenu.Root>
        <ContextMenu.Trigger>Right-click area</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item value="edit">Edit</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
    ))

    expect(html).toContain('data-slot="context-menu-trigger"')
    expect(html).toContain('Right-click area')
  })
})
