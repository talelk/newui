import { describe, expect, it } from 'vitest'
import { buildGaugeOption, METRIC_FONT_SIZE } from './gaugeOptions'
import type { ChartTokens } from './types'

const tokens: ChartTokens = {
  series: ['#1d4ed8'],
  grid: '#e5e7eb',
  axis: '#d1d5db',
  label: '#4b5563',
  metric: '#111827',
}

/** The keys the dial option carries, read as data. */
type OptionShape = {
  animation?: boolean
  series: {
    type: string
    axisLine: { lineStyle: { width: number; color: [number, string][] } }
    progress: { show: boolean; itemStyle: { color: string } }
    pointer: { show: boolean }
    axisTick: { show: boolean }
    detail: {
      offsetCenter: [number, number]
      fontSize: number
      color: string
      formatter: (value: unknown) => string
    }
    title: { show: boolean }
    data: { value: number; name: string }[]
  }[]
}

function build(config: {
  value: number | null
  min?: number
  max?: number
  caption?: string
  echartOptions?: Record<string, unknown>
}): OptionShape {
  return buildGaugeOption(
    {
      value: config.value,
      min: config.min ?? 0,
      max: config.max ?? 100,
      caption: config.caption,
      echartOptions: config.echartOptions,
    },
    { tokens },
  ) as unknown as OptionShape
}

describe('buildGaugeOption', () => {
  it('draws the house dial: 1px track, single blue arc, no needle', () => {
    const option = build({ value: 72 })
    const series = option.series[0]
    expect(series?.type).toBe('gauge')
    expect(series?.axisLine.lineStyle.width).toBe(1)
    expect(series?.progress.show).toBe(true)
    expect(series?.progress.itemStyle.color).toBe('#1d4ed8')
    expect(series?.pointer.show).toBe(false)
    expect(series?.axisTick.show).toBe(false)
  })

  it('prints the reading in metric type, centered', () => {
    const option = build({ value: 72 })
    const detail = option.series[0]?.detail
    expect(detail?.offsetCenter).toEqual([0, 0])
    expect(detail?.fontSize).toBe(METRIC_FONT_SIZE)
    expect(detail?.color).toBe('#111827')
  })

  it('applies the format callback', () => {
    const option = buildGaugeOption(
      { value: 72, min: 0, max: 100 },
      { tokens, format: (value) => `${value}%` },
    ) as unknown as OptionShape
    expect(option.series[0]?.detail.formatter(72)).toBe('72%')
  })

  it('leaves the dial empty when there is no reading', () => {
    const option = build({ value: null })
    expect(option.series[0]?.data).toEqual([])
  })

  it('shows the caption under the reading', () => {
    const option = build({ value: 72, caption: 'of target' })
    expect(option.series[0]?.title.show).toBe(true)
    expect(option.series[0]?.data[0]?.name).toBe('of target')
  })

  it('deep-merges the escape hatch', () => {
    const option = build({
      value: 1,
      min: 0,
      max: 10,
      echartOptions: { animation: false },
    })
    expect(option.animation).toBe(false)
  })

  it('falls back to the label ink when the metric token is missing', () => {
    const { metric: _metric, ...noMetric } = tokens
    const option = buildGaugeOption(
      { value: 1, min: 0, max: 10 },
      { tokens: noMetric },
    ) as unknown as OptionShape
    expect(option.series[0]?.detail.color).toBe('#4b5563')
  })
})
