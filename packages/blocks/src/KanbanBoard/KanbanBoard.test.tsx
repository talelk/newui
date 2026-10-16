import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  KanbanBoard,
  type KanbanColumn,
  type KanbanMove,
  placeKanbanItem,
} from './KanbanBoard'

interface Deal {
  id: string
  name: string
}

const deals: Deal[] = [
  { id: 'D-1', name: 'Globex' },
  { id: 'D-2', name: 'Stark' },
  { id: 'D-3', name: 'Wayne' },
]

function stages(
  overrides: Partial<Record<string, Deal[]>> = {},
): KanbanColumn<Deal>[] {
  return [
    {
      id: 'open',
      name: 'Open',
      theme: 'gray',
      items: overrides['open'] ?? deals,
    },
    {
      id: 'won',
      name: 'Won',
      theme: 'green',
      items: overrides['won'] ?? [],
    },
  ]
}

const card = (deal: Deal) => <span>{deal.name}</span>

const idsIn = (columnId: string) =>
  [
    ...document.querySelectorAll(
      `[data-kanban-column="${columnId}"] [data-kanban-id]`,
    ),
  ].map((node) => node.getAttribute('data-kanban-id'))

/** Open a card's menu and choose a column. */
async function moveViaMenu(name: string, column: string) {
  await userEvent.click(
    screen.getByRole('button', { name: `Actions for ${name}` }),
  )
  await userEvent.click(await screen.findByRole('menuitem', { name: column }))
}

describe('placeKanbanItem', () => {
  const columns = stages()

  it('moves an item to the end of another column by index', () => {
    const next = placeKanbanItem(columns, 'D-1', { column: 'won', index: 0 })
    expect(next[0]?.items.map((item) => item.id)).toEqual(['D-2', 'D-3'])
    expect(next[1]?.items.map((item) => item.id)).toEqual(['D-1'])
  })

  it('counts the index over the column *without* the item being moved', () => {
    // Dragging D-1 down one place: the index is measured after D-1 is taken out,
    // so 1 lands it between D-2 and D-3 rather than back at the top.
    const next = placeKanbanItem(columns, 'D-1', { column: 'open', index: 1 })
    expect(next[0]?.items.map((item) => item.id)).toEqual(['D-2', 'D-1', 'D-3'])
  })

  it('clamps an index past the end of the column', () => {
    const next = placeKanbanItem(columns, 'D-1', { column: 'won', index: 9 })
    expect(next[1]?.items.map((item) => item.id)).toEqual(['D-1'])
  })

  it('returns what came in when the move changes nothing', () => {
    expect(placeKanbanItem(columns, 'D-1', { column: 'open', index: 0 })).toBe(
      columns,
    )
  })

  it('keeps the columns it did not touch, by reference', () => {
    const next = placeKanbanItem(columns, 'D-1', { column: 'won', index: 0 })
    // The untouched column is the same object: keying rows on it would throw
    // that column's DOM away, along with its scroll position.
    expect(next[0]).not.toBe(columns[0])
    expect(next[1]).not.toBe(columns[1])
    expect(next[0]?.name).toBe('Open')
  })

  it('ignores an item the board does not have', () => {
    expect(placeKanbanItem(columns, 'D-9', { column: 'won', index: 0 })).toBe(
      columns,
    )
  })
})

