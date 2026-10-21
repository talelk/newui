import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import {
  Table,
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableRow,
} from './Table'

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

describe('Table accessibility', () => {
  it('has no axe violations for a table with headers and a caption', async () => {
    const { container } = render(() => (
      <Table>
        <caption class="sr-only">Invoices</caption>
        <TableHead>
          <tr>
            <TableColumnHeader>Item</TableColumnHeader>
            <TableColumnHeader class="text-end">Amount</TableColumnHeader>
          </tr>
        </TableHead>
        <TableBody>
          <TableRow selected>
            <TableCell>Consulting</TableCell>
            <TableCell class="text-end">$4,200</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
