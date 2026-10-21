import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Dropdown } from './Dropdown'

const OPTIONS = [
  { label: 'Edit', value: 'edit' },
  { label: 'Duplicate', value: 'duplicate' },
  { label: 'Delete', value: 'delete', danger: true, disabled: true },
]

describe('Dropdown', () => {
  it('opens from its trigger and lists the options', async () => {
    render(() => <Dropdown options={OPTIONS}>Actions</Dropdown>)
    await userEvent.click(screen.getByRole('button', { name: /Actions/ }))
    expect(await screen.findByRole('menu')).toBeTruthy()
    expect(screen.getAllByRole('menuitem')).toHaveLength(3)
  })

  it('reports the selected value', async () => {
    const onSelect = vi.fn()
    render(() => (
      <Dropdown options={OPTIONS} onSelect={onSelect}>
        Actions
      </Dropdown>
    ))
    await userEvent.click(screen.getByRole('button', { name: /Actions/ }))
    await userEvent.click(await screen.findByRole('menuitem', { name: /Edit/ }))
    expect(onSelect).toHaveBeenCalledWith('edit')
  })

  it('marks a disabled option', async () => {
    render(() => <Dropdown options={OPTIONS}>Actions</Dropdown>)
    await userEvent.click(screen.getByRole('button', { name: /Actions/ }))
    const item = await screen.findByRole('menuitem', { name: /Delete/ })
    expect(item.getAttribute('data-disabled')).toBe('')
  })
})
