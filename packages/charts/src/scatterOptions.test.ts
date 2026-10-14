import { describe, expect, it } from 'vitest'
import { buildScatterOption, buildScatterSeries } from './scatterOptions'
import type { ChartTokens, ScatterChartConfig } from './types'

const tokens: ChartTokens = {
  series: ['#111111', '#222222', '#333333'],
  grid: 'grid-1',
  axis: 'axis-1',
  label: 'label-1',
}

const config = (
  overrides: Partial<ScatterChartConfig> = {},
): ScatterChartConfig => ({
  data: [
    { price: 10, score: 1, region: 'EU' },
    { price: 20, score: 2, region: 'US' },
    { price: 30, score: 3, region: 'EU' },
  ],
  xColumn: 'price',
  yColumn: 'score',
  ...overrides,
})

describe('buildScatterSeries', () => {
  it('groups the points by the split column, in first-appearance order', () => {
    const series = buildScatterSeries(config({ splitByColumn: 'region' }), {
      tokens,
    })
    expect(series.map((entry) => entry.name)).toEqual(['EU', 'US'])
    expect(series[0]?.points.map((point) => point.x)).toEqual([10, 30])
    expect(series[0]?.color).toBe('#111111')
    expect(series[1]?.color).toBe('#222222')
  })

  it('names the lone group after the y column when nothing splits it', () => {
    const series = buildScatterSeries(config(), { tokens })
    expect(series.map((entry) => entry.name)).toEqual(['score'])
    expect(series[0]?.points).toHaveLength(3)
  })

  it('drops a row that is missing either coordinate', () => {
    const series = buildScatterSeries(
      config({
        data: [
          { price: 10, score: 1 },
          { price: null, score: 2 },
          { price: 30, score: null },
        ],
      }),
      { tokens },
    )
    expect(series[0]?.points).toHaveLength(1)
  })

  it('maps the size column onto the symbol diameter across the whole plot', () => {
    const series = buildScatterSeries(
      config({
        sizeColumn: 'weight',
        data: [
          { price: 1, score: 1, weight: 10 },
          { price: 2, score: 2, weight: 20 },
        ],
      }),
      { tokens },
    )
    expect(series[0]?.points.map((point) => point.symbolSize)).toEqual([10, 35])
    expect(series[0]?.points.map((point) => point.size)).toEqual([10, 20])
  })

  it('collapses a single magnitude onto the middle of the size range', () => {
    const series = buildScatterSeries(
      config({
        sizeColumn: 'weight',
        data: [
          { price: 1, score: 1, weight: 5 },
          { price: 2, score: 2, weight: 5 },
        ],
      }),
      { tokens },
    )
    expect(series[0]?.points.map((point) => point.symbolSize)).toEqual([
      22.5, 22.5,
    ])
  })

  it('draws every point at the floor when there is no size column', () => {
    const series = buildScatterSeries(config(), { tokens })
    expect(series[0]?.points.every((point) => point.symbolSize === 10)).toBe(
      true,
    )
    expect(series[0]?.points.every((point) => point.size === null)).toBe(true)
  })
})

describe('buildScatterOption', () => {
  it('draws a scatter series on a pair of value axes that follow the data', () => {
    const option = buildScatterOption(config(), { tokens }) as unknown as {
      xAxis: { type: string; scale?: boolean; position?: string }
      yAxis: { type: string; scale?: boolean }
      series: { type: string; name: string; data: unknown[] }[]
    }
    expect(option.xAxis.type).toBe('value')
    expect(option.yAxis.type).toBe('value')
    expect(option.xAxis.scale).toBe(true)
    expect(option.xAxis.position).toBe('bottom')
    expect(option.series[0]?.type).toBe('scatter')
    expect(option.series[0]?.data).toHaveLength(3)
  })

  it('drops a group the legend has switched off', () => {
    const option = buildScatterOption(config({ splitByColumn: 'region' }), {
      tokens,
      hiddenSeries: ['EU'],
    }) as unknown as { series: { name: string }[] }
    expect(option.series.map((entry) => entry.name)).toEqual(['US'])
  })

  it('prints a point’s own name only when a label column names one', () => {
    const named = buildScatterOption(
      config({ labelColumn: 'region', showDataLabels: true }),
      { tokens },
    ) as unknown as { series: { label?: unknown; data: { name?: string }[] }[] }
    expect(named.series[0]?.data[0]?.name).toBe('EU')
    expect(named.series[0]?.label).toBeDefined()

    const unnamed = buildScatterOption(config({ showDataLabels: true }), {
      tokens,
    }) as unknown as { series: { label?: unknown }[] }
    expect(unnamed.series[0]?.label).toBeUndefined()
  })
})
