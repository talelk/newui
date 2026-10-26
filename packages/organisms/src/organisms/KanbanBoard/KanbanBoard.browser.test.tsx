import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { KanbanBoard, type KanbanColumn } from './KanbanBoard'

interface Deal {
  id: string
  name: string
}

const deals: Deal[] = [
  { id: 'D-1', name: 'Globex' },
  { id: 'D-2', name: 'Stark' },
]

function stages(): KanbanColumn<Deal>[] {
  return [
    { id: 'open', name: 'Open', theme: 'gray', items: deals },
    { id: 'won', name: 'Won', theme: 'green', items: [] },
  ]
}

const card = (deal: Deal) => <span>{deal.name}</span>

describe('KanbanBoard (browser, real CSS)', () => {
  it('reserves a real column width on a tinted, bordered surface', () => {
    const { container } = render(() => (
      <KanbanBoard columns={stages()} label="Deals">
        {card}
      </KanbanBoard>
    ))
    const column = container.querySelector(
      '[data-kanban-column="open"]',
    ) as HTMLElement
    // `w-72` (288px) below `min-[1440px]` — the board is a panner, columns do
    // not shrink to fit.
    const width = column.getBoundingClientRect().width
    expect(width).toBeGreaterThanOrEqual(256)
    expect(width).toBeLessThanOrEqual(300)
    const style = getComputedStyle(column)
    expect(Number.parseFloat(style.borderTopWidth)).toBeGreaterThan(0)
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('paints the status dot in the column theme', () => {
    const { container } = render(() => (
      <KanbanBoard columns={stages()} label="Deals">
        {card}
      </KanbanBoard>
    ))
    const dot = container.querySelector(
      '[data-kanban-column="open"] span[aria-hidden="true"]',
    ) as HTMLElement
    const rect = dot.getBoundingClientRect()
    expect(rect.width).toBeGreaterThan(0)
    expect(getComputedStyle(dot).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('gives each card the grab cursor and a real box', () => {
    const { container } = render(() => (
      <KanbanBoard columns={stages()} label="Deals">
        {card}
      </KanbanBoard>
    ))
    const cardBox = container.querySelector(
      '[data-kanban-id="D-1"] > [data-slot="card"]',
    ) as HTMLElement
    expect(cardBox.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(getComputedStyle(cardBox).cursor).toBe('grab')
  })

  it('draws the empty column as a dashed drop hint', () => {
    const { container } = render(() => (
      <KanbanBoard columns={stages()} label="Deals">
        {card}
      </KanbanBoard>
    ))
    const empty = container.querySelector(
      '[data-kanban-column="won"] ul li',
    ) as HTMLElement
    const style = getComputedStyle(empty)
    expect(style.borderTopStyle).toBe('dashed')
    expect(Number.parseFloat(style.borderTopWidth)).toBeGreaterThan(0)
  })
})
