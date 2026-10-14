import { describe, expect, it } from 'vitest'
import {
  buildTooltipItems,
  seriesLabel,
  type TooltipItemsArgs,
} from './tooltipItems'
import type { AxisChartSeriesConfig, ChartTooltipItem } from './types'

// A rate beside the count behind it: two units, which is the case
// `tooltipColumns` exists for. `orders` is never drawn — it only prints in the
// tooltip.
const ROW = { month: 'Jan', conversion: 12, refund_rate: 3, orders: 1840 }

function items(overrides: Partial<TooltipItemsArgs> = {}): ChartTooltipItem[] {
  return buildTooltipItems({
    row: ROW,
    index: 0,
    series: [{ name: 'conversion' }, { name: 'refund_rate' }],
    hiddenSeries: [],
    colors: { conversion: '#111111', refund_rate: '#222222' },
    formatSeries: (_series, value) => `${value}%`,
    tooltipColumns: [{ name: 'orders', label: 'Orders' }],
    ...overrides,
  })
}

const labels = (rows: ChartTooltipItem[]) => rows.map((row) => row.label)

describe('a tooltip-only column', () => {
  it('prints in the tooltip', () => {
    expect(items().find((row) => row.name === 'orders')).toMatchObject({
      label: 'Orders',
      value: 1840,
      formattedValue: '1,840',
      kind: 'context',
    })
  })

  it('carries no color, so nothing invites the reader to find it on the plot', () => {
    expect(items().find((row) => row.name === 'orders')?.color).toBeUndefined()
  })

  it('prints after every series, whatever its magnitude', () => {
    // 1840 is the largest number in the row. Sorted among the series it would
    // lead the tooltip, which would read as the biggest contributor.
    expect(labels(items())).toEqual(['Conversion', 'Refund Rate', 'Orders'])
  })

  it('holds the order the author gave, rather than being ranked', () => {
    const rows = items({
      tooltipColumns: [
        { name: 'orders', label: 'Orders' },
        { name: 'refunds', label: 'Refunds' },
      ],
      row: { ...ROW, refunds: 9000 },
    })
    expect(labels(rows).slice(-2)).toEqual(['Orders', 'Refunds'])
  })

  it('survives a legend toggle that hides a series', () => {
    const rows = items({ hiddenSeries: ['conversion'] })
    expect(labels(rows)).toEqual(['Refund Rate', 'Orders'])
  })

  it('takes its format from its own config, not from an axis', () => {
    const rows = items({
      tooltipColumns: [
        {
          name: 'orders',
          label: 'Orders',
          format: (value) => `${value} orders`,
        },
      ],
    })
    // `formatSeries` prints a percent, because the series sit on a rate axis.
    // A column sits on no axis, so it never reaches that formatter.
    expect(rows.at(-1)?.formattedValue).toBe('1840 orders')
  })

  it('carries a text attribute as well as a number', () => {
    const rows = items({
      row: { ...ROW, category: 'Outerwear' },
      tooltipColumns: [{ name: 'category', label: 'Category' }],
    })
    expect(rows.at(-1)).toMatchObject({
      value: 'Outerwear',
      formattedValue: 'Outerwear',
    })
  })

  it('drops a blank cell rather than printing an empty row', () => {
    const rows = items({
      row: { ...ROW, orders: null, target: '' },
      tooltipColumns: [
        { name: 'orders', label: 'Orders' },
        { name: 'target', label: 'Target' },
      ],
    })
    expect(labels(rows)).toEqual(['Conversion', 'Refund Rate'])
  })

  it('keeps a zero, which is a reading like any other', () => {
    const rows = items({ row: { ...ROW, orders: 0 } })
    expect(rows.at(-1)?.formattedValue).toBe('0')
  })

  it('falls back to the column name when the entry names no label', () => {
    const rows = items({ tooltipColumns: [{ name: 'orders' }] })
    expect(rows.at(-1)?.label).toBe('Orders')
  })
})

describe('the series rows are untouched by it', () => {
  it('still ranks the series by magnitude', () => {
    const rows = items({ row: { ...ROW, conversion: 1, refund_rate: 50 } })
    expect(labels(rows)).toEqual(['Refund Rate', 'Conversion', 'Orders'])
  })

  it('marks a series row as one, so a caller can tell the two apart', () => {
    expect(items().map((row) => row.kind)).toEqual([
      'series',
      'series',
      'context',
    ])
  })

  it('drops a series whose cell is blank, keeping the rest', () => {
    const rows = items({
      row: { month: 'Jan', conversion: 12 },
      series: [{ name: 'conversion' }, { name: 'refund_rate' }],
    })
    expect(labels(rows)).toEqual(['Conversion'])
  })

  it('prints a share when the plot measures one, keyed to the row index', () => {
    const rows = items({
      shares: new Map([['conversion', [null, 40]]]),
      index: 1,
      tooltipColumns: [],
    })
    expect(rows[0]?.percent).toBe(40)
  })

  it('leaves the share off a series the plot does not stack', () => {
    expect(
      items().find((row) => row.name === 'conversion')?.percent,
    ).toBeUndefined()
  })

  it('prints a series value with the default grouping when no format is given', () => {
    const rows = buildTooltipItems({
      row: { month: 'Jan', sales: 1234.5 },
      index: 0,
      series: [{ name: 'sales' }],
    })
    expect(rows[0]?.formattedValue).toBe('1,234.5')
  })
})

describe('seriesLabel', () => {
  it('reads the series own label', () => {
    const series: AxisChartSeriesConfig = { name: 'sales', label: 'Sales' }
    expect(seriesLabel(series)).toBe('Sales')
  })

  it('falls back to the name, title-cased', () => {
    expect(seriesLabel({ name: 'refund_rate' })).toBe('Refund Rate')
  })
})
