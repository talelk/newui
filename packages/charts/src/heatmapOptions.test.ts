import { describe, expect, it } from 'vitest'
import {
  buildHeatmapMatrix,
  buildHeatmapOption,
  heatmapCategoryLabel,
  heatmapRampStops,
} from './heatmapOptions'
import type { ChartTokens, HeatmapChartConfig } from './types'

const tokens: ChartTokens = {
  series: ['#111111', '#222222', '#333333'],
  grid: 'grid-1',
  axis: 'axis-1',
  label: 'label-1',
}

const config = (
  overrides: Partial<HeatmapChartConfig> = {},
): HeatmapChartConfig => ({
  data: [
    { day: 'Mon', hour: '09', orders: 3 },
    { day: 'Mon', hour: '10', orders: 7 },
    { day: 'Tue', hour: '09', orders: 5 },
  ],
  xColumn: 'hour',
  yColumn: 'day',
  valueColumn: 'orders',
  ...overrides,
})

type HeatmapShape = {
  type: string
  data: { value: number[] }[]
}

describe('buildHeatmapMatrix', () => {
  it('collects both axes in first-appearance order and places each cell', () => {
    const matrix = buildHeatmapMatrix(config(), { tokens })
    expect(matrix.xCategories).toEqual(['09', '10'])
    expect(matrix.yCategories).toEqual(['Mon', 'Tue'])
    expect(matrix.cells.map((cell) => [cell.x, cell.y, cell.value])).toEqual([
      ['09', 'Mon', 3],
      ['10', 'Mon', 7],
      ['09', 'Tue', 5],
    ])
    expect(matrix.min).toBe(3)
    expect(matrix.max).toBe(7)
  })

  it('registers a category even when its value is missing, so no gap closes', () => {
    const matrix = buildHeatmapMatrix(
      config({
        data: [
          { day: 'Mon', hour: '09', orders: 3 },
          { day: 'Mon', hour: '10', orders: null },
        ],
      }),
      { tokens },
    )
    expect(matrix.xCategories).toEqual(['09', '10'])
    expect(matrix.cells).toHaveLength(1)
  })

  it('lets the later row win when two land on the same cell', () => {
    const matrix = buildHeatmapMatrix(
      config({
        data: [
          { day: 'Mon', hour: '09', orders: 3 },
          { day: 'Mon', hour: '09', orders: 9 },
        ],
      }),
      { tokens },
    )
    expect(matrix.cells).toHaveLength(1)
    expect(matrix.cells[0]?.value).toBe(9)
  })

  it('centers a diverging scale on zero and honours explicit ends', () => {
    const diverging = buildHeatmapMatrix(
      config({
        palette: 'diverging',
        data: [
          { day: 'Mon', hour: '09', orders: -4 },
          { day: 'Tue', hour: '09', orders: 12 },
        ],
      }),
      { tokens },
    )
    expect([diverging.min, diverging.max]).toEqual([-12, 12])

    const pinned = buildHeatmapMatrix(config({ min: 0, max: 100 }), { tokens })
    expect([pinned.min, pinned.max]).toEqual([0, 100])
  })
})

describe('heatmapRampStops', () => {
  it('samples the token ramp into the stops the visual map interpolates', () => {
    const stops = heatmapRampStops(config(), tokens)
    expect(stops).toHaveLength(8)
    expect(stops[0]).toBe('#111111')
  })
})

describe('heatmapCategoryLabel', () => {
  it('prints a blank category as the marker whatever the formatter does', () => {
    const values = new Map<string, unknown>([['(Blank)', undefined]])
    expect(
      heatmapCategoryLabel((value) => String(value), values, '(Blank)'),
    ).toBe('(Blank)')
    expect(heatmapCategoryLabel(() => 'X', new Map(), 'Mon')).toBe('X')
  })
})

describe('buildHeatmapOption', () => {
  it('draws a heatmap series keyed by the grid coordinates', () => {
    const option = buildHeatmapOption(config(), { tokens }) as unknown as {
      series: HeatmapShape[]
      visualMap: { min: number; max: number; inRange: { color: string[] } }
    }
    expect(option.series[0]?.type).toBe('heatmap')
    expect(option.series[0]?.data[0]?.value).toEqual([0, 0, 3])
    expect(option.visualMap).toMatchObject({ min: 3, max: 7 })
    expect(option.visualMap.inRange.color).toHaveLength(8)
  })

  it('drops the visual map floor below the data for a flat grid', () => {
    const option = buildHeatmapOption(
      config({
        data: [
          { day: 'Mon', hour: '09', orders: 5 },
          { day: 'Tue', hour: '09', orders: 5 },
        ],
      }),
      { tokens },
    ) as unknown as { visualMap: { min: number; max: number } }
    expect(option.visualMap.min).toBe(4)
    expect(option.visualMap.max).toBe(5)
  })
})
