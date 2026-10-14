import { describe, expect, it } from 'vitest'
import {
  buildAxisChartOption,
  buildDonutChartOption,
  buildDonutSlices,
  buildStackShares,
  mergeDeep,
  OTHERS_KEY,
  paletteColors,
  resolveSeriesColors,
  resolveXAxis,
} from './options'
import type {
  AxisChartConfig,
  AxisChartSeriesConfig,
  ChartTokens,
  DonutChartConfig,
} from './types'

const tokens: ChartTokens = {
  series: ['#111111', '#222222', '#333333'],
  grid: 'grid-1',
  axis: 'axis-1',
  label: 'label-1',
}

/** What `BarChart` hands the builder: the shared config, marked `'bar'`. */
function config(overrides: Partial<AxisChartConfig> = {}): AxisChartConfig {
  return {
    type: 'bar',
    data: [
      { month: 'Jan', sales: 10, refunds: 2 },
      { month: 'Feb', sales: 20, refunds: 4 },
    ],
    xAxis: { key: 'month', type: 'category' },
    series: [{ name: 'sales' }, { name: 'refunds' }],
    ...overrides,
  }
}

// A structural view of the generated option, so assertions stay typed without
// reaching for `any`.
type SeriesShape = {
  type: string
  name: string
  data: Array<{ value?: unknown; itemStyle?: { borderRadius?: unknown } }>
  stack?: string
  yAxisIndex: number
  itemStyle: { color?: string }
  label: {
    show: boolean
    position?: string
    color?: string
    formatter: (params: { value?: unknown }) => string
  }
  areaStyle?: { opacity: number }
  lineStyle?: { type?: unknown; color?: string }
  showSymbol?: boolean
}

type AxisShape = {
  type: string
  data?: unknown[]
  position?: string
  inverse?: boolean
  min?: number
  max?: number
  alignTicks?: boolean
  name?: string
  splitLine: { show: boolean; lineStyle?: { color?: string } }
  axisLine: { show: boolean; lineStyle?: { color?: string } }
  axisLabel: {
    color?: string
    hideOverlap?: boolean
    showMaxLabel?: boolean
    formatter: (...args: unknown[]) => string
  }
}

type OptionShape = {
  xAxis: AxisShape
  yAxis: AxisShape | AxisShape[]
  series: SeriesShape[]
  grid: { left?: number; outerBoundsContain?: string }
  tooltip: { trigger?: string; showContent?: boolean }
  animation?: boolean
}

function build(
  overrides: Partial<AxisChartConfig> = {},
  hiddenSeries?: string[],
): OptionShape {
  return buildAxisChartOption(config(overrides), {
    tokens,
    hiddenSeries,
  }) as unknown as OptionShape
}

function colorsFor(overrides: Partial<AxisChartConfig> = {}) {
  return resolveSeriesColors(config(overrides), tokens)
}

const barPairs = (series: SeriesShape) => series.data.map((item) => item.value)

const radiiOf = (series: SeriesShape) =>
  series.data.map((item) => item.itemStyle?.borderRadius)

describe('paletteColors', () => {
  it('samples the sequential ramp dark to light across the count', () => {
    expect(paletteColors(undefined, tokens, 3)).toEqual([
      '#111111',
      '#222222',
      '#333333',
    ])
    expect(paletteColors(undefined, tokens, 2)).toEqual(['#111111', '#333333'])
  })

  it('gives a lone series the darkest stop and cycles past the ramp', () => {
    expect(paletteColors(undefined, tokens, 1)).toEqual(['#111111'])
    expect(paletteColors(undefined, tokens, 4)).toEqual([
      '#111111',
      '#222222',
      '#333333',
      '#111111',
    ])
  })

  it('cycles a categorical ramp in order and an explicit list from its start', () => {
    expect(paletteColors('categorical', tokens, 4)).toEqual([
      '#111111',
      '#222222',
      '#333333',
      '#111111',
    ])
    expect(paletteColors(['red', 'blue'], tokens, 3)).toEqual([
      'red',
      'blue',
      'red',
    ])
  })

  it('returns nothing when there is no ramp to draw from', () => {
    expect(paletteColors(undefined, { ...tokens, series: [] }, 3)).toEqual([])
  })
})

