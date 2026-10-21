import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Menu } from './Menu'

describe('Menu (browser, real CSS)', () => {
  it('paints an opaque menu surface with padded rows', () => {
    render(() => (
      <Menu.Root defaultOpen>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Item value="edit">Edit</Menu.Item>
        </Menu.Content>
      </Menu.Root>
    ))

    const content = document.querySelector(
      '[data-slot="menu-content"]',
    ) as HTMLElement
    const item = document.querySelector(
      '[data-slot="menu-item"]',
    ) as HTMLElement

    expect(content).not.toBeNull()
    expect(getComputedStyle(content).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )
    expect(content.getBoundingClientRect().width).toBeGreaterThanOrEqual(160)
    expect(
      Number.parseFloat(getComputedStyle(item).paddingLeft),
    ).toBeGreaterThan(0)
  })
})
