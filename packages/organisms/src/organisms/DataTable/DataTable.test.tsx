import { render, screen, waitFor, within } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
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
  { id: '3', name: 'Gamma', amount: 30 },
]

const COLUMNS: DataTableColumn<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: (context) => `$${context.getValue()}`,
    meta: { align: 'end' },
  },
]

const MOBILE_COLUMNS: DataTableColumn<Row>[] = [
  { accessorKey: 'name', header: 'Name', meta: { mobile: 'title' } },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: (context) => `$${context.getValue()}`,
    meta: { align: 'end', mobile: 'amount' },
  },
]

function table(props: Partial<Parameters<typeof DataTable<Row>>[0]> = {}) {
  return render(() => (
    <DataTable
      title="Rows"
      rows={ROWS}
      columns={COLUMNS}
      pageSize={10}
      {...props}
    />
  ))
}

describe('DataTable', () => {
  it('renders headers, cells and a labelled region', () => {
    table()
    expect(screen.getByRole('region', { name: 'Rows' })).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeTruthy()
    expect(screen.getByText('Alpha')).toBeTruthy()
    expect(screen.getByText('$30')).toBeTruthy()
    // Header row + three records.
    expect(screen.getAllByRole('row')).toHaveLength(4)
  })

  it('filters as you type and reports the count', async () => {
    table()
    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Search rows' }),
      'beta',
    )
    await waitFor(() => expect(screen.queryByText('Alpha')).toBeNull())
    expect(screen.getByText('Beta')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toContain('1')
  })

  it('selects rows and hands the ids to the bulk action', async () => {
    const onRowsAction = vi.fn()
    table({ onRowsAction, actionLabel: 'Archive selected' })
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select 1' }))
    const bulk = await screen.findByRole('button', {
      name: /Archive selected \(1\)/,
    })
    await userEvent.click(bulk)
    expect(onRowsAction).toHaveBeenCalledWith(['1'])
  })

  it('sorts from the header and marks the column', async () => {
    table()
    const header = screen.getByRole('button', { name: 'Amount' })
    await userEvent.click(header)
    await waitFor(() => {
      const cell = screen.getByRole('columnheader', { name: 'Amount' })
      expect(['ascending', 'descending']).toContain(
        cell.getAttribute('aria-sort'),
      )
    })
  })

  it('renders mobile cards from column meta', () => {
    table({ columns: MOBILE_COLUMNS })
    const cards = document.querySelector('[data-slot="data-table-cards"]')
    expect(cards).toBeTruthy()
    expect(within(cards as HTMLElement).getByText('Alpha')).toBeTruthy()
    expect(within(cards as HTMLElement).getByText('$30')).toBeTruthy()
  })

  it('skips ineligible rows in selection and select-all', async () => {
    const onRowsAction = vi.fn()
    table({
      columns: MOBILE_COLUMNS,
      rowSelectable: (row) => row.id !== '2',
      onRowsAction,
    })
    const tableRegion = screen.getByRole('region', { name: 'Rows table' })
    expect(
      within(tableRegion)
        .getAllByRole('checkbox', { name: 'Select 2' })
        .every((box) => box.hasAttribute('disabled')),
    ).toBe(true)
    await userEvent.click(
      within(tableRegion).getByRole('checkbox', {
        name: 'Select all rows on this page',
      }),
    )
    const bulk = await screen.findByRole('button', {
      name: /Update selected \(2\)/,
    })
    await userEvent.click(bulk)
    expect(onRowsAction).toHaveBeenCalledWith(['1', '3'])
  })

  it('keeps a stable titled toolbar when an external filter bar owns search', () => {
    render(() => (
      <DataTable title="Rows" rows={ROWS} columns={COLUMNS} hideSearch />
    ))
    const toolbar = document.querySelector('[data-slot="data-table-toolbar"]')
    expect(toolbar?.textContent).toContain('Rows')
    expect(
      document.querySelector('[data-slot="data-table-columns"]'),
    ).toBeTruthy()
  })

  it('renders the shared loading and error states', () => {
    const loading = render(() => (
      <DataTable title="Rows" rows={[]} columns={COLUMNS} loading />
    ))
    expect(screen.getByRole('status', { name: 'Loading' })).toBeTruthy()
    loading.unmount()
    render(() => (
      <DataTable title="Rows" rows={[]} columns={COLUMNS} error="Failed" />
    ))
    expect(screen.getByRole('alert')).toBeTruthy()
  })

  it('shows the mobile selection bar once a row is selected', async () => {
    table({ onRowsAction: () => {} })
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select 1' }))
    expect(document.querySelector('[data-slot="selection-bar"]')).toBeTruthy()
  })

  it('can be a read-only table with no selection column', () => {
    table({ selectable: false })
    expect(screen.queryByRole('checkbox', { name: /Select/ })).toBeNull()
  })
})
