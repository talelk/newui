import { describe, expect, it } from 'vitest'
import { type AggregateRow, aggregate, rollup, timeBucket } from './aggregate'

/** Local-time dates so the buckets do not depend on the runner's zone. */
const date = (year: number, month: number, day: number, hour = 0, min = 0) =>
  new Date(year, month - 1, day, hour, min)

describe('aggregate', () => {
  const rows: AggregateRow[] = [
    { region: 'north', amount: 10, tag: 'a' },
    { region: 'north', amount: 20, tag: 'a' },
    { region: 'south', amount: 5, tag: 'b' },
  ]

  it('groups by one column and computes sum and count', () => {
    const out = aggregate(rows, {
      by: 'region',
      metrics: {
        total: { field: 'amount', metric: 'sum' },
        n: { field: 'amount', metric: 'count' },
      },
    })
    expect(out).toEqual([
      { region: 'north', total: 30, n: 2 },
      { region: 'south', total: 5, n: 1 },
    ])
  })

  it('groups by several columns', () => {
    const out = aggregate(
      [
        { region: 'north', tag: 'a', amount: 1 },
        { region: 'north', tag: 'b', amount: 2 },
        { region: 'north', tag: 'a', amount: 3 },
      ],
      {
        by: ['region', 'tag'],
        metrics: { total: { field: 'amount', metric: 'sum' } },
      },
    )
    expect(out).toEqual([
      { region: 'north', tag: 'a', total: 4 },
      { region: 'north', tag: 'b', total: 2 },
    ])
  })

  it('computes min, max and extent', () => {
    const out = aggregate(rows, {
      by: 'region',
      metrics: {
        low: { field: 'amount', metric: 'min' },
        high: { field: 'amount', metric: 'max' },
        range: { field: 'amount', metric: 'extent' },
      },
    })
    expect(out[0]).toEqual({
      region: 'north',
      low: 10,
      high: 20,
      range: [10, 20],
    })
  })

  it('computes mean and median over numeric values only', () => {
    const out = aggregate(
      [
        { g: 'x', amount: 10 },
        { g: 'x', amount: 'nope' },
        { g: 'x', amount: 30 },
      ],
      {
        by: 'g',
        metrics: {
          avg: { field: 'amount', metric: 'mean' },
          mid: { field: 'amount', metric: 'median' },
        },
      },
    )
    expect(out[0]?.['avg']).toBe(20)
    expect(out[0]?.['mid']).toBe(20)

    const even = aggregate(
      [
        { g: 'x', amount: 1 },
        { g: 'x', amount: 3 },
      ],
      { by: 'g', metrics: { mid: { field: 'amount', metric: 'median' } } },
    )
    expect(even[0]?.['mid']).toBe(2)
  })

  it('computes unique and uniqueCount in first-seen order', () => {
    const out = aggregate(rows, {
      by: 'region',
      metrics: {
        tags: { field: 'tag', metric: 'unique' },
        tagCount: { field: 'tag', metric: 'uniqueCount' },
      },
    })
    expect(out[0]?.['tags']).toEqual(['a'])
    expect(out[0]?.['tagCount']).toBe(1)
    const all = aggregate(rows, {
      by: [],
      metrics: { tagCount: { field: 'tag', metric: 'uniqueCount' } },
    })
    expect(all).toHaveLength(1)
    expect(all[0]?.['tagCount']).toBe(2)
  })

  it('takes first and last values in row order', () => {
    const out = aggregate(rows, {
      by: 'region',
      metrics: {
        opener: { field: 'tag', metric: 'first' },
        closer: { field: 'tag', metric: 'last' },
      },
    })
    expect(out[0]?.['opener']).toBe('a')
    expect(out[0]?.['closer']).toBe('a')
    expect(out[1]?.['opener']).toBe('b')
  })

  it('groups dates by their instant, not their object identity', () => {
    const out = aggregate(
      [
        { day: date(2026, 1, 5), amount: 1 },
        { day: new Date(date(2026, 1, 5).getTime()), amount: 2 },
      ],
      { by: 'day', metrics: { total: { field: 'amount', metric: 'sum' } } },
    )
    expect(out).toHaveLength(1)
    expect(out[0]?.['total']).toBe(3)
  })

  it('handles empty input and missing fields', () => {
    expect(
      aggregate([], { by: 'a', metrics: { s: { field: 'b', metric: 'sum' } } }),
    ).toEqual([])
    const out = aggregate([{ g: 'x' }], {
      by: 'g',
      metrics: {
        sum: { field: 'missing', metric: 'sum' },
        min: { field: 'missing', metric: 'min' },
        count: { field: 'missing', metric: 'count' },
      },
    })
    expect(out[0]?.['sum']).toBe(0)
    expect(out[0]?.['min']).toBeUndefined()
    expect(out[0]?.['count']).toBe(1)
  })
})

