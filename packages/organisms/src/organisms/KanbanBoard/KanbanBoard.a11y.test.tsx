import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { KanbanBoard, type KanbanColumn } from './KanbanBoard'

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

interface Deal {
  id: string
  name: string
}

const deals: Deal[] = [
  { id: 'D-1', name: 'Globex' },
  { id: 'D-2', name: 'Stark' },
  { id: 'D-3', name: 'Wayne' },
]

function stages(): KanbanColumn<Deal>[] {
  return [
    { id: 'open', name: 'Open', theme: 'gray', items: deals },
    { id: 'won', name: 'Won', theme: 'green', items: [] },
  ]
}

const card = (deal: Deal) => <span>{deal.name}</span>

describe('KanbanBoard accessibility', () => {
  it('has no axe violations for a board with cards and an empty column', async () => {
    const { container } = render(() => (
      <KanbanBoard
        columns={stages()}
        label="Deals"
        itemLabel={(deal) => deal.name}
      >
        {card}
      </KanbanBoard>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })

  it('has no axe violations with a column summary, action and empty copy', async () => {
    const { container } = render(() => (
      <KanbanBoard
        label="Deals"
        columns={[
          {
            id: 'open',
            name: 'Open',
            items: [],
            summary: <span>$210,000</span>,
            action: { label: 'Add deal', onClick: () => {} },
          },
        ]}
        emptyColumn={() => <span>Nothing open.</span>}
      >
        {card}
      </KanbanBoard>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
