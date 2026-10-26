import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { DataTable, type DataTableColumn } from './DataTable'

interface Row {
  id: string
  name: string
  amount: number
}

const ROWS: Row[] = [
  { id: '1', name: 'Alpha', amount: 10 },
  { id: '2', name: 'Beta', amount: 20 },
]

const COLUMNS: DataTableColumn<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    meta: { align: 'end', editable: true, editInput: 'number' },
  },
]

describe('DataTable pinning', () => {
  it('freezes the named columns to each scroll edge', () => {
    const { container } = render(() => (
      <DataTable
        title="Rows"
        rows={ROWS}
        columns={COLUMNS}
        pageSize={10}
        selectable={false}
        pinnedStart="name"
        pinnedEnd="amount"
      />
    ))
    const head = container.querySelector('thead') as HTMLElement
    const startTh = head.querySelector('th[scope="col"]') as HTMLElement
    expect(startTh.className).toContain('sticky')
    expect(startTh.className).toContain('start-0')
    const endTh = head.querySelectorAll('th[scope="col"]')[1] as HTMLElement
    expect(endTh.className).toContain('end-0')
    // Body cells carry the same stickiness as their header.
    const firstTd = container.querySelector('tbody td') as HTMLElement
    expect(firstTd.className).toContain('sticky')
  })

  it('leaves unpinned tables in plain flow', () => {
    const { container } = render(() => (
      <DataTable
        title="Rows"
        rows={ROWS}
        columns={COLUMNS}
        pageSize={10}
        selectable={false}
      />
    ))
    const th = container.querySelector('th[scope="col"]') as HTMLElement
    expect(th.className).not.toContain('sticky')
  })

  it('answers onPinnedColumnsChange only from the app (no in-table UI mutates pinning)', () => {
    const onPinnedColumnsChange = vi.fn()
    render(() => (
      <DataTable
        title="Rows"
        rows={ROWS}
        columns={COLUMNS}
        pageSize={10}
        selectable={false}
        pinnedStart="name"
        onPinnedColumnsChange={onPinnedColumnsChange}
      />
    ))
    // Sorting (the only in-table toggle) does not move pinning.
    const sortButton = screen.getByRole('button', { name: /Name/ })
    userEvent.click(sortButton)
    expect(onPinnedColumnsChange).not.toHaveBeenCalled()
  })
})

describe('DataTable inline editing', () => {
  it('renders a click-to-edit cell that reports the raw value', async () => {
    const onCellChange = vi.fn()
    const { container } = render(() => (
      <DataTable
        title="Rows"
        rows={ROWS}
        columns={COLUMNS}
        pageSize={10}
        selectable={false}
        editable
        onCellChange={onCellChange}
      />
    ))
    const trigger = screen.getByRole('button', {
      name: /— edit Amount of 1$/,
    })
    expect(trigger.textContent).toBe('10')
    await userEvent.click(trigger)
    const input = screen.getByRole('spinbutton', {
      name: 'Edit Amount of 1',
    }) as HTMLInputElement
    expect(document.activeElement).toBe(input)
    await userEvent.clear(input)
    await userEvent.type(input, '15{Enter}')
    expect(onCellChange).toHaveBeenCalledWith('1', 'amount', '15')
    // The edit trigger is gone once editing closes.
    expect(
      container.querySelector('[data-slot="data-table-edit-trigger"]'),
    ).toBeTruthy()
  })

  it('escapes an edit without reporting', async () => {
    const onCellChange = vi.fn()
    render(() => (
      <DataTable
        title="Rows"
        rows={ROWS}
        columns={COLUMNS}
        pageSize={10}
        selectable={false}
        editable
        onCellChange={onCellChange}
      />
    ))
    await userEvent.click(
      screen.getByRole('button', { name: /— edit Amount of 1$/ }),
    )
    await userEvent.keyboard('999{Escape}')
    expect(onCellChange).not.toHaveBeenCalled()
    // The cell shows the untouched value again.
    expect(
      screen.getByRole('button', { name: /— edit Amount of 1$/ }).textContent,
    ).toBe('10')
  })

  it('renders the updated value when the app owns the mutation', async () => {
    const [rows, setRows] = createSignal<Row[]>(ROWS)
    const { container } = render(() => (
      <DataTable
        title="Rows"
        rows={rows()}
        columns={COLUMNS}
        pageSize={10}
        selectable={false}
        editable
        onCellChange={(id, columnId, value) =>
          setRows((current) =>
            current.map((row) =>
              row.id === id ? { ...row, [columnId]: Number(value) } : row,
            ),
          )
        }
      />
    ))
    await userEvent.click(
      screen.getByRole('button', { name: /— edit Amount of 2$/ }),
    )
    const input = screen.getByRole('spinbutton', {
      name: 'Edit Amount of 2',
    }) as HTMLInputElement
    await userEvent.clear(input)
    await userEvent.type(input, '25{Enter}')
    await new Promise((resolve) => setTimeout(resolve, 0))
    // The editor closed onto the app-owned new value.
    const body = container.querySelector('tbody') as HTMLElement
    expect(body.textContent).toContain('25')
    expect(
      screen.queryByRole('spinbutton', { name: 'Edit Amount of 2' }),
    ).toBeNull()
  })

  it('renders plain cells when not editable', () => {
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
      screen.queryByRole('button', { name: /— edit Amount of 1$/ }),
    ).toBeNull()
  })
})
