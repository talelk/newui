import { fireEvent, render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ContextMenu } from './ContextMenu'

function renderMenu(props: {
  onSelect?: (value: string) => void
  onOpenChange?: (open: boolean) => void
  open?: boolean
  defaultOpen?: boolean
}) {
  const utils = render(() => (
    <ContextMenu.Root
      open={props.open}
      defaultOpen={props.defaultOpen}
      onSelect={props.onSelect}
      onOpenChange={props.onOpenChange}
    >
      <ContextMenu.Trigger>Right-click area</ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item value="edit">Edit</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item value="delete">Delete</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  ))

  const trigger = utils.container.querySelector(
    '[data-slot="context-menu-trigger"]',
  ) as HTMLElement

  return { ...utils, trigger }
}

describe('ContextMenu', () => {
  it('is closed until the trigger area is right-clicked', async () => {
    const { trigger } = renderMenu({})

    expect(screen.queryByRole('menu')).toBeNull()

    fireEvent.contextMenu(trigger)
    expect(await screen.findByRole('menu')).toBeTruthy()
  })

  it('reports the selected item through onSelect', async () => {
    const onSelect = vi.fn()
    const { trigger } = renderMenu({ onSelect })

    fireEvent.contextMenu(trigger)
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit' }))

    expect(onSelect).toHaveBeenCalledWith('edit')
  })

  it('reports open changes through onOpenChange', async () => {
    const onOpenChange = vi.fn()
    const { trigger } = renderMenu({ onOpenChange })

    fireEvent.contextMenu(trigger)
    await screen.findByRole('menu')
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('exposes the menu ARIA roles', async () => {
    const { trigger } = renderMenu({})

    fireEvent.contextMenu(trigger)
    expect(await screen.findByRole('menu')).toBeTruthy()
    expect(screen.getAllByRole('menuitem')).toHaveLength(2)
  })

  it('opens when controlled open is set', async () => {
    renderMenu({ open: true })
    expect(await screen.findByRole('menuitem', { name: 'Delete' })).toBeTruthy()
  })
})
