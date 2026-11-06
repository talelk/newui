import { describe, expect, it } from 'vitest'
import {
  brushCoords,
  brushFromEvent,
  buildBrushOption,
  buildZoomOption,
  windowCaption,
  windowedRows,
  zoomFromEvent,
  zoomStep,
} from './interactions'
import type { ChartZoomWindow } from './types'

const category = {
  values: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  type: 'category' as const,
}
const time = {
  values: ['2026-01-01', '2026-02-01', '2026-03-01', '2026-04-01'],
  type: 'time' as const,
}

describe('buildZoomOption', () => {
  it('opens the full window when none is set', () => {
    const { dataZoom } = buildZoomOption(category, undefined) as {
      dataZoom: { start: number; end: number }[]
    }
    expect(dataZoom[0]?.start).toBe(0)
    expect(dataZoom[1]).toBeUndefined()
    expect(dataZoom[0]?.end).toBe(100)
  })

  it('addresses a category window by index', () => {
    const { dataZoom } = buildZoomOption(category, {
      from: 'Feb',
      to: 'Apr',
    }) as { dataZoom: { startValue: number; endValue: number }[] }
    expect(dataZoom[0]?.startValue).toBe(1)
    expect(dataZoom[0]?.endValue).toBe(3)
  })

  it('addresses a time window by timestamp, not percent', () => {
    const { dataZoom } = buildZoomOption(time, {
      from: '2026-02-01',
      to: '2026-03-01',
    }) as { dataZoom: { startValue: number; endValue: number }[] }
    expect(dataZoom[0]?.startValue).toBe(new Date('2026-02-01').getTime())
    expect(dataZoom[0]?.endValue).toBe(new Date('2026-03-01').getTime())
    const raw = dataZoom[0] as Record<string, unknown>
    expect(raw['rangeMode']).toEqual(['value', 'value'])
  })
})

describe('zoomFromEvent', () => {
  it('reads category indices back as category values', () => {
    expect(zoomFromEvent({ startValue: 1, endValue: 3 }, category)).toEqual({
      from: 'Feb',
      to: 'Apr',
    })
  })

  it('reads percents as values when the payload carries none', () => {
    expect(zoomFromEvent({ start: 0, end: 50 }, category)).toEqual({
      from: 'Jan',
      to: 'Apr',
    })
  })

  it('reads a batch payload', () => {
    expect(
      zoomFromEvent({ batch: [{ startValue: 2, endValue: 4 }] }, category),
    ).toEqual({ from: 'Mar', to: 'May' })
  })

  it('keeps time payloads as values', () => {
    const start = new Date('2026-02-01').getTime()
    const end = new Date('2026-03-01').getTime()
    expect(zoomFromEvent({ startValue: start, endValue: end }, time)).toEqual({
      from: start,
      to: end,
    })
  })

  it('says nothing about a payload it cannot read', () => {
    expect(zoomFromEvent({}, category)).toBeUndefined()
    expect(zoomFromEvent(undefined, category)).toBeUndefined()
  })
})

describe('brushFromEvent', () => {
  it('collapses raw data indices to the values they span', () => {
    const payload = {
      batch: [
        {
          selected: [
            { seriesIndex: 0, dataIndex: [1, 2, 3] },
            { seriesIndex: 1, dataIndex: [0, 4] },
          ],
        },
      ],
    }
    expect(brushFromEvent(payload, category)).toEqual({
      from: 'Jan',
      to: 'May',
    })
  })

  it('reads an empty selection as cleared', () => {
    expect(brushFromEvent({ batch: [{ selected: [] }] }, category)).toBeNull()
    expect(brushFromEvent({ batch: [] }, category)).toBeNull()
  })
})

describe('buildBrushOption', () => {
  it('emits the current area so a rebuild restores the selection', () => {
    const { brush } = buildBrushOption(category, {
      from: 'Feb',
      to: 'Apr',
    }) as { brush: { areas: { coordRange: number[] }[] }[] }
    expect(brush[0]?.areas[0]?.coordRange).toEqual([1, 3])
  })

  it('emits no areas when nothing is selected', () => {
    const { brush } = buildBrushOption(category, null) as {
      brush: { areas: unknown[] }[]
    }
    expect(brush[0]?.areas).toEqual([])
  })
})

describe('brushCoords', () => {
  it('is the dispatch form of the same translation', () => {
    expect(brushCoords({ from: 'Feb', to: 'Apr' }, category)).toEqual({
      brushType: 'lineX',
      xAxisIndex: 0,
      coordRange: [1, 3],
    })
  })
})

describe('zoomStep', () => {
  const full = { from: 'Jan', to: 'Jun' }
  const middle = { from: 'Mar', to: 'Apr' }

  it('shrinks the window inward', () => {
    const next = zoomStep(full, category, 'in')
    expect(next.from === 'Jan' || next.to === 'Jun').toBe(false)
    const indices = [next.from, next.to].map((value) =>
      category.values.indexOf(String(value)),
    )
    expect(indices[0]).toBeGreaterThan(0)
    expect(indices[1]).toBeLessThan(5)
  })

  it('grows the window back out', () => {
    const next = zoomStep(middle, category, 'out')
    const first = category.values.indexOf(String(next.from))
    const last = category.values.indexOf(String(next.to))
    expect(first).toBeLessThan(2)
    expect(last).toBeGreaterThan(3)
  })

  it('slides the window with arrows and stays inside the column', () => {
    const left = zoomStep(middle, category, 'left')
    expect(category.values.indexOf(String(left.to))).toBeLessThan(3)
    const clamped = zoomStep({ from: 'Jan', to: 'Feb' }, category, 'left')
    expect(clamped).toEqual({ from: 'Jan', to: 'Feb' })
  })

  it('starts from the full column when no window is set', () => {
    const next = zoomStep(undefined, category, 'in')
    expect(category.values.indexOf(String(next.from))).toBeGreaterThan(0)
  })

  it('never zooms past two points', () => {
    let window: ChartZoomWindow = { from: 'Feb', to: 'Mar' }
    for (let step = 0; step < 6; step += 1)
      window = zoomStep(window, category, 'in')
    const first = category.values.indexOf(String(window.from))
    const last = category.values.indexOf(String(window.to))
    expect(last - first).toBeGreaterThanOrEqual(1)
  })
})

describe('windowedRows', () => {
  const rows = category.values.map((month, index) => ({
    month,
    value: index,
  }))

  it('keeps the rows inside the window', () => {
    const kept = windowedRows(
      rows,
      'month',
      { from: 'Feb', to: 'Apr' },
      category,
    )
    expect(kept.map((row) => row['month'])).toEqual(['Feb', 'Mar', 'Apr'])
  })

  it('keeps every row when no window is set', () => {
    expect(windowedRows(rows, 'month', undefined, category)).toHaveLength(6)
  })
})

describe('windowCaption', () => {
  it('names the window and the total', () => {
    expect(windowCaption({ from: 'Jan', to: 'Mar' }, 24)).toBe(
      'Showing Jan \u2013 Mar of 24 points',
    )
    expect(windowCaption(undefined, 24)).toBeUndefined()
  })
})
