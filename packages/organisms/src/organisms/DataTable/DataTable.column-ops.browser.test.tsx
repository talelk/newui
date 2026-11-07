import { render, screen } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
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

/** The rendered data rows — the empty-state row carries no `data-column` cell. */
function dataRows(container: HTMLElement): HTMLTableRowElement[] {
  return [...container.querySelectorAll('tbody tr')].filter((row) =>
    row.querySelector('td[data-column]'),
  ) as HTMLTableRowElement[]
}

/**
 * Keystroke coverage for the header filter popover.
 *
 * The unit suite drives the same control with one `input` event per value. This
 * is the file that proves the *keystrokes* land: a portal plus a focus-trapping
 * machine is exactly where jsdom's focus bookkeeping loses characters, so a
 * typed string is only meaningful in a real browser.
 */
describe('DataTable column filters (browser)', () => {
  it('filters as the header filter input is typed into', async () => {
    const { container } = render(() => (
      <DataTable
        title="Rows"
        rows={ROWS}
        columns={[{ ...NAME, filterable: true }, STATUS, AMOUNT]}
        pageSize={10}
        selectable={false}
      />
    ))
    const user = userEvent.setup()
    await user.click(
      await screen.findByRole('button', { name: 'Filter by Name' }),
    )
    const dialog = await screen.findByRole('dialog')
    const input = dialog.querySelector('input') as HTMLInputElement
    await user.type(input, 'Alpha')
    expect(input.value).toBe('Alpha')
    expect(dataRows(container)).toHaveLength(1)
    expect(dataRows(container)[0]?.textContent).toContain('Alpha')

    // Emptying the control commits nothing, so the whole set returns.
    await user.clear(input)
    expect(input.value).toBe('')
    expect(dataRows(container)).toHaveLength(3)
  })

  it('composes the column filter with the global search', async () => {
    const { container } = render(() => (
      <DataTable
        title="Rows"
        rows={ROWS}
        columns={[{ ...NAME, filterable: true }, STATUS, AMOUNT]}
        pageSize={10}
        selectable={false}
      />
    ))
    const user = userEvent.setup()
    await user.type(screen.getByRole('searchbox'), 'Gamma')
    await user.click(
      await screen.findByRole('button', { name: 'Filter by Name' }),
    )
    const dialog = await screen.findByRole('dialog')
    const input = dialog.querySelector('input') as HTMLInputElement
    await user.type(input, 'Alpha')
    expect(dataRows(container)).toHaveLength(0)
  })
})
