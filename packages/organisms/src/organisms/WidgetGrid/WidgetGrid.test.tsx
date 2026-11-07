import { fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import {
  emptyWidgetGridConfig,
  materializeWidgetGridConfig,
  moveWidgetGrid,
  normalizeWidgetGridConfig,
  removeWidgetGrid,
  resetWidgetGridConfig,
  resizeWidgetGrid,
  resolveLayout,
  restoreWidgetGrid,
  type WidgetGridConfig,
} from './layout'
import { WidgetGrid } from './WidgetGrid'

const declared = [
  { id: 'kpi', span: 12, rows: 1 },
  { id: 'trend', span: 8, rows: 4 },
  { id: 'breakdown', span: 4, rows: 4 },
]

describe('widget grid layout', () => {
  it('auto-flows widgets with no config entries, in document order', () => {
    const layout = resolveLayout(declared, emptyWidgetGridConfig(), 12)
    expect(layout).toEqual([
      { id: 'kpi', x: 0, y: 0, span: 12, rows: 1 },
      { id: 'trend', x: 0, y: 1, span: 8, rows: 4 },
      { id: 'breakdown', x: 8, y: 1, span: 4, rows: 4 },
    ])
  })

  it('honours configured geometry over declared defaults', () => {
    const config: WidgetGridConfig = {
      v: 1,
      widgets: { trend: { x: 4, y: 2, span: 4, rows: 2 } },
    }
    const layout = resolveLayout(declared, config, 12)
    const trend = layout.find((placement) => placement.id === 'trend')
    expect(trend).toEqual({ id: 'trend', x: 4, y: 2, span: 4, rows: 2 })
  })

  it('skips hidden widgets entirely', () => {
    const config: WidgetGridConfig = {
      v: 1,
      widgets: { trend: { x: 0, y: 1, span: 8, rows: 4, hidden: true } },
    }
    const layout = resolveLayout(declared, config, 12)
    expect(layout.map((placement) => placement.id)).toEqual([
      'kpi',
      'breakdown',
    ])
  })

  it('pushes overlapping widgets down on a move, never overlapping', () => {
    const config: WidgetGridConfig = {
      v: 1,
      widgets: {
        kpi: { x: 0, y: 0, span: 12, rows: 1 },
        trend: { x: 0, y: 1, span: 8, rows: 4 },
        breakdown: { x: 8, y: 1, span: 4, rows: 4 },
      },
    }
    const next = moveWidgetGrid(declared, config, 12, 'kpi', { x: 0, y: 1 })
    const placements = resolveLayout(declared, next, 12)
    const byId = Object.fromEntries(
      placements.map((placement) => [placement.id, placement]),
    )
    expect(byId['kpi']).toMatchObject({ y: 1 })
    expect(byId['trend']?.y).toBeGreaterThanOrEqual(2)
    // Nothing overlaps anything.
    for (const a of placements) {
      for (const b of placements) {
        if (a.id === b.id) continue
        const overlap =
          a.x < b.x + b.span &&
          b.x < a.x + a.span &&
          a.y < b.y + b.rows &&
          b.y < a.y + a.rows
        expect(overlap, `${a.id} overlaps ${b.id}`).toBe(false)
      }
    }
  })

  it('resizes with push-down too: growing trend pushes breakdown away', () => {
    const config: WidgetGridConfig = {
      v: 1,
      widgets: {
        trend: { x: 0, y: 0, span: 8, rows: 4 },
        breakdown: { x: 8, y: 0, span: 4, rows: 4 },
      },
    }
    const next = resizeWidgetGrid(declared, config, 12, 'trend', {
      span: 10,
      rows: 4,
    })
    expect(next.widgets['trend']).toMatchObject({ span: 10 })
    expect(next.widgets['breakdown']?.y).toBe(4)
  })

  it('clamps a resize to the grid edge and to one row', () => {
    const config: WidgetGridConfig = {
      v: 1,
      widgets: { trend: { x: 8, y: 0, span: 4, rows: 2 } },
    }
    const grown = resizeWidgetGrid(declared, config, 12, 'trend', {
      span: 99,
      rows: 0,
    })
    expect(grown.widgets['trend']).toMatchObject({ span: 4, rows: 1 })
  })

  it('round-trips: a materialized document resolves to itself', () => {
    const layout = resolveLayout(declared, emptyWidgetGridConfig(), 12)
    const materialized = materializeWidgetGridConfig(
      layout,
      emptyWidgetGridConfig(),
    )
    expect(resolveLayout(declared, materialized, 12)).toEqual(layout)
    expect(resolveLayout(declared, materialized, 12)).toEqual(
      resolveLayout(declared, materialized, 12),
    )
  })

  it('keeps unknown entries when materializing (widgets not on screen)', () => {
    const config: WidgetGridConfig = {
      v: 1,
      widgets: { ghost: { x: 3, y: 3, span: 2, rows: 2 } },
    }
    const materialized = materializeWidgetGridConfig(
      resolveLayout(declared, config, 12),
      config,
    )
    expect(materialized.widgets['ghost']).toEqual({
      x: 3,
      y: 3,
      span: 2,
      rows: 2,
    })
  })

  it('tombstones removals and restores them with one flag', () => {
    const config: WidgetGridConfig = {
      v: 1,
      widgets: { trend: { x: 0, y: 1, span: 8, rows: 4 } },
    }
    const removed = removeWidgetGrid(declared, config, 12, 'trend')
    expect(removed.widgets['trend']).toMatchObject({ hidden: true, span: 8 })
    const restored = restoreWidgetGrid(removed, 'trend')
    expect(restored.widgets['trend']?.hidden).toBe(false)
    expect(restored.widgets['trend']?.span).toBe(8)
  })

  it('removes a widget that had no entry yet, keeping its geometry', () => {
    const removed = removeWidgetGrid(
      declared,
      emptyWidgetGridConfig(),
      12,
      'trend',
    )
    expect(removed.widgets['trend']).toMatchObject({
      hidden: true,
      span: 8,
      rows: 4,
    })
  })

  it('reset keeps tombstones and drops every override', () => {
    const config: WidgetGridConfig = {
      v: 1,
      widgets: {
        trend: { x: 5, y: 5, span: 3, rows: 3 },
        breakdown: { x: 0, y: 0, span: 1, rows: 1, hidden: true },
      },
    }
    const reset = resetWidgetGridConfig(config)
    expect(reset.widgets['trend']).toBeUndefined()
    expect(reset.widgets['breakdown']).toMatchObject({ hidden: true })
  })

  it('normalizes junk from storage into a safe document', () => {
    expect(normalizeWidgetGridConfig(null)).toEqual({ v: 1, widgets: {} })
    expect(normalizeWidgetGridConfig({ v: 2, widgets: {} })).toEqual({
      v: 1,
      widgets: {},
    })
    const normalized = normalizeWidgetGridConfig({
      v: 1,
      widgets: {
        bad: { x: -3, y: 1.6, span: 0, rows: 'x' },
        junk: 'nope',
      },
    })
    expect(normalized.widgets['bad']).toEqual({
      x: 0,
      y: 2,
      span: 1,
      rows: 1,
    })
    expect(normalized.widgets['junk']).toBeUndefined()
  })
})

function grid(props?: {
  config?: WidgetGridConfig
  editable?: boolean
  resettable?: boolean
  onConfigChange?: (config: WidgetGridConfig) => void
}) {
  return render(() => (
    <WidgetGrid
      editable={props?.editable}
      resettable={props?.resettable}
      config={props?.config}
      onConfigChange={props?.onConfigChange}
      label="Analytics"
    >
      <WidgetGrid.Widget id="kpi" span={12} rows={1} title="Totals">
        kpi
      </WidgetGrid.Widget>
      <WidgetGrid.Widget id="trend" span={8} rows={4} title="Trend">
        trend
      </WidgetGrid.Widget>
      <WidgetGrid.Widget id="breakdown" span={4} rows={4} title="Breakdown">
        breakdown
      </WidgetGrid.Widget>
    </WidgetGrid>
  ))
}

const placed = (id: string) =>
  document.querySelector<HTMLElement>(`[data-widget-id="${id}"]`)

describe('WidgetGrid', () => {
  it('places widgets by their resolved geometry', () => {
    grid()
    expect(placed('kpi')?.style.gridColumn).toBe('1 / span 12')
    expect(placed('trend')?.style.gridColumn).toBe('1 / span 8')
    expect(placed('trend')?.style.gridRow).toBe('2 / span 4')
    expect(placed('breakdown')?.style.gridColumn).toBe('9 / span 4')
  })

  it('gates every affordance behind `editable`', () => {
    const { unmount } = grid()
    expect(document.querySelectorAll('[role="separator"]')).toHaveLength(0)
    expect(
      screen.queryByRole('button', { name: 'Remove Trend widget' }),
    ).toBeNull()
    unmount()

    grid({ editable: true })
    expect(document.querySelectorAll('[role="separator"]')).toHaveLength(3)
    expect(
      screen.getByRole('button', { name: 'Remove Trend widget' }),
    ).toBeTruthy()
  })

  it('resizes by keyboard, reporting the whole document out', () => {
    const onConfigChange = vi.fn()
    // The way an app actually uses it: controlled, applying what it is told.
    const [config, setConfig] = createSignal<WidgetGridConfig>({
      v: 1,
      widgets: {
        trend: { x: 0, y: 0, span: 8, rows: 4 },
        breakdown: { x: 8, y: 0, span: 4, rows: 4 },
      },
    })
    render(() => (
      <WidgetGrid
        editable
        config={config()}
        onConfigChange={(next) => {
          setConfig(() => next)
          onConfigChange(next)
        }}
      >
        <WidgetGrid.Widget id="trend" span={8} rows={4} title="Trend">
          trend
        </WidgetGrid.Widget>
        <WidgetGrid.Widget id="breakdown" span={4} rows={4} title="Breakdown">
          breakdown
        </WidgetGrid.Widget>
      </WidgetGrid>
    ))
    const handle = screen.getByRole('separator', {
      name: 'Resize Trend widget',
    })
    fireEvent.keyDown(handle, { key: 'ArrowRight' })
    fireEvent.keyDown(handle, { key: 'ArrowDown' })
    expect(onConfigChange).toHaveBeenCalledTimes(2)
    const last = onConfigChange.mock.calls.at(-1)?.[0]
    expect(last?.widgets['trend']).toMatchObject({ span: 9, rows: 5 })
    // Growing trend over breakdown pushes breakdown down, twice.
    expect(last?.widgets['breakdown']?.y).toBe(5)
  })

  it('keyboard bounds: Home shrinks to minSpan, End spans the grid', () => {
    const onConfigChange = vi.fn()
    grid({
      editable: true,
      config: { v: 1, widgets: { trend: { x: 0, y: 0, span: 8, rows: 2 } } },
      onConfigChange,
    })
    const handle = screen.getByRole('separator', {
      name: 'Resize Trend widget',
    })
    fireEvent.keyDown(handle, { key: 'Home' })
    expect(onConfigChange.mock.calls.at(-1)?.[0].widgets['trend']?.span).toBe(1)
    fireEvent.keyDown(handle, { key: 'End' })
    expect(onConfigChange.mock.calls.at(-1)?.[0].widgets['trend']?.span).toBe(
      12,
    )
  })

  it('emits a tombstone when a widget is removed', () => {
    const onConfigChange = vi.fn()
    grid({
      editable: true,
      config: { v: 1, widgets: { trend: { x: 0, y: 0, span: 8, rows: 4 } } },
      onConfigChange,
    })
    fireEvent.click(screen.getByRole('button', { name: 'Remove Trend widget' }))
    const emitted = onConfigChange.mock.calls.at(-1)?.[0]
    expect(emitted.widgets['trend']).toMatchObject({ hidden: true })
  })

  it('renders nothing for a hidden widget, but keeps its entry', () => {
    grid({
      config: {
        v: 1,
        widgets: { trend: { x: 0, y: 0, span: 8, rows: 4, hidden: true } },
      },
    })
    expect(placed('trend')).toBeNull()
    expect(placed('breakdown')).toBeTruthy()
  })

  it('resets to the code defaults, keeping tombstones', () => {
    const onConfigChange = vi.fn()
    grid({
      editable: true,
      resettable: true,
      config: {
        v: 1,
        widgets: {
          trend: { x: 5, y: 5, span: 3, rows: 3 },
          breakdown: { x: 0, y: 0, span: 1, rows: 1, hidden: true },
        },
      },
      onConfigChange,
    })
    fireEvent.click(screen.getByRole('button', { name: 'Reset layout' }))
    const emitted = onConfigChange.mock.calls.at(-1)?.[0]
    expect(emitted.widgets['trend']).toBeUndefined()
    expect(emitted.widgets['breakdown']).toMatchObject({ hidden: true })
  })

  it('keeps working uncontrolled: changes land in the grid, not just on you', () => {
    const onConfigChange = vi.fn()
    grid({ editable: true, onConfigChange })
    const handle = screen.getByRole('separator', {
      name: 'Resize Trend widget',
    })
    fireEvent.keyDown(handle, { key: 'ArrowRight' })
    // The DOM follows the internal document: 9 columns wide now.
    expect(placed('trend')?.style.gridColumn).toBe('1 / span 9')
    expect(onConfigChange).toHaveBeenCalled()
  })
})
