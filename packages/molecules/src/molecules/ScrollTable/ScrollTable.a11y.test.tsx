import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { ScrollTable, ScrollTableHead } from './ScrollTable'

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

describe('ScrollTable accessibility', () => {
  it('has no axe violations for a labelled table region with a sticky header', async () => {
    const { container } = render(() => (
      <ScrollTable label="Deals table" stickyHeader>
        <table>
          <ScrollTableHead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Amount</th>
              <th scope="col">Stage</th>
            </tr>
          </ScrollTableHead>
          <tbody>
            <tr>
              <td>Acme</td>
              <td>1,200</td>
              <td>Negotiation</td>
            </tr>
            <tr>
              <td>Globex</td>
              <td>980</td>
              <td>Closed won</td>
            </tr>
          </tbody>
        </table>
      </ScrollTable>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations without the sticky header', async () => {
    const { container } = render(() => (
      <ScrollTable label="Invoices table">
        <table>
          <ScrollTableHead>
            <tr>
              <th scope="col">Number</th>
              <th scope="col">Status</th>
            </tr>
          </ScrollTableHead>
          <tbody>
            <tr>
              <td>INV-0042</td>
              <td>Paid</td>
            </tr>
          </tbody>
        </table>
      </ScrollTable>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