describe('KanbanBoard', () => {
  it('renders the columns, their counts and the cards', () => {
    render(() => (
      <KanbanBoard columns={stages()} label="Deals">
        {card}
      </KanbanBoard>
    ))

    expect(screen.getByRole('list', { name: 'Deals' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Open', level: 2 })).toBeTruthy()
    expect(screen.getByText('Globex')).toBeTruthy()
    // The count is the column's, not the card's.
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('renders a column action, a summary and its empty state', async () => {
    const onAdd = vi.fn()
    render(() => (
      <KanbanBoard
        columns={[
          {
            id: 'open',
            name: 'Open',
            items: [],
            summary: <span>$210,000</span>,
            action: { label: 'Add deal', onClick: onAdd },
          },
        ]}
        emptyColumn={() => <span>Nothing open.</span>}
      >
        {card}
      </KanbanBoard>
    ))

    expect(screen.getByText('$210,000')).toBeTruthy()
    expect(screen.getByText('Nothing open.')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Add deal' }))
    expect(onAdd).toHaveBeenCalled()
  })

  it('moves a card with the menu, and reports a single move', async () => {
    const moves: KanbanMove<Deal>[] = []
    render(() => (
      <KanbanBoard
        defaultColumns={stages()}
        onMove={(move) => moves.push(move)}
        itemLabel={(deal) => deal.name}
      >
        {card}
      </KanbanBoard>
    ))

    await moveViaMenu('Globex', 'Won')

    expect(moves).toHaveLength(1)
    expect(moves[0]?.itemId).toBe('D-1')
    expect(moves[0]?.from).toEqual({ column: 'open', index: 0 })
    expect(moves[0]?.to).toEqual({ column: 'won', index: 0 })
    expect(moves[0]?.columns[1]?.items.map((item) => item.id)).toEqual(['D-1'])
  })

  it('only offers the columns the card is not already in', async () => {
    render(() => (
      <KanbanBoard defaultColumns={stages()} itemLabel={(deal) => deal.name}>
        {card}
      </KanbanBoard>
    ))

    await userEvent.click(
      screen.getByRole('button', { name: 'Actions for Globex' }),
    )
    const entries = await screen.findAllByRole('menuitem')
    expect(entries.map((entry) => entry.textContent)).toEqual(['Won'])
  })

  it('owns the order when uncontrolled, and leaves it alone when controlled', async () => {
    const uncontrolled = render(() => (
      <KanbanBoard defaultColumns={stages()} itemLabel={(deal) => deal.name}>
        {card}
      </KanbanBoard>
    ))
    expect(idsIn('won')).toEqual([])
    await moveViaMenu('Globex', 'Won')
    expect(idsIn('won')).toEqual(['D-1'])
    expect(idsIn('open')).toEqual(['D-2', 'D-3'])
    uncontrolled.unmount()

    const columns = stages()
    render(() => (
      <KanbanBoard columns={columns} itemLabel={(deal) => deal.name}>
        {card}
      </KanbanBoard>
    ))
    await moveViaMenu('Globex', 'Won')
    // The board reported the move but did not take it: the owner decides.
    expect(idsIn('won')).toEqual([])
    expect(idsIn('open')).toEqual(['D-1', 'D-2', 'D-3'])
  })

  it('lets a card bring its own actions instead', async () => {
    const onArchive = vi.fn()
    render(() => (
      <KanbanBoard
        defaultColumns={stages()}
        itemLabel={(deal) => deal.name}
        renderActions={() => (
          <button type="button" onClick={onArchive}>
            Archive
          </button>
        )}
      >
        {card}
      </KanbanBoard>
    ))

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Archive' })[0] as HTMLElement,
    )
    expect(onArchive).toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: /Actions for/ })).toBeNull()
  })

  it('snaps the columns only where the board is a phone-width panner', () => {
    render(() => (
      <KanbanBoard defaultColumns={stages()} itemLabel={(deal) => deal.name}>
        {card}
      </KanbanBoard>
    ))

    const row = screen.getByRole('list', { name: 'Board' })
    const classes = row.className.split(/\s+/)
    // Every snap utility is behind `max-lg:`. An unprefixed one would snap the
    // board on a wide screen too, under the pointer, mid-drop.
    expect(classes.filter((name) => name.includes('snap'))).toEqual([
      'max-lg:snap-x',
      'max-lg:snap-mandatory',
    ])
    const column = document.querySelector('[data-kanban-column="open"]')
    expect(column?.className).toContain('max-lg:snap-start')
  })

  it('names the board and each card for a screen reader', () => {
    render(() => (
      <KanbanBoard defaultColumns={stages()} itemLabel={(deal) => deal.name}>
        {card}
      </KanbanBoard>
    ))

    expect(screen.getByRole('list', { name: 'Board' })).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Actions for Globex' }),
    ).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Won' })).toBeTruthy()
  })
})
