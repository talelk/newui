import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Menu } from './Menu'

describe('Menu', () => {
  it('opens and reports the selected item', async () => {
    const onSelect = vi.fn()
    render(() => (
      <Menu.Root defaultOpen onSelect={onSelect}>
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

    expect(screen.getByRole('button', { name: 'Actions' })).toBeTruthy()
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit' }))
    expect(onSelect).toHaveBeenCalledWith('edit')
  })
})
