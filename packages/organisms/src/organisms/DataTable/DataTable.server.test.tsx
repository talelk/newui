import { render, screen, waitFor, within } from '@solidjs/testing-library'
import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from '@tanstack/solid-table'
import userEvent from '@testing-library/user-event'
import { type Accessor, createSignal, untrack } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { DataTable, type DataTableColumn } from './DataTable'

interface Row {
  id: string
  name: string
  amount: number
}

const PAGE: Row[] = Array.from({ length: 10 }, (_, i) => ({
  id: `${i + 1}`,
  name: `Row ${i + 1}`,
  amount: (i + 1) * 10,
}))

const NEXT_PAGE: Row[] = Array.from({ length: 10 }, (_, i) => ({
  id: `${i + 11}`,
  name: `Row ${i + 11}`,
  amount: (i + 11) * 10,
}))

const COLUMNS: DataTableColumn<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'amount', header: 'Amount', meta: { align: 'end' } },
]

/** The composition an app makes: slices in, callbacks out. */
function serverTable(props: {
  rows?: Accessor<Row[]>
  total?: number
  sorting?: Accessor<SortingState>
  onSortingChange?: (sorting: SortingState) => void
  columnFilters?: Accessor<ColumnFiltersState>
  pagination?: Accessor<PaginationState>
  onPaginationChange?: (pagination: PaginationState) => void
}) {
  return render(() => (
    <DataTable
      title="Rows"
      rows={props.rows?.() ?? PAGE}
      columns={COLUMNS}
      pageSize={10}
      server={{ total: props.total ?? 25 }}
      {...(props.sorting
        ? { sorting: props.sorting(), onSortingChange: props.onSortingChange }
        : {})}
      {...(props.columnFilters ? { columnFilters: props.columnFilters() } : {})}
      {...(props.pagination
        ? {
            pagination: props.pagination(),
            onPaginationChange: props.onPaginationChange,
          }
        : {})}
    />
  ))
}

describe('DataTable server mode', () => {
  it('reports a sort request and returns to page 0', async () => {
    const [sorting, setSorting] = createSignal<SortingState>([])
    const [pagination, setPagination] = createSignal<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    })
    serverTable({
      sorting,
      onSortingChange: setSorting,
      pagination,
      onPaginationChange: setPagination,
    })
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(untrack(pagination).pageIndex).toBe(1)

    await userEvent.click(screen.getByRole('button', { name: /Name/ }))
    expect(untrack(sorting)).toEqual([{ id: 'name', desc: false }])
    expect(untrack(pagination).pageIndex).toBe(0)
  })

  it('leaves the row order to the server', () => {
    // Unsorted on purpose: a client-mode table would have reordered these on
    // a header click; here the order is whatever the next response carries.
    const unsorted: Row[] = [
      { id: '1', name: 'Zulu', amount: 30 },
      { id: '2', name: 'Alpha', amount: 10 },
    ]
    const { container } = render(() => (
      <DataTable
        title="Rows"
        rows={unsorted}
        columns={COLUMNS}
        server={{ total: 2 }}
        pageSize={10}
      />
    ))
    const first = container.querySelector('tbody td') as HTMLElement
    expect(first.textContent).toContain('Zulu')
  })

  it('keeps the page through the churn of paging', async () => {
    const [rows, setRows] = createSignal(PAGE)
    const [pagination, setPagination] = createSignal<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    })
    serverTable({
      rows,
      pagination,
      onPaginationChange: setPagination,
    })
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    // The second page arrives — the churn must not yank the table back to 0.
    setRows(NEXT_PAGE)
    await waitFor(() => expect(screen.getByText('Row 11')).toBeTruthy())
    expect(untrack(pagination).pageIndex).toBe(1)
    expect(screen.getByText('Row 11')).toBeTruthy()
  })

  it('trusts server.total as the count', () => {
    serverTable({ total: 25 })
    expect(screen.getByRole('status').textContent).toContain('25 records')
  })

  it('drives Next without a known total', async () => {
    const [pagination, setPagination] = createSignal<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    })
    serverTable({ total: -1, pagination, onPaginationChange: setPagination })
    const next = screen.getByRole('button', { name: 'Next page' })
    expect((next as HTMLButtonElement).disabled).toBe(false)
    await userEvent.click(next)
    expect(untrack(pagination).pageIndex).toBe(1)
    // No page numbers, no "of N" — the table does not know the end.
    expect(
      within(screen.getByRole('navigation')).queryByText(/of \d+/),
    ).toBeNull()
    expect(screen.queryByText(/of \d+/)).toBeNull()
  })

  it('reports the search term and starts over', async () => {
    const onGlobalFilterChange = vi.fn()
    const [pagination, setPagination] = createSignal<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    })
    render(() => (
      <DataTable
        title="Rows"
        rows={PAGE}
        columns={COLUMNS}
        pageSize={10}
        server={{ total: 25 }}
        globalFilter=""
        onGlobalFilterChange={onGlobalFilterChange}
        pagination={pagination()}
        onPaginationChange={setPagination}
      />
    ))
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(untrack(pagination).pageIndex).toBe(1)
    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Search rows' }),
      'beta',
    )
    expect(onGlobalFilterChange).toHaveBeenCalledWith('beta')
    expect(untrack(pagination).pageIndex).toBe(0)
  })

  it('reflects the app-controlled sort in the header', () => {
    const [sorting] = createSignal<SortingState>([{ id: 'name', desc: true }])
    serverTable({ sorting, onSortingChange: vi.fn() })
    expect(
      screen
        .getByRole('columnheader', { name: /Name/ })
        .getAttribute('aria-sort'),
    ).toBe('descending')
  })
})

describe('DataTable client mode is unchanged', () => {
  it('still resets the page when rows churn', async () => {
    const [rows, setRows] = createSignal<Row[]>([
      ...PAGE,
      ...NEXT_PAGE.slice(0, 5),
    ])
    render(() => (
      <DataTable title="Rows" rows={rows()} columns={COLUMNS} pageSize={10} />
    ))
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    await waitFor(() => expect(screen.getByText('Row 11')).toBeTruthy())
    setRows(PAGE)
    // Client mode: a new row set is a new query, so the page starts over.
    await waitFor(() => expect(screen.queryByText('Row 11')).toBeNull())
    expect(screen.getByText('Row 1')).toBeTruthy()
  })
})