describe('timeBucket', () => {
  const noon = date(2026, 3, 12, 14, 37) // Thursday afternoon

  it('floors to the hour and the day', () => {
    expect(timeBucket(noon, 'hour')).toEqual(date(2026, 3, 12, 14))
    expect(timeBucket(noon, 'day')).toEqual(date(2026, 3, 12))
  })

  it('starts weeks on Monday', () => {
    expect(timeBucket(noon, 'week')).toEqual(date(2026, 3, 9))
    expect(timeBucket(date(2026, 3, 8, 3), 'week')).toEqual(date(2026, 3, 2))
  })

  it('starts months, quarters and years on their first day', () => {
    expect(timeBucket(noon, 'month')).toEqual(date(2026, 3, 1))
    expect(timeBucket(noon, 'quarter')).toEqual(date(2026, 1, 1))
    expect(timeBucket(date(2026, 5, 20), 'quarter')).toEqual(date(2026, 4, 1))
    expect(timeBucket(noon, 'year')).toEqual(date(2026, 1, 1))
  })

  it('accepts ISO strings and epochs, and stays Invalid when unparseable', () => {
    const ms = date(2026, 3, 12, 14).getTime()
    expect(timeBucket(new Date(ms).toISOString(), 'day')).toEqual(
      date(2026, 3, 12),
    )
    expect(timeBucket(ms, 'day')).toEqual(date(2026, 3, 12))
    expect(Number.isNaN(timeBucket('not a date', 'day').getTime())).toBe(true)
  })
})

describe('rollup', () => {
  const rows = [
    { createdAt: date(2026, 1, 3, 9), amount: 5 },
    { createdAt: date(2026, 1, 3, 17), amount: 10 },
    { createdAt: date(2026, 1, 4, 9), amount: 7 },
    { createdAt: 'yesterday', amount: 1 },
  ]

  it('counts rows per bucket, ascending, skipping unparseable dates', () => {
    const series = rollup(rows, { field: 'createdAt', unit: 'day' })
    expect(series).toEqual([
      { bucket: date(2026, 1, 3), value: 2 },
      { bucket: date(2026, 1, 4), value: 1 },
    ])
  })

  it('applies a value metric per bucket', () => {
    const series = rollup(rows, {
      field: 'createdAt',
      unit: 'day',
      metric: { field: 'amount', metric: 'sum' },
    })
    expect(series.map((point) => point.value)).toEqual([15, 7])
  })

  it('buckets by month with a bare metric name', () => {
    const series = rollup(rows, {
      field: 'createdAt',
      unit: 'month',
      metric: 'count',
    })
    expect(series).toEqual([{ bucket: date(2026, 1, 1), value: 3 }])
  })

  it('keeps input order for first and last within a bucket', () => {
    const series = rollup(
      [
        { createdAt: date(2026, 1, 3, 17), label: 'late' },
        { createdAt: date(2026, 1, 3, 9), label: 'early' },
      ],
      {
        field: 'createdAt',
        unit: 'day',
        metric: { field: 'label', metric: 'first' },
      },
    )
    expect(series[0]?.value).toBe('late')
  })
})
