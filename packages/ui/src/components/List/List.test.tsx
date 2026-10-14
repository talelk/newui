import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TabButtons } from '../TabButtons'
import { List, ListCell, ListRow } from './List'

describe('List', () => {
  it('exposes the column template to its rows', () => {
    const { container } = render(() => (
      <List columns="auto minmax(0, 1fr)">
        <ListRow>
          <ListCell>Name</ListCell>
          <ListCell>Detail</ListCell>
        </ListRow>
      </List>
    ))

    const list = container.querySelector('[data-slot="list"]') as HTMLElement
    expect(list.style.getPropertyValue('--list-columns')).toBe(
      'auto minmax(0, 1fr)',
    )
    expect(
      container.querySelector('[data-slot="list-row"]')?.className,
    ).toContain('grid-cols-[var(--list-columns)]')
  })

  it('marks the active row and forwards clicks', async () => {
    const onClick = vi.fn()
    const { container } = render(() => (
      <List>
        <ListRow active onClick={onClick}>
          <ListCell>Row</ListCell>
        </ListRow>
      </List>
    ))

    const row = container.querySelector('[data-slot="list-row"]') as HTMLElement
    expect(row.getAttribute('data-active')).toBe('')
    await userEvent.click(row)
    expect(onClick).toHaveBeenCalled()
  })
})

describe('TabButtons', () => {
  it('selects an option and reports the change', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <TabButtons
        defaultValue="all"
        onValueChange={onValueChange}
        options={[
          { label: 'Unread', value: 'unread' },
          { label: 'All', value: 'all' },
        ]}
      />
    ))

    expect(
      screen.getByRole('tab', { name: 'All' }).getAttribute('aria-selected'),
    ).toBe('true')
    await userEvent.click(screen.getByRole('tab', { name: 'Unread' }))
    expect(onValueChange).toHaveBeenCalledWith('unread')
  })
})
