import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import {
  List,
  ListCell,
  ListGroup,
  ListHeader,
  ListHeaderCellSort,
  ListRow,
} from './List'

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

describe('List accessibility', () => {
  it('has no axe violations for a grouped list in the caller table contract', async () => {
    const { container } = render(() => (
      <List>
        {/* biome-ignore lint/a11y/useSemanticElements: the List family leaves the table roles to the caller, which cannot be a semantic `<table>` under the div grid. */}
        <div role="table" aria-label="Invoices">
          <ListGroup label="Today">
            {/* biome-ignore lint/a11y/useSemanticElements: rows come from the caller's table contract; `ListRow` cannot take a role. */}
            {/* biome-ignore lint/a11y/useFocusableInteractive: rows are containers; focus lives on the controls inside them. */}
            <div role="row">
              {/* biome-ignore lint/a11y/useSemanticElements: cells come from the caller's table contract, not from `ListCell`. */}
              <div role="cell">Acme</div>
              {/* biome-ignore lint/a11y/useSemanticElements: cells come from the caller's table contract, not from `ListCell`. */}
              <div role="cell">120.00</div>
            </div>
            {/* biome-ignore lint/a11y/useSemanticElements: rows come from the caller's table contract; `ListRow` cannot take a role. */}
            {/* biome-ignore lint/a11y/useFocusableInteractive: rows are containers; focus lives on the controls inside them. */}
            <div role="row">
              {/* biome-ignore lint/a11y/useSemanticElements: cells come from the caller's table contract, not from `ListCell`. */}
              <div role="cell">Globex</div>
              {/* biome-ignore lint/a11y/useSemanticElements: cells come from the caller's table contract, not from `ListCell`. */}
              <div role="cell">80.50</div>
            </div>
          </ListGroup>
        </div>
      </List>
    ))

    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a plain list with a header and rows', async () => {
    const { container } = render(() => (
      <List columns="auto minmax(0, 1fr)">
        <ListHeader>
          <span>Name</span>
          <span>Detail</span>
        </ListHeader>
        <ListRow height="h-12">
          <ListCell>Name</ListCell>
          <ListCell>Detail</ListCell>
        </ListRow>
      </List>
    ))

    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('takes the caller-supplied `columnheader` role on a sort cell', async () => {
    // `aria-sort` on a bare generic div is an `aria-allowed-attr` violation;
    // the cell forwards rest props so the caller's table contract can make
    // the role real. This test is the regression guard for that forwarding.
    const { container } = render(() => (
      <List>
        {/* biome-ignore lint/a11y/useSemanticElements: the List family leaves the table roles to the caller, which cannot be a semantic `<table>` under the div grid. */}
        <div role="table" aria-label="Invoices">
          {/* biome-ignore lint/a11y/useSemanticElements: the header row comes from the caller's table contract. */}
          {/* biome-ignore lint/a11y/useFocusableInteractive: header rows are containers; focus lives on the sort buttons inside them. */}
          <div
            role="row"
            class="grid grid-cols-[var(--list-columns)] items-center gap-3 px-2 pb-1"
          >
            <ListHeaderCellSort direction="asc" role="columnheader">
              Invoice
            </ListHeaderCellSort>
            <ListHeaderCellSort role="columnheader" align="end">
              Total
            </ListHeaderCellSort>
          </div>
          <ListRow height="h-12" role="row">
            <ListCell role="cell">INV-0001</ListCell>
            <ListCell role="cell">120.00</ListCell>
          </ListRow>
        </div>
      </List>
    ))

    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
    expect(
      container.querySelector('[data-sort="asc"]')?.getAttribute('role'),
    ).toBe('columnheader')
  })
})
