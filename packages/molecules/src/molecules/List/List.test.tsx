import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TabButtons } from '../TabButtons'
import {
  List,
  ListCell,
  ListGroup,
  ListHeader,
  ListHeaderCellSort,
  ListRow,
} from './List'

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

describe('ListHeaderCellSort', () => {
  const cell = () => document.querySelector('[data-slot="list-header-cell"]')

  it('reports no sort state until it is the sort key', () => {
    render(() => (
      <List>
        <ListHeader>
          <ListHeaderCellSort>Name</ListHeaderCellSort>
        </ListHeader>
      </List>
    ))
    expect(cell()?.getAttribute('aria-sort')).toBeNull()
    expect(cell()?.getAttribute('data-sort')).toBeNull()
  })

  it('announces the direction it was given', () => {
    render(() => (
      <List>
        <ListHeader>
          <ListHeaderCellSort direction="desc">Name</ListHeaderCellSort>
        </ListHeader>
      </List>
    ))
    expect(cell()?.getAttribute('aria-sort')).toBe('descending')

    expect(cell()?.getAttribute('data-sort')).toBe('desc')
  })

  it('calls back rather than owning the toggle rule', async () => {
    const onClick = vi.fn()
    render(() => (
      <List>
        <ListHeader>
          <ListHeaderCellSort onClick={onClick}>Name</ListHeaderCellSort>
        </ListHeader>
      </List>
    ))
    await userEvent.click(screen.getByRole('button', { name: /Name/ }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('keeps an active glyph visible and fades an inactive one in on hover', () => {
    const active = render(() => (
      <List>
        <ListHeader>
          <ListHeaderCellSort direction="asc">Name</ListHeaderCellSort>
        </ListHeader>
      </List>
    ))
    expect(document.querySelector('.lucide-arrow-up')).toBeTruthy()
    expect(
      document.querySelector('.lucide-arrow-up')?.parentElement?.className,
    ).not.toContain('opacity-0')
    active.unmount()

    render(() => (
      <List>
        <ListHeader>
          <ListHeaderCellSort>Name</ListHeaderCellSort>
        </ListHeader>
      </List>
    ))
    expect(
      document.querySelector('.lucide-arrow-up-down')?.parentElement?.className,
    ).toContain('opacity-0')
  })
})

describe('ListGroup', () => {
  it('is a rowgroup named by its label', () => {
    render(() => (
      <List>
        <ListGroup label="Today">
          <ListRow>
            <ListCell>One</ListCell>
          </ListRow>
        </ListGroup>
      </List>
    ))
    const group = screen.getByRole('rowgroup', { name: 'Today' })
    expect(group.textContent).toContain('Today')
    expect(group.textContent).toContain('One')
  })

  it('drops the label row when there is no label', () => {
    render(() => (
      <List>
        <ListGroup>
          <ListRow>
            <ListCell>One</ListCell>
          </ListRow>
        </ListGroup>
      </List>
    ))
    expect(document.querySelector('[data-slot="list-group-header"]')).toBeNull()
  })

  it('pins the label only when asked', () => {
    const plain = render(() => (
      <List>
        <ListGroup label="Today">
          <ListRow>
            <ListCell>One</ListCell>
          </ListRow>
        </ListGroup>
      </List>
    ))
    expect(
      document.querySelector('[data-slot="list-group-header"]')?.className,
    ).not.toContain('sticky')
    plain.unmount()

    render(() => (
      <List>
        <ListGroup label="Today" sticky>
          <ListRow>
            <ListCell>One</ListCell>
          </ListRow>
        </ListGroup>
      </List>
    ))
    expect(
      document.querySelector('[data-slot="list-group-header"]')?.className,
    ).toContain('sticky')
  })
})
