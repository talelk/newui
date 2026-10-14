import { describe, expect, it } from 'vitest'
import {
  buildFunnelOption,
  buildFunnelStages,
  funnelRamp,
} from './funnelOptions'
import type { ChartTokens, FunnelChartConfig } from './types'

const tokens: ChartTokens = {
  series: ['#111111', '#222222', '#333333'],
  grid: 'grid-1',
  axis: 'axis-1',
  label: 'label-1',
}

const config = (
  overrides: Partial<FunnelChartConfig> = {},
): FunnelChartConfig => ({
  data: [
    { stage: 'Visit', users: 100 },
    { stage: 'Signup', users: 40 },
    { stage: 'Pay', users: 10 },
  ],
  categoryColumn: 'stage',
  valueColumn: 'users',
  ...overrides,
})

type FunnelShape = {
  type: string
  sort?: string
  data: { name: string; value: number; itemStyle: { color?: string } }[]
  label: { align?: string; formatter: (params: unknown) => string }
}

const build = (overrides: Partial<FunnelChartConfig> = {}) =>
  buildFunnelOption(config(overrides), { tokens }) as unknown as {
    series: FunnelShape[]
  }

describe('buildFunnelStages', () => {
  it('keeps the process order and reads each stage against its neighbour', () => {
    const stages = buildFunnelStages(config())
    expect(stages.map((stage) => stage.label)).toEqual([
      'Visit',
      'Signup',
      'Pay',
    ])
    expect(stages.map((stage) => stage.percentOfFirst)).toEqual([100, 40, 10])
    // The first stage is its own whole, so it converts 100% of itself.
    expect(stages.map((stage) => stage.percentOfPrevious)).toEqual([
      100, 40, 25,
    ])
  })

  it('drops a stage that reports no number, or a negative one', () => {
    const stages = buildFunnelStages(
      config({
        data: [
          { stage: 'Visit', users: 100 },
          { stage: 'Signup', users: null },
          { stage: 'Pay', users: -4 },
          { stage: 'Renew', users: 20 },
        ],
      }),
    )
    expect(stages.map((stage) => stage.label)).toEqual(['Visit', 'Renew'])
  })

  it('reads an empty category as the blank marker', () => {
    const stages = buildFunnelStages(
      config({ data: [{ stage: '', users: 5 }] }),
    )
    expect(stages[0]?.label).toBe('(Blank)')
    expect(stages[0]?.name).toBe('')
  })
})

describe('funnelRamp', () => {
  it('reverses the sequential ramp so the deepest band is last', () => {
    expect(funnelRamp(config(), tokens, 3)).toEqual([
      '#333333',
      '#222222',
      '#111111',
    ])
  })

  it('draws a caller’s own list in the order it was written', () => {
    expect(funnelRamp(config({ palette: ['red', 'blue'] }), tokens, 3)).toEqual(
      ['red', 'blue', 'red'],
    )
  })
})

describe('buildFunnelOption', () => {
  it('draws one funnel series in the data order, painted from the ramp', () => {
    const series = build().series[0]
    expect(series?.type).toBe('funnel')
    expect(series?.sort).toBe('none')
    expect(series?.data.map((entry) => entry.name)).toEqual([
      'Visit',
      'Signup',
      'Pay',
    ])
    expect(series?.data.map((entry) => entry.value)).toEqual([100, 40, 10])
    expect(series?.data[0]?.itemStyle.color).toBe('#333333')
  })

  it('prints each stage name and value, and aligns to the reading direction', () => {
    const series = build({ dir: 'rtl' }).series[0]
    expect(series?.label.align).toBe('right')
    expect(series?.label.formatter({ name: 'Visit', value: 100 })).toBe(
      'Visit · 100',
    )
  })
})
