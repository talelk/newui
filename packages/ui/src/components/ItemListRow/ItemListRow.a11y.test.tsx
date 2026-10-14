import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { ItemListRow } from './ItemListRow'

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

describe('ItemListRow accessibility', () => {
  it('has no axe violations for a plain row', async () => {
    const { container } = render(() => <ItemListRow>Row</ItemListRow>)
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations as an option inside a listbox', async () => {
    const { container } = render(() => (
      <div role="listbox" aria-label="Status">
        <ItemListRow role="option" aria-selected="true" selected>
          In progress
        </ItemListRow>
        <ItemListRow
          role="option"
          aria-selected="false"
          aria-disabled="true"
          disabled
        >
          Archived
        </ItemListRow>
      </div>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
