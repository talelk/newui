import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { DataTable, type DataTableColumn } from './DataTable'

const AXE_OPTIONS = {
  rules: {
    'color-contrast': { enabled: false },
    region: { enabled: false },
  },
}

function summarize(results: AxeResults) {
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }))
}

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

describe('DataTable accessibility', () => {
  it('has no axe violations for a selectable table', async () => {
    const { container } = render(() => (
      <DataTable
        title="Expenses"
        rows={ROWS}
        columns={COLUMNS}
        pageSize={10}
        actionLabel="Approve"
        onRowsAction={() => {}}
        recordsLabel="expenses"
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a read-only table', async () => {
    const { container } = render(() => (
      <DataTable
        title="Expenses"
        rows={ROWS}
        columns={COLUMNS}
        pageSize={10}
        selectable={false}
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