describe('resolveSeriesColors', () => {
  it('defaults to the sequential ramp and honours explicit series colors', () => {
    expect(
      colorsFor({
        series: [{ name: 'sales' }, { name: 'refunds', color: 'red' }],
      }),
    ).toEqual({ sales: '#111111', refunds: 'red' })
  })

  it('keeps a series on its own color when a neighbour is hidden', () => {
    // Two series over a three-stop ramp: the ends, whatever else is visible.
    expect(colorsFor()).toEqual({ sales: '#111111', refunds: '#333333' })
  })
})

describe('resolveXAxis', () => {
  it('reads a plain column as categories and a date column as time', () => {
    expect(resolveXAxis(config()).type).toBe('category')
    expect(
      resolveXAxis(
        config({
          data: [
            { month: new Date('2024-01-01'), sales: 1 },
            { month: new Date('2024-02-01'), sales: 2 },
          ],
          xAxis: { key: 'month' },
        }),
      ).type,
    ).toBe('time')
  })

  it('never infers a value axis, but honours one that is asked for', () => {
    expect(
      resolveXAxis(config({ xAxis: { key: 'month', type: 'value' } })).type,
    ).toBe('value')
    // A horizontal chart has no value axis across the plot.
    expect(
      resolveXAxis(config({ xAxis: { key: 'month', type: 'value' } }), true)
        .type,
    ).toBe('category')
  })
})

describe('axis chart option axes', () => {
  it('puts categories on the x axis and values on the y axis', () => {
    const option = build()
    expect(option.xAxis.type).toBe('category')
    expect(option.xAxis.data).toEqual(['Jan', 'Feb'])
    expect(option.yAxis).toMatchObject({ type: 'value', position: 'left' })
  })

  it('swaps the axes and inverts the categories when horizontal', () => {
    const option = build({ horizontal: true })
    expect((option.yAxis as AxisShape).type).toBe('category')
    expect(option.xAxis.type).toBe('value')
    expect(option.xAxis.position).toBe('bottom')
    expect((option.yAxis as AxisShape).inverse).toBe(true)
  })

  it('inverts the category axis and flips the value axis in RTL', () => {
    const option = build({ dir: 'rtl' })
    expect(option.xAxis.inverse).toBe(true)
    expect((option.yAxis as AxisShape).position).toBe('right')
  })

  it('gridlines the value axis and baselines the category axis, in token ink', () => {
    const option = build()
    expect(option.xAxis.axisLabel.color).toBe('label-1')
    expect((option.yAxis as AxisShape).splitLine.show).toBe(true)
    expect((option.yAxis as AxisShape).splitLine.lineStyle?.color).toBe(
      'grid-1',
    )
    expect(option.xAxis.splitLine.show).toBe(false)
    expect((option.yAxis as AxisShape).axisLine.show).toBe(false)
    expect(option.xAxis.axisLine.lineStyle?.color).toBe('grid-1')
  })

  it('formats value ticks compactly and category ticks verbatim', () => {
    const option = build()
    expect((option.yAxis as AxisShape).axisLabel.formatter(1500)).toBe('1.5K')
    expect(option.xAxis.axisLabel.formatter('Jan')).toBe('Jan')
  })

  it('passes min and max through', () => {
    const option = build({ yAxis: { min: 0, max: 100 } })
    expect((option.yAxis as AxisShape).min).toBe(0)
    expect((option.yAxis as AxisShape).max).toBe(100)
  })
})

