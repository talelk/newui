import { describe, expect, it } from 'vitest'
import {
  channelSeries,
  comparisonSeries,
  csv,
  filterTransactions,
  percentageChange,
  previousTransactions,
  regionSeries,
  revenueSeries,
  sortTransactions,
  statusSeries,
  summarize,
  transactions,
  updateTransactionStatus,
} from './data'

describe('analytics report', () => {
  it('keeps totals consistent with the selected region, period and query', () => {
    const rows = filterTransactions('Europe', 7, 'Direct')
    expect(rows.length).toBeGreaterThan(0)
    expect(
      rows.every(
        (row) =>
          row.region === 'Europe' && row.day >= 24 && row.channel === 'Direct',
      ),
    ).toBe(true)
    const total = rows
      .filter((row) => row.status === 'Paid')
      .reduce((sum, row) => sum + row.amount, 0)
    expect(summarize(rows).revenue).toBe(total)
    expect(
      revenueSeries(rows, 7).reduce((sum, row) => sum + row.Revenue, 0),
    ).toBe(total)
    expect(channelSeries(rows).reduce((sum, row) => sum + row.Revenue, 0)).toBe(
      total,
    )
  })
  it('sorts without changing the data and exports every matching row', () => {
    const rows = filterTransactions('all', 30, '')
    const sorted = sortTransactions(rows, 'amount', true)
    expect(sorted[0]?.amount).toBe(120)
    expect(sorted.at(-1)?.amount).toBe(
      Math.max(...transactions.map((row) => row.amount)),
    )
    expect(rows[0]?.id).toBe('INV-2401')
    expect(csv(sorted).split('\r\n')).toHaveLength(97)
  })
  it('quotes CSV content and handles empty datasets without NaN', () => {
    const first = transactions[0]
    if (!first) throw new Error('missing fixture')
    expect(csv([{ ...first, customer: 'Acme, "Studio"' }])).toContain(
      '"Acme, ""Studio"""',
    )
    expect(summarize(filterTransactions('all', 30, 'missing'))).toEqual({
      revenue: 0,
      orders: 0,
      average: 0,
      paidRate: 0,
    })
    expect(filterTransactions('all', 30, '', true)).toEqual([])
  })
})

it('applies payment changes immutably and keeps every breakdown consistent', () => {
  const pending = transactions.find((row) => row.status === 'Pending')
  if (!pending) throw new Error('missing pending transaction')
  const changed = updateTransactionStatus(transactions, pending.id, 'Paid')
  const original = summarize(transactions)
  const next = summarize(changed)
  expect(next.revenue).toBe(original.revenue + pending.amount)
  expect(transactions.find((row) => row.id === pending.id)?.status).toBe(
    'Pending',
  )
  expect(regionSeries(changed).reduce((sum, row) => sum + row.Revenue, 0)).toBe(
    next.revenue,
  )
  expect(
    statusSeries(changed).find((row) => row.status === 'Paid')?.Transactions,
  ).toBe(transactions.filter((row) => row.status === 'Paid').length + 1)
  const selected = filterTransactions(
    pending.region,
    30,
    pending.customer,
    false,
    changed,
  )
  expect(selected.find((row) => row.id === pending.id)?.status).toBe('Paid')
})

it('compares identical filtered cohorts and handles a zero prior value', () => {
  const selected = filterTransactions('Europe', 7, 'Direct')
  const previous = filterTransactions(
    'Europe',
    7,
    'Direct',
    false,
    previousTransactions,
  )
  const series = comparisonSeries(selected, previous, 7)
  expect(series.reduce((sum, row) => sum + row.Revenue, 0)).toBe(
    summarize(selected).revenue,
  )
  expect(series.reduce((sum, row) => sum + row.Previous, 0)).toBe(
    summarize(previous).revenue,
  )
  expect(percentageChange(110, 100)).toBeCloseTo(10)
  expect(percentageChange(110, 0)).toBeUndefined()
})
