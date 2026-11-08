import { beforeEach, describe, expect, it } from 'vitest'
import {
  advanceDemoData,
  createCsvTable,
  createTransactionRepository,
  filterTransactions,
  previousWindow,
  queryTransactions,
  restoreTransactions,
  snapshotTransactions,
  statusSeries,
  summarize,
  type Transaction,
} from './analytics'

/**
 * The analytics data seam is the page's backend: window filtering, the
 * cross-filter, sorting, paging, aggregates and the CSV shape. The screens
 * are covered by the browser suite; this covers the seam they sit on —
 * including that the seed is deterministic, which is what makes the charts
 * and the export reviewable.
 */

const DAY = 86_400_000

/** The window every test reads: the whole seeded history. */
function windowOf(days = 365) {
  const to = new Date()
  return { from: new Date(to.getTime() - days * DAY), to }
}

/** The pristine seed, captured once; every test starts from it. */
const SEED = snapshotTransactions()

beforeEach(() => {
  // The store is module-level, like a real backend's; undo it between tests.
  restoreTransactions(SEED)
})

describe('the seed', () => {
  it('is deterministic: the same rows on every read', () => {
    const first = filterTransactions(windowOf())
    const second = filterTransactions(windowOf())
    expect(first.map((row) => row.id)).toEqual(second.map((row) => row.id))
    expect(first.length).toBeGreaterThan(500)
  })

  it('uses only the declared vocabulary', () => {
    for (const row of filterTransactions(windowOf())) {
      expect(['Paid', 'Pending', 'Refunded']).toContain(row.status)
      expect(row.amount).toBeGreaterThan(0)
      expect(row.day).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})

describe('filterTransactions', () => {
  it('honours the window on both ends', () => {
    const { from, to } = windowOf(14)
    for (const row of filterTransactions({ from, to })) {
      const day = Date.parse(`${row.day}T00:00:00`)
      expect(day).toBeGreaterThanOrEqual(from.getTime() - DAY)
      expect(day).toBeLessThanOrEqual(to.getTime())
    }
  })

  it('filters by region and channel, and `all` is no filter', () => {
    const all = filterTransactions({ ...windowOf(), region: 'all' })
    const europe = filterTransactions({ ...windowOf(), region: 'Europe' })
    expect(europe.length).toBeLessThan(all.length)
    for (const row of europe) expect(row.region).toBe('Europe')
    const paidSearch = filterTransactions({
      ...windowOf(),
      channel: 'Paid search',
    })
    for (const row of paidSearch) expect(row.channel).toBe('Paid search')
  })

  it('applies the cross-filter column/value pair', () => {
    const rows = filterTransactions({
      ...windowOf(),
      cross: { column: 'channel', value: 'Organic' },
    })
    for (const row of rows) expect(row.channel).toBe('Organic')
    const statusCross = filterTransactions({
      ...windowOf(),
      cross: { column: 'status', value: 'Refunded' },
    })
    for (const row of statusCross) expect(row.status).toBe('Refunded')
  })

  it('searches across ref, customer, channel, region and status', () => {
    const one = filterTransactions({ ...windowOf(), search: 'TX-000' })
    expect(one.length).toBeGreaterThan(0)
    const none = filterTransactions({ ...windowOf(), search: 'zzzz-nope' })
    expect(none).toHaveLength(0)
  })

  it('sorts numerically and textually, ascending and descending', () => {
    const asc = filterTransactions({
      ...windowOf(),
      sorting: [{ id: 'amount', desc: false }],
    })
    for (let i = 1; i < asc.length; i += 1) {
      const before = asc[i - 1]
      const after = asc[i]
      if (!before || !after) throw new Error('expected a row')
      expect(after.amount).toBeGreaterThanOrEqual(before.amount)
    }
    const desc = filterTransactions({
      ...windowOf(),
      sorting: [{ id: 'customer', desc: true }],
    })
    for (let i = 1; i < desc.length; i += 1) {
      const before = desc[i - 1]
      const after = desc[i]
      if (!before || !after) throw new Error('expected a row')
      expect(
        before.customer.localeCompare(after.customer),
      ).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('queryTransactions', () => {
  it('pages without losing or duplicating rows', () => {
    const query = { ...windowOf(), pageIndex: 0, pageSize: 25 }
    const page1 = queryTransactions(query)
    const page2 = queryTransactions({ ...query, pageIndex: 1 })
    expect(page1.rows).toHaveLength(25)
    expect(page2.total).toBe(page1.total)
    const overlap = page1.rows.filter((row) =>
      page2.rows.some((other) => other.id === row.id),
    )
    expect(overlap).toHaveLength(0)
    const last = queryTransactions({
      ...query,
      pageIndex: Math.ceil(page1.total / 25) - 1,
    })
    expect(last.rows.length).toBeGreaterThan(0)
    expect(last.rows.length + (Math.ceil(page1.total / 25) - 1) * 25).toBe(
      page1.total,
    )
  })
})

describe('aggregates', () => {
  it('summarizes paid revenue, orders and the paid rate', () => {
    const rows: Transaction[] = [
      {
        id: 'A',
        customer: 'A',
        channel: 'Direct',
        region: 'Europe',
        status: 'Paid',
        day: '2026-01-01',
        amount: 100,
      },
      {
        id: 'B',
        customer: 'B',
        channel: 'Direct',
        region: 'Europe',
        status: 'Pending',
        day: '2026-01-01',
        amount: 50,
      },
    ]
    const summary = summarize(rows)
    expect(summary.revenue).toBe(100)
    expect(summary.orders).toBe(2)
    expect(summary.paidRate).toBe(50)
  })

  it('shifts the window back by exactly its own length', () => {
    const from = new Date(2026, 5, 1)
    const to = new Date(2026, 5, 15)
    const previous = previousWindow({ preset: 'custom', from, to })
    // The window is inclusive, so its length is 15 days, not 14.
    expect(previous.to.getTime()).toBe(from.getTime() - DAY)
    expect(previous.from.getTime()).toBe(from.getTime() - 15 * DAY)
  })

  it('counts every status for the donut', () => {
    const series = statusSeries(windowOf().from, windowOf().to)
    const total = series.reduce((sum, row) => sum + row.Transactions, 0)
    expect(total).toBe(filterTransactions(windowOf()).length)
  })
})

describe('the repository', () => {
  it('lists the current page and rolls the store through update and remove', async () => {
    const repository = createTransactionRepository(() => ({
      ...windowOf(),
      pageIndex: 0,
      pageSize: 10,
    }))
    const rows = await repository.list()
    expect(rows).toHaveLength(10)

    const target = rows[0]
    if (!target) throw new Error('expected a row')
    const updated = await repository.update(target.id, { status: 'Refunded' })
    expect(updated.status).toBe('Refunded')
    const refetched = filterTransactions({
      ...windowOf(),
      search: target.id,
    })[0]
    if (!refetched) throw new Error('expected the row back')
    expect(refetched.status).toBe('Refunded')

    await repository.remove([target.id])
    expect(
      filterTransactions({ ...windowOf(), search: target.id }),
    ).toHaveLength(0)
  })

  it('creates with an id the caller does not supply', async () => {
    const repository = createTransactionRepository(() => ({
      ...windowOf(),
      pageIndex: 0,
      pageSize: 10,
    }))
    const created = await repository.create({
      customer: 'Newco',
      amount: 42,
    })
    expect(created.id).toMatch(/^TX-\d{5}$/)
    expect(created.customer).toBe('Newco')
  })

  it('fails an update to a row that is not there', async () => {
    const repository = createTransactionRepository(() => ({
      ...windowOf(),
      pageIndex: 0,
      pageSize: 10,
    }))
    await expect(
      repository.update('TX-99999', { status: 'Paid' }),
    ).rejects.toThrow(/No transaction with the id/)
  })
})

describe('undo and the realtime tick', () => {
  it('restores the whole store from a snapshot', () => {
    const before = snapshotTransactions()
    restoreTransactions(
      before.map((row) => ({ ...row, status: 'Refunded' as const })),
    )
    expect(
      filterTransactions(windowOf()).every((row) => row.status === 'Refunded'),
    ).toBe(true)
    restoreTransactions(before)
    expect(filterTransactions(windowOf()).map((row) => row.id)).toEqual(
      before.map((row) => row.id),
    )
  })

  it('advances one row per tick, deterministically', () => {
    const id = advanceDemoData(0)
    const row = filterTransactions(windowOf()).find(
      (candidate) => candidate.id === id,
    )
    if (!row) throw new Error('expected the ticked row')
    const after = row.status
    advanceDemoData(0)
    const flipped = filterTransactions(windowOf()).find(
      (candidate) => candidate.id === id,
    )
    if (!flipped) throw new Error('expected the ticked row')
    expect(flipped.status).toBe(after === 'Paid' ? 'Pending' : 'Paid')
  })
})

describe('the CSV bridge', () => {
  it('exports the filtered set with formatted cells', async () => {
    const { exportCsv } = await import('@talelk/newui-data')
    const query = { ...windowOf(), pageIndex: 0, pageSize: 5 }
    const page = queryTransactions(query)
    const table = createCsvTable(
      [
        { id: 'id', header: 'Ref' },
        {
          id: 'amount',
          header: 'Amount',
          format: (value) => `$${Number(value)}`,
        },
      ],
      () => page.rows,
      () => filterTransactions(query),
    )
    const blob = await exportCsv(table, { scope: 'filtered' })
    const text = await blob.text()
    const lines = text.trimEnd().split('\r\n')
    const header = lines[0]
    const first = lines[1]
    if (!header || !first) throw new Error('expected export lines')
    // `csvText` quotes every cell — the same writer every export shares.
    expect(header).toBe('"Ref","Amount"')
    expect(lines.length).toBe(filterTransactions(query).length + 1)
    expect(first).toMatch(/"\$[\d,]+"/)
  })
})