describe('axis chart option series', () => {
  it('emits one bar series per config entry as [category, value] pairs', () => {
    const option = build()
    expect(option.series).toHaveLength(2)
    expect(option.series[0]?.type).toBe('bar')
    expect(option.series[0]?.name).toBe('sales')
    expect(barPairs(option.series[0] as SeriesShape)).toEqual([
      ['Jan', 10],
      ['Feb', 20],
    ])
  })

  it('reverses the pair order when horizontal', () => {
    const option = build({ horizontal: true })
    expect(barPairs(option.series[0] as SeriesShape)).toEqual([
      [10, 'Jan'],
      [20, 'Feb'],
    ])
  })

  it('coerces blanks and non-numbers to null so marks are skipped', () => {
    const option = build({
      data: [
        { month: 'Jan', sales: '' },
        { month: 'Feb', sales: 'n/a' },
        { month: 'Mar', sales: '30' },
      ],
      series: [{ name: 'sales' }],
    })
    expect(barPairs(option.series[0] as SeriesShape)).toEqual([
      ['Jan', null],
      ['Feb', null],
      ['Mar', 30],
    ])
  })

  it('leaves series unstacked by default and stacks them by mark', () => {
    expect(build().series[0]?.stack).toBeUndefined()
    const stacked = build({ stacked: true })
    expect(stacked.series.map((s) => s.stack)).toEqual([
      'bar:stack',
      'bar:stack',
    ])
    // Only the outermost bar of the stack carries a rounded tip.
    expect(radiiOf(stacked.series[0] as SeriesShape)).toEqual([0, 0])
    expect(radiiOf(stacked.series[1] as SeriesShape)).toEqual([
      [4, 4, 0, 0],
      [4, 4, 0, 0],
    ])
  })

  it('draws a line series as line, and an area as line with a fill', () => {
    const line = build({ series: [{ name: 'sales', type: 'line' }] })
    expect(line.series[0]?.type).toBe('line')
    expect(line.series[0]?.areaStyle).toBeUndefined()

    const area = build({ series: [{ name: 'sales', type: 'area' }] })
    expect(area.series[0]?.type).toBe('line')
    expect(area.series[0]?.areaStyle?.opacity).toBeGreaterThan(0)
  })

  it('applies the resolved series color', () => {
    const option = build()
    expect(option.series[0]?.itemStyle.color).toBe('#111111')
    expect(option.series[1]?.itemStyle.color).toBe('#333333')
  })

  it('drops hidden series and keeps every color on its own series', () => {
    const option = build({}, ['sales'])
    expect(option.series.map((s) => s.name)).toEqual(['refunds'])
    expect(option.series[0]?.itemStyle.color).toBe('#333333')
  })

  it('hides data labels unless asked, and prints them in the series format', () => {
    expect(build().series[0]?.label.show).toBe(false)
    const option = build({
      series: [{ name: 'sales', showDataLabels: true, format: (v) => `$${v}` }],
    })
    expect(option.series[0]?.label.show).toBe(true)
    expect(option.series[0]?.label.position).toBe('top')
    expect(option.series[0]?.label.formatter({ value: ['Jan', 2500] })).toBe(
      '$2500',
    )
  })
})

