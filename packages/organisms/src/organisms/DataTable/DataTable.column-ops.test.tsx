import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { DataTable, type DataTableColumn } from './DataTable'

interface Row {
  id: string
  name: string
  status: string
  amount: number
}

const ROWS: Row[] = [
  { id: '1', name: 'Alpha', status: 'Active', amount: 10 },
  { id: '2', name: 'Beta', status: 'Paused', amount: 20 },
  { id: '3', name: 'Gamma', status: 'Active', amount: 30 },
]

const NAME: DataTableColumn<Row> = { accessorKey: 'name', header: 'Name' }
const STATUS: DataTableColumn<Row> = { accessorKey: 'status', header: 'Status' }
const AMOUNT: DataTableColumn<Row> = {
  accessorKey: 'amount',
  header: 'Amount',
}
const COLUMNS: DataTableColumn<Row>[] = [NAME, STATUS, AMOUNT]

/** The rendered data rows — the empty-state row carries no `data-column` cell. */
function dataRows(container: HTMLElement): HTMLTableRowElement[] {
  return [
    ...container.querySelectorAll<HTMLTableRowElement>('tbody tr'),
  ].filter((row) => row.querySelector('td[data-column]'))
}

/** The header cells, in DOM order. */
function headCells(container: HTMLElement): HTMLTableCellElement[] {
  return [
    ...container.querySelectorAll<HTMLTableCellElement>(
      'thead th[data-column]',
    ),
  ]
}

/** Open one column's menu with the caller's user instance. */
async function openMenu(
  user: ReturnType<typeof userEvent.setup>,
  label: string,
) {
  await user.click(screen.getByRole('button', { name: `${label} column menu` }))
}

/**
 * Commit a value into a popover's filter input.
 *
 * One `input` event per value, not a keystroke at a time. A portaled input under
 * a focus-trapping machine is where jsdom's focus bookkeeping drops characters —
 * the keystrokes do land in Chromium, which is what
 * `DataTable.column-ops.browser.test.tsx` exists to prove. The commit path this
 * exercises is identical either way.
 */
function commitFilter(input: HTMLInputElement, value: string): void {
  input.focus()
  fireEvent.input(input, { target: { value } })
}

