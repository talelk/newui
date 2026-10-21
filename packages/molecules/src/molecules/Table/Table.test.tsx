import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import {
  Table,
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableRow,
} from './Table'

function renderTable() {
  return render(() => (
    <Table>
      <TableHead>
        <tr>
          <TableColumnHeader>Item</TableColumnHeader>
        </tr>
      </TableHead>
      <TableBody>
        <TableRow selected>
          <TableCell>Consulting</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ))
}

describe('Table', () => {
  it('renders the native table parts with data-slot hooks', () => {
    const { container } = renderTable()
    expect(container.querySelector('table[data-slot="table"]')).toBeTruthy()
    expect(
      container.querySelector('thead[data-slot="table-head"]'),
    ).toBeTruthy()
    expect(
      container.querySelector('tbody[data-slot="table-body"]'),
    ).toBeTruthy()
    expect(container.querySelector('tr[data-slot="table-row"]')).toBeTruthy()
    expect(container.querySelector('td[data-slot="table-cell"]')).toBeTruthy()
  })

  it('header cells default to column scope', () => {
    const { container } = renderTable()
    const th = container.querySelector('th[data-slot="table-column-header"]')
    expect(th?.getAttribute('scope')).toBe('col')
  })

  it('marks the selected row through the data attribute', () => {
    const { container } = renderTable()
    const row = container.querySelector('tr[data-slot="table-row"]')
    expect(row?.hasAttribute('data-selected')).toBe(true)
  })
})