describe('axis chart option normalized stack', () => {
  const normalized = config({
    stacked: 'normalized',
    data: [{ month: 'Jan', sales: 25, refunds: 75 }],
    series: [{ name: 'sales' }, { name: 'refunds' }],
  })

  it('plots each value as its share of its stack and pins the axis to 0-100', () => {
    const option = buildAxisChartOption(normalized, {
      tokens,
    }) as unknown as OptionShape
    expect(barPairs(option.series[0] as SeriesShape)).toEqual([['Jan', 25]])
    expect(barPairs(option.series[1] as SeriesShape)).toEqual([['Jan', 75]])
    const y = option.yAxis as AxisShape
    expect(y.min).toBe(0)
    expect(y.max).toBe(100)
    expect(y.axisLabel.formatter(25)).toBe('25%')
  })

  it('shares out the visible total, so hiding a series re-percentages the rest', () => {
    const threeWay = config({
      stacked: 'normalized',
      data: [{ month: 'Jan', a: 1, b: 1, c: 2 }],
      series: [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
    })
    const shares = buildStackShares(threeWay, ['c'])
    expect(shares.get('a')).toEqual([50])
    expect(shares.get('b')).toEqual([50])
    expect(shares.has('c')).toBe(false)
  })
})

describe('axis chart option second value axis', () => {
  const dualSeries: AxisChartSeriesConfig[] = [
    { name: 'sales' },
    { name: 'refunds', axis: 'y2' },
  ]

  it('draws the second axis opposite the primary and indexes the series', () => {
    const option = build({ series: dualSeries })
    const axes = option.yAxis as AxisShape[]
    expect(axes.map((a) => a.position)).toEqual(['left', 'right'])
    expect(axes[1]?.alignTicks).toBe(true)
    expect(axes[1]?.splitLine.show).toBe(false)
    expect(option.series.map((s) => s.yAxisIndex)).toEqual([0, 1])
  })

  it('ignores y2 on horizontal bars, where the value axis is x', () => {
    const option = build({ horizontal: true, series: dualSeries })
    expect(Array.isArray(option.xAxis)).toBe(false)
    expect(option.series.map((s) => s.yAxisIndex)).toEqual([0, 0])
  })
})

describe('axis chart option chrome and escape hatches', () => {
  it('keeps the echarts tooltip for its axis pointer but hides its content', () => {
    const option = build()
    expect(option.tooltip.trigger).toBe('axis')
    expect(option.tooltip.showContent).toBe(false)
  })

  it('deep merges echartOptions over the generated option', () => {
    const option = build({
      echartOptions: { grid: { left: 40 }, animation: false },
    })
    expect(option.grid.left).toBe(40)
    expect(option.grid.outerBoundsContain).toBe('all')
    expect(option.animation).toBe(false)
  })

  it('replaces arrays instead of merging them index-wise', () => {
    const option = build({ echartOptions: { series: [] } })
    expect(option.series).toEqual([])
  })
})

describe('mergeDeep', () => {
  it('merges objects key by key and replaces arrays', () => {
    expect(
      mergeDeep({ a: 1, b: { c: 2, d: 3 } }, { b: { c: 9 }, e: 4 }),
    ).toEqual({ a: 1, b: { c: 9, d: 3 }, e: 4 })
    expect(mergeDeep({ list: [1, 2] }, { list: [] })).toEqual({ list: [] })
  })
})

// ---------------------------------------------------------------------------
// Donut
// ---------------------------------------------------------------------------

function donutConfig(
  overrides: Partial<DonutChartConfig> = {},
): DonutChartConfig {
  return {
    data: [
      { channel: 'Search', visits: 50 },
      { channel: 'Direct', visits: 30 },
      { channel: 'Email', visits: 20 },
    ],
    categoryColumn: 'channel',
    valueColumn: 'visits',
    ...overrides,
  }
}

function slices(
  overrides: Partial<DonutChartConfig> = {},
  hiddenSlices?: string[],
) {
  return buildDonutSlices(donutConfig(overrides), { tokens, hiddenSlices })
}

function buildDonut(overrides: Partial<DonutChartConfig> = {}) {
  return buildDonutChartOption(donutConfig(overrides), {
    tokens,
  }) as unknown as {
    series: {
      type: string
      radius: string[]
      data: { name: string; value: number; itemStyle: { color?: string } }[]
      label: { show: boolean }
    }[]
  }
}

const rows = (count: number, start = 0) =>
  Array.from({ length: count }, (_, i) => ({
    channel: `c${start + i}`,
    visits: 100 - (start + i),
  }))

describe('buildDonutSlices', () => {
  it('sorts by value and shares out the total', () => {
    expect(
      slices({
        data: [
          { channel: 'Email', visits: 20 },
          { channel: 'Search', visits: 50 },
          { channel: 'Direct', visits: 30 },
        ],
      }).map((s) => [s.label, s.value, s.percent]),
    ).toEqual([
      ['Search', 50, 50],
      ['Direct', 30, 30],
      ['Email', 20, 20],
    ])
  })

  it('defaults to the categorical palette, cycling past its end', () => {
    expect(slices({ data: rows(4) }).map((s) => s.color)).toEqual([
      '#111111',
      '#222222',
      '#333333',
      '#111111',
    ])
  })

  it('takes a named ramp or an explicit color list', () => {
    expect(slices({ palette: 'sequential' }).map((s) => s.color)).toEqual([
      '#111111',
      '#222222',
      '#333333',
    ])
    expect(slices({ palette: ['red', 'blue'] }).map((s) => s.color)).toEqual([
      'red',
      'blue',
      'red',
    ])
  })

  it('skips rows with a missing, non-numeric or negative value', () => {
    expect(
      slices({
        data: [
          { channel: 'Search', visits: 50 },
          { channel: 'Direct', visits: null },
          { channel: 'Email', visits: 'n/a' },
          { channel: 'Refunds', visits: -10 },
          { channel: 'Events', visits: 0 },
        ],
      }).map((s) => s.label),
    ).toEqual(['Search', 'Events'])
  })

  it('labels a blank category rather than dropping it', () => {
    expect(slices({ data: [{ channel: '', visits: 5 }] })[0]?.label).toBe(
      '(Blank)',
    )
  })

  it('keeps repeated category values addressable one at a time', () => {
    expect(
      slices({
        data: [
          { channel: 'Search', visits: 50 },
          { channel: 'Search', visits: 20 },
        ],
      }).map((s) => s.name),
    ).toEqual(['Search', 'Search (2)'])
  })

  it('groups the tail into a single "Others" slice', () => {
    const grouped = slices({ data: rows(5), maxSlices: 3 })
    expect(grouped).toHaveLength(3)
    expect(grouped[2]?.name).toBe(OTHERS_KEY)
    expect(grouped[2]?.label).toBe('Others')
    const tail = rows(5)
      .slice(2)
      .reduce((sum, row) => sum + row.visits, 0)
    expect(grouped[2]?.value).toBe(tail)
    expect(grouped[2]?.isOthers).toBe(true)
  })

  it('re-percentages the visible total when a slice is hidden', () => {
    const hidden = slices({}, ['Direct'])
    expect(hidden.find((s) => s.name === 'Direct')?.percent).toBe(0)
    expect(hidden.find((s) => s.name === 'Search')?.percent).toBeCloseTo(
      71.43,
      1,
    )
  })
})

describe('buildDonutChartOption', () => {
  it('draws one pie series with a slice per visible row', () => {
    const option = buildDonut()
    expect(option.series).toHaveLength(1)
    expect(option.series[0]?.type).toBe('pie')
    expect(option.series[0]?.data.map((d) => d.name)).toEqual([
      'Search',
      'Direct',
      'Email',
    ])
    expect(option.series[0]?.data[0]?.itemStyle.color).toBe('#111111')
  })

  it('drops hidden slices from the ring but keeps them in the slices list', () => {
    const option = buildDonutChartOption(donutConfig(), {
      tokens,
      hiddenSlices: ['Direct'],
    }) as unknown as { series: { data: { name: string }[] }[] }
    expect(option.series[0]?.data.map((d) => d.name)).toEqual([
      'Search',
      'Email',
    ])
    expect(slices({}, ['Direct'])).toHaveLength(3)
  })

  it('switches the labels on with showDataLabels', () => {
    expect(buildDonut().series[0]?.label.show).toBe(false)
    expect(buildDonut({ showDataLabels: true }).series[0]?.label.show).toBe(
      true,
    )
  })
})
