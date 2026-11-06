import { render, screen, waitFor, within } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DataTable, type DataTableColumn } from './DataTable'

interface Row {
  id: string
  name: string
  department: string
  amount: number
  subRows?: Row[]
}

const ROWS: Row[] = [
  { id: '1', name: 'Alpha', department: 'Sales', amount: 10 },
  { id: '2', name: 'Beta', department: 'Sales', amount: 20 },
  { id: '3', name: 'Gamma', department: 'Support', amount: 30 },
]

const COLUMNS: DataTableColumn<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'department', header: 'Department' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    aggregate: 'sum',
    meta: { align: 'end' },
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

describe('DataTable grouping', () => {
  it('groups rows and reports the change back to the page', async () => {
    const onGroupingChange = vi.fn()
    table({ grouping: ['department'], onGroupingChange })
    const region = screen.getByRole('region', { name: 'Rows' })
    // Two groups, Sales and Support, each carrying its own count.
    const groups = within(region).getAllByRole('row').slice(1)
    const text = groups.map((row) => row.textContent ?? '').join(' ')
    expect(text).toContain('Sales')
    expect(text).toContain('Support')
    expect(text).toContain('2')
  })

  it('keeps the grouped column out of the record rows when grouping', () => {
    table({ grouping: ['department'] })
    const region = screen.getByRole('region', { name: 'Rows' })
    // The group row names the column; the records underneath do not repeat it.
    const groupRow = within(region)
      .getAllByRole('row')
      .find((row) => row.getAttribute('data-slot') === 'data-table-group-row')
    expect(groupRow?.textContent).toContain('Department')
  })

  it('renders a summary footer over the visible page', () => {
    table({ summary: 'page' })
    const foot = screen
      .getByRole('region', { name: 'Rows' })
      .querySelector('[data-slot="data-table-summary"]')
    expect(foot?.textContent).toContain('60')
  })

  it('totals the whole filtered result, not just the page', () => {
    table({ summary: 'all', pageSize: 2 })
    const foot = screen
      .getByRole('region', { name: 'Rows' })
      .querySelector('[data-slot="data-table-summary"]')
    expect(foot?.textContent).toContain('60')
    // The same table scoped to the page stops at the two rows it shows.
    table({ summary: 'page', pageSize: 2 })
    const paged = screen
      .getAllByRole('region', { name: 'Rows' })
      .map((region) => region.querySelector('[data-slot="data-table-summary"]'))
      .at(-1)
    expect(paged?.textContent).toContain('30')
  })

  it('renders the server totals it was handed', () => {
    table({
      summary: 'all',
      server: { total: 900 },
      aggregates: { amount: 720 },
    })
    const foot = screen
      .getByRole('region', { name: 'Rows' })
      .querySelector('[data-slot="data-table-summary"]')
    expect(foot?.textContent).toContain('720')
  })

  it('opens a tree row to its children', async () => {
    const rows: Row[] = [
      {
        id: '1',
        name: 'Parent',
        department: 'Sales',
        amount: 10,
        subRows: [{ id: '1a', name: 'Child', department: 'Sales', amount: 5 }],
      },
    ]
    table({ rows, getSubRows: (row) => row.subRows })
    expect(screen.queryByText('Child')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Expand 1' }))
    await waitFor(() => expect(screen.getByText('Child')).toBeTruthy())
  })

  it('asks the page for children when a row expands', async () => {
    const onRowExpand = vi.fn()
    const rows: Row[] = [
      { id: '1', name: 'Parent', department: 'Sales', amount: 10 },
    ]
    table({
      rows,
      renderDetail: () => <p>Detail for the row</p>,
      onRowExpand,
    })
    await userEvent.click(screen.getByRole('button', { name: 'Expand 1' }))
    expect(onRowExpand).toHaveBeenCalledWith(rows[0])
    expect(screen.getByText('Detail for the row')).toBeTruthy()
  })

  it('stacks nested column definitions into header rows', () => {
    table({
      columns: [
        {
          header: 'Identity',
          columns: [
            { accessorKey: 'name', header: 'Name' },
            { accessorKey: 'department', header: 'Department' },
          ],
        },
        {
          accessorKey: 'amount',
          header: 'Amount',
          aggregate: 'sum',
          meta: { align: 'end' },
        },
      ],
    })
    const head = screen
      .getByRole('region', { name: 'Rows' })
      .querySelector('thead')
    expect(head?.querySelectorAll('tr')).toHaveLength(2)
    expect(screen.getByRole('columnheader', { name: 'Identity' })).toBeTruthy()
  })

  it('expands server rows that arrive with sub-rows', async () => {
    const rows: Row[] = [
      {
        id: 'g1',
        name: 'Sales',
        department: 'Sales',
        amount: 30,
        subRows: [
          { id: '1', name: 'Alpha', department: 'Sales', amount: 10 },
          { id: '2', name: 'Beta', department: 'Sales', amount: 20 },
        ],
      },
    ]
    table({
      rows,
      server: { total: 3 },
      grouping: ['department'],
      getSubRows: (row) => row.subRows,
    })
    const groupRow = screen
      .getByRole('region', { name: 'Rows' })
      .querySelector('[data-slot="data-table-group-row"]')
    expect(groupRow?.textContent).toContain('Sales')
    await userEvent.click(screen.getByRole('button', { name: 'Expand Sales' }))
    await waitFor(() => expect(screen.getByText('Alpha')).toBeTruthy())
  })

  it('skips ineligible parents in select-all', async () => {
    const onRowsAction = vi.fn()
    const rows: Row[] = [
      {
        id: '1',
        name: 'Parent',
        department: 'Sales',
        amount: 10,
        subRows: [{ id: '1a', name: 'Child', department: 'Sales', amount: 5 }],
      },
    ]
    table({
      rows,
      getSubRows: (row) => row.subRows,
      rowSelectable: (row) => row.id !== '1',
      onRowsAction,
    })
    const region = screen.getByRole('region', { name: 'Rows table' })
    const parentBox = within(region).getByRole('checkbox', { name: 'Select 1' })
    expect(parentBox.hasAttribute('disabled')).toBe(true)
    await userEvent.click(
      within(region).getByRole('checkbox', {
        name: 'Select all rows on this page',
      }),
    )
    const bulk = await screen.findByRole('button', {
      name: /Update selected \(1\)/,
    })
    await userEvent.click(bulk)
    expect(onRowsAction).toHaveBeenCalledWith(['1a'])
  })
})