describe('DataTable column operations', () => {
  describe('resizing', () => {
    it('exposes a keyboard separator per column when resizable', () => {
      const { container } = render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={COLUMNS}
          pageSize={10}
          selectable={false}
          columnOps={{ resizable: true }}
        />
      ))
      const separators = screen.getAllByRole('separator')
      // One per data column (the select column is skipped).
      expect(separators).toHaveLength(3)
      const first = separators[0] as HTMLElement
      expect(first.getAttribute('aria-orientation')).toBe('vertical')
      expect(first.getAttribute('aria-valuenow')).toBe('150')
      expect(first.getAttribute('aria-valuemin')).toBe('20')
      expect(first.getAttribute('aria-valuemax')).toBe('10000')
      // The table sizes its columns from the state, so the handle moves layout.
      const col = container.querySelector('colgroup col') as HTMLElement
      expect(col.style.width).toBe('150px')
    })

    it('resizes by keyboard and reports the sizing state', async () => {
      const onColumnSizingChange = vi.fn()
      render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={COLUMNS}
          pageSize={10}
          selectable={false}
          columnOps={{ resizable: true }}
          onColumnSizingChange={onColumnSizingChange}
        />
      ))
      const user = userEvent.setup()
      const handle = screen.getAllByRole('separator')[0] as HTMLElement
      handle.focus()
      await user.keyboard('{ArrowRight}')
      expect(handle.getAttribute('aria-valuenow')).toBe('158')
      await user.keyboard('{Shift>}{ArrowLeft}{/Shift}')
      expect(handle.getAttribute('aria-valuenow')).toBe('126')
      await user.keyboard('{Home}')
      expect(handle.getAttribute('aria-valuenow')).toBe('20')
      expect(onColumnSizingChange).toHaveBeenCalled()
      const last = onColumnSizingChange.mock.calls.at(-1)?.[0] as Record<
        string,
        number
      >
      expect(last['name']).toBe(20)
    })

    it('honours per-column size bounds and resets on double click', async () => {
      const columns: DataTableColumn<Row>[] = [
        { accessorKey: 'name', header: 'Name', size: 120, maxSize: 200 },
        { accessorKey: 'status', header: 'Status', minSize: 80 },
      ]
      const { container } = render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={columns}
          pageSize={10}
          selectable={false}
          columnOps={{ resizable: true }}
        />
      ))
      const handles = screen.getAllByRole('separator')
      const first = handles[0] as HTMLElement
      const second = handles[1] as HTMLElement
      expect(first.getAttribute('aria-valuenow')).toBe('120')
      expect(first.getAttribute('aria-valuemax')).toBe('200')
      expect(second.getAttribute('aria-valuemin')).toBe('80')
      const col = container.querySelector('colgroup col') as HTMLElement
      expect(col.style.width).toBe('120px')

      const user = userEvent.setup()
      first.focus()
      await user.keyboard('{End}')
      expect(first.getAttribute('aria-valuenow')).toBe('200')
      await user.dblClick(first)
      expect(first.getAttribute('aria-valuenow')).toBe('120')
    })

    it('resizes by pointer drag between the handle edges', () => {
      const { container } = render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={COLUMNS}
          pageSize={10}
          selectable={false}
          columnOps={{ resizable: true }}
        />
      ))
      const handle = screen.getAllByRole('separator')[0] as HTMLElement
      handle.setPointerCapture = () => {}
      handle.releasePointerCapture = () => {}
      // jsdom reports zero widths, so the delta is the movement itself.
      handle.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerId: 1,
          clientX: 100,
        }),
      )
      handle.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          pointerId: 1,
          clientX: 140,
        }),
      )
      handle.dispatchEvent(
        new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }),
      )
      const col = container.querySelector('colgroup col') as HTMLElement
      expect(col.style.width).toBe('190px')
    })

    it('emits no separators and no colgroup when not resizable', () => {
      const { container } = render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={COLUMNS}
          pageSize={10}
          selectable={false}
        />
      ))
      expect(screen.queryAllByRole('separator')).toHaveLength(0)
      expect(container.querySelector('colgroup')).toBeNull()
    })
  })

  describe('reordering', () => {
    it('moves columns from the column menu', async () => {
      const onColumnOrderChange = vi.fn()
      render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={COLUMNS}
          pageSize={10}
          selectable={false}
          columnOps={{ reorderable: true }}
          onColumnOrderChange={onColumnOrderChange}
        />
      ))
      const user = userEvent.setup()
      await openMenu(user, 'Name')
      await user.click(
        await screen.findByRole('menuitem', { name: 'Move right' }),
      )
      expect(onColumnOrderChange).toHaveBeenCalledWith([
        'status',
        'name',
        'amount',
      ])
    })

    it('reorders by header drag', () => {
      const onColumnOrderChange = vi.fn()
      render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={COLUMNS}
          pageSize={10}
          selectable={false}
          columnOps={{ reorderable: true }}
          onColumnOrderChange={onColumnOrderChange}
        />
      ))
      const first = headCells(document.body)[0] as HTMLElement
      first.setPointerCapture = () => {}
      first.releasePointerCapture = () => {}
      first.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerId: 1,
          clientX: 50,
        }),
      )
      // jsdom has no layout, so every header reports a zero rect and the drop
      // lands past the last midpoint: the column goes to the end.
      first.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          pointerId: 1,
          clientX: 300,
        }),
      )
      first.dispatchEvent(
        new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }),
      )
      expect(onColumnOrderChange).toHaveBeenCalledWith([
        'status',
        'amount',
        'name',
      ])
    })

    it('keeps a controlled column order', () => {
      const [order, setOrder] = createSignal<string[]>()
      const { container } = render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={COLUMNS}
          pageSize={10}
          selectable={false}
          columnOps={{ reorderable: true }}
          columnOrder={order()}
          onColumnOrderChange={setOrder}
        />
      ))
      setOrder(['status', 'amount', 'name'])
      const cells = headCells(container)
      expect(cells.map((cell) => cell.getAttribute('data-column'))).toEqual([
        'status',
        'amount',
        'name',
      ])
    })

    it('skips the drag when it starts on a header control', () => {
      const onColumnOrderChange = vi.fn()
      render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={COLUMNS}
          pageSize={10}
          selectable={false}
          columnOps={{ reorderable: true }}
          onColumnOrderChange={onColumnOrderChange}
        />
      ))
      const sortButton = screen.getByRole('button', { name: 'Name' })
      sortButton.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerId: 1,
          clientX: 10,
        }),
      )
      window.dispatchEvent(
        new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }),
      )
      expect(onColumnOrderChange).not.toHaveBeenCalled()
    })
  })

  describe('multi-pin', () => {
    it('pins several columns to one edge from the menu', async () => {
      const onPinnedColumnsChange = vi.fn()
      const { container } = render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={COLUMNS}
          pageSize={10}
          selectable={false}
          columnOps={{ reorderable: true }}
          defaultPinnedStart="name"
          onPinnedColumnsChange={onPinnedColumnsChange}
        />
      ))
      const user = userEvent.setup()
      await openMenu(user, 'Status')
      await user.click(
        await screen.findByRole('menuitem', { name: 'Pin to start' }),
      )
      expect(onPinnedColumnsChange).toHaveBeenCalledWith({
        start: ['name', 'status'],
        end: [],
      })
      // The controlled value re-renders with both columns sticky.
      const cells = headCells(container)
      expect(cells[0]?.className).toContain('sticky')
      expect(cells[1]?.className).toContain('sticky')
      expect(cells[1]).toHaveAttribute('data-pin-edge', 'start')
    })

    it('accepts arrays for pinnedStart and pinnedEnd', () => {
      const { container } = render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={COLUMNS}
          pageSize={10}
          selectable={false}
          pinnedStart={['name', 'status']}
          pinnedEnd="amount"
        />
      ))
      const cells = headCells(container)
      expect(cells[0]?.className).toContain('sticky')
      expect(cells[0]).toHaveAttribute('data-pin-edge', 'start')
      expect(cells[1]?.className).toContain('sticky')
      expect(cells[1]).toHaveAttribute('data-pin-edge', 'start')
      expect(cells[2]?.className).toContain('sticky')
      expect(cells[2]).toHaveAttribute('data-pin-edge', 'end')
      // Body cells carry the same edge as their header.
      const bodyCells = [
        ...container.querySelectorAll('tbody tr td[data-column]'),
      ]
      expect(bodyCells[0]).toHaveAttribute('data-pin-edge', 'start')
    })

    it('unpins from the menu', async () => {
      const onPinnedColumnsChange = vi.fn()
      render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={COLUMNS}
          pageSize={10}
          selectable={false}
          columnOps={{ reorderable: true }}
          pinnedStart={['name', 'status']}
          onPinnedColumnsChange={onPinnedColumnsChange}
        />
      ))
      const user = userEvent.setup()
      await openMenu(user, 'Status')
      await user.click(await screen.findByRole('menuitem', { name: 'Unpin' }))
      expect(onPinnedColumnsChange).toHaveBeenCalledWith({
        start: ['name'],
        end: [],
      })
    })
  })

  describe('per-column filters', () => {
    it('filters through the header popover control', async () => {
      const onColumnFiltersChange = vi.fn()
      const { container } = render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={[
            { ...NAME, filterable: true },
            { ...STATUS, filterable: true },
            AMOUNT,
          ]}
          pageSize={10}
          selectable={false}
          columnOps={{ reorderable: true }}
          onColumnFiltersChange={onColumnFiltersChange}
        />
      ))
      const user = userEvent.setup()
      const filter = screen.getByRole('button', { name: 'Filter by Name' })
      await user.click(filter)
      const dialog = await screen.findByRole('dialog')
      const input = dialog.querySelector('input') as HTMLInputElement
      commitFilter(input, 'Alpha')
      expect(onColumnFiltersChange).toHaveBeenCalled()
      // Only Alpha matches; the trigger carries the open state.
      await waitFor(() => expect(dataRows(container)).toHaveLength(1))
      expect(dataRows(container)[0]?.textContent).toContain('Alpha')
      expect(filter.getAttribute('aria-expanded')).toBe('true')
    })

    it('offers the facet counts with their sizes', async () => {
      const { container } = render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={[
            { ...NAME, filterable: true },
            { ...STATUS, filterable: true },
            AMOUNT,
          ]}
          facets={{
            status: [
              { value: 'Active', count: 2 },
              { value: 'Paused', count: 1 },
            ],
          }}
          pageSize={10}
          selectable={false}
        />
      ))
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: 'Filter by Status' }))
      const facet = await screen.findByRole('button', { name: /Paused/ })
      expect(facet.textContent).toContain('1')
      await user.click(facet)
      await waitFor(() => expect(dataRows(container)).toHaveLength(1))
      expect(dataRows(container)[0]?.textContent).toContain('Beta')
    })

    it('clears a filter by emptying the control', async () => {
      const { container } = render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={[{ ...NAME, filterable: true }, ...COLUMNS.slice(1)]}
          pageSize={10}
          selectable={false}
        />
      ))
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: 'Filter by Name' }))
      const dialog = await screen.findByRole('dialog')
      const input = dialog.querySelector('input') as HTMLInputElement
      commitFilter(input, 'Alpha')
      await waitFor(() => expect(dataRows(container)).toHaveLength(1))
      commitFilter(input, '')
      await waitFor(() => expect(dataRows(container)).toHaveLength(3))
    })

    it('shows a range control for numeric between filters', async () => {
      const { container } = render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={[
            NAME,
            STATUS,
            {
              accessorKey: 'amount',
              header: 'Amount',
              filterable: true,
              filterFn: 'between',
            },
          ]}
          pageSize={10}
          selectable={false}
        />
      ))
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: 'Filter by Amount' }))
      await screen.findByRole('dialog')
      const low = screen.getByRole('spinbutton', { name: 'Amount minimum' })
      const high = screen.getByRole('spinbutton', { name: 'Amount maximum' })
      await user.type(low, '15')
      await user.type(high, '25')
      await waitFor(() => expect(dataRows(container)).toHaveLength(1))
    })

    it('keeps the global search separate from column filters', async () => {
      const { container } = render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={[{ ...NAME, filterable: true }, ...COLUMNS.slice(1)]}
          pageSize={10}
          selectable={false}
        />
      ))
      const user = userEvent.setup()
      const search = screen.getByRole('searchbox')
      await user.type(search, 'Gamma')
      await waitFor(() => expect(dataRows(container)).toHaveLength(1))
      await user.click(screen.getByRole('button', { name: 'Filter by Name' }))
      const dialog = await screen.findByRole('dialog')
      const input = dialog.querySelector('input') as HTMLInputElement
      commitFilter(input, 'Alpha')
      // Both filters are active at once: nothing matches both.
      await waitFor(() => expect(dataRows(container)).toHaveLength(0))
    })
  })

  describe('column menu', () => {
    it('renders sort, pin, move and size items for an operable column', async () => {
      render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={COLUMNS}
          pageSize={10}
          selectable={false}
          columnOps={{ resizable: true, reorderable: true }}
        />
      ))
      await openMenu(userEvent.setup(), 'Amount')
      expect(
        await screen.findByRole('menuitem', { name: 'Sort A → Z' }),
      ).toBeTruthy()
      expect(screen.getByRole('menuitem', { name: 'Sort Z → A' })).toBeTruthy()
      expect(
        screen.getByRole('menuitem', { name: 'Pin to start' }),
      ).toBeTruthy()
      expect(screen.getByRole('menuitem', { name: 'Pin to end' })).toBeTruthy()
      expect(screen.getByRole('menuitem', { name: 'Move left' })).toBeTruthy()
      expect(screen.getByRole('menuitem', { name: 'Move right' })).toBeTruthy()
      // Amount is resizable: the size reset lives here too.
      expect(screen.getByRole('menuitem', { name: 'Reset size' })).toBeTruthy()
    })

    it('sorts from the menu', async () => {
      const { container } = render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={COLUMNS}
          pageSize={10}
          selectable={false}
          columnOps={{ reorderable: true }}
        />
      ))
      const user = userEvent.setup()
      await openMenu(user, 'Name')
      await user.click(
        await screen.findByRole('menuitem', { name: 'Sort Z → A' }),
      )
      await waitFor(() =>
        expect(
          [...container.querySelectorAll('tbody tr td:first-child')].map(
            (cell) => cell.textContent,
          ),
        ).toEqual(['Gamma', 'Beta', 'Alpha']),
      )
    })

    it('disables Move left on the first column', async () => {
      render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={COLUMNS}
          pageSize={10}
          selectable={false}
          columnOps={{ reorderable: true }}
        />
      ))
      await openMenu(userEvent.setup(), 'Name')
      const move = await screen.findByRole('menuitem', { name: 'Move left' })
      expect(move.getAttribute('aria-disabled')).toBe('true')
    })

    it('renders no menu button when columnOps is absent', () => {
      render(() => (
        <DataTable
          title="Rows"
          rows={ROWS}
          columns={COLUMNS}
          pageSize={10}
          selectable={false}
        />
      ))
      expect(
        screen.queryByRole('button', { name: 'Name column menu' }),
      ).toBeNull()
    })
  })
})
