import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { FilterBar } from './FilterBar'

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

describe('FilterBar accessibility', () => {
  it('has no axe violations for a fully loaded bar', async () => {
    const { container } = render(() => (
      <FilterBar
        query={{ placeholder: 'Search expenses', value: 'taxi' }}
        selects={[
          {
            label: 'Owner',
            value: 'me',
            options: [
              { label: 'Anyone', value: 'any' },
              { label: 'Me', value: 'me' },
            ],
          },
        ]}
        tabs={{
          label: 'View',
          value: 'list',
          options: [
            { label: 'List', value: 'list' },
            { label: 'Board', value: 'board' },
          ],
        }}
        chips={[{ label: 'Status: Open', onRemove: () => {} }]}
        resultCount={24}
        onClearAll={() => {}}
      />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations for a bare bar with only a search box', async () => {
    const { container } = render(() => (
      <FilterBar surface="bare" query={{ placeholder: 'Search tickets' }} />
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
