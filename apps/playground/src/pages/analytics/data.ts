import { csvText } from '../../examples/download'

export interface Transaction {
  id: string
  customer: string
  email: string
  day: number
  region: string
  channel: string
  amount: number
  status: 'Paid' | 'Pending' | 'Refunded'
}

const customers = [
  'Linear',
  'Acme Studio',
  'Northstar',
  'Layers',
  'Orbit',
  'Focal',
  'Capsule',
  'Sonder',
]
export const transactions: Transaction[] = Array.from(
  { length: 96 },
  (_, i) => ({
    id: `INV-${2401 + i}`,
    customer: customers[i % customers.length] ?? 'Acme',
    email: `billing${i + 1}@example.com`,
    day: 1 + (i % 30),
    region: ['Europe', 'North America', 'Asia Pacific'][i % 3] ?? 'Europe',
    channel:
      ['Direct', 'Organic', 'Referral', 'Paid search'][i % 4] ?? 'Direct',
    amount: 120 + ((i * 173) % 2800),
    status: i % 11 === 0 ? 'Refunded' : i % 7 === 0 ? 'Pending' : 'Paid',
  }),
)

export function filterTransactions(
  region: string,
  days: number,
  query: string,
  empty = false,
  source: Transaction[] = transactions,
) {
  const needle = query.trim().toLowerCase()
  return empty
    ? []
    : source.filter(
        (row) =>
          (region === 'all' || row.region === region) &&
          row.day > 30 - days &&
          `${row.id} ${row.customer} ${row.email} ${row.channel} ${row.status}`
            .toLowerCase()
            .includes(needle),
      )
}

export function summarize(rows: Transaction[]) {
  const paid = rows.filter((row) => row.status === 'Paid')
  const revenue = paid.reduce((total, row) => total + row.amount, 0)
  return {
    revenue,
    orders: rows.length,
    average: paid.length ? revenue / paid.length : 0,
    paidRate: rows.length ? (paid.length / rows.length) * 100 : 0,
  }
}

export function revenueSeries(rows: Transaction[], days: number) {
  return Array.from({ length: days }, (_, i) => {
    const day = 31 - days + i
    return {
      date: `Sep ${day}`,
      Revenue: summarize(rows.filter((row) => row.day === day)).revenue,
    }
  })
}

export function channelSeries(rows: Transaction[]) {
  return ['Direct', 'Organic', 'Referral', 'Paid search'].map((channel) => ({
    channel,
    Revenue: summarize(rows.filter((row) => row.channel === channel)).revenue,
  }))
}

export type SortKey = 'customer' | 'amount' | 'day'
export function sortTransactions(
  rows: Transaction[],
  key: SortKey,
  ascending: boolean,
) {
  return [...rows].sort(
    (a, b) =>
      (typeof a[key] === 'string'
        ? String(a[key]).localeCompare(String(b[key]))
        : Number(a[key]) - Number(b[key])) * (ascending ? 1 : -1),
  )
}

export function csv(rows: Transaction[]) {
  return csvText([
    ['Invoice', 'Customer', 'Date', 'Region', 'Channel', 'Amount', 'Status'],
    ...rows.map((row) => [
      row.id,
      row.customer,
      `2026-09-${String(row.day).padStart(2, '0')}`,
      row.region,
      row.channel,
      row.amount,
      row.status,
    ]),
  ])
}

/** A deterministic prior-month cohort, independent of current-page mutations. */
export const previousTransactions: Transaction[] = transactions.map((row) => ({
  ...row,
  id: `PRIOR-${row.id}`,
  amount: Math.round(row.amount * 0.88),
}))

export function percentageChange(
  current: number,
  previous: number,
): number | undefined {
  return previous > 0 ? ((current - previous) / previous) * 100 : undefined
}

export function comparisonSeries(
  current: Transaction[],
  previous: Transaction[],
  days: number,
) {
  const before = revenueSeries(previous, days)
  return revenueSeries(current, days).map((point, index) => ({
    ...point,
    Previous: before[index]?.Revenue ?? 0,
  }))
}

export function regionSeries(rows: Transaction[]) {
  return ['Europe', 'North America', 'Asia Pacific'].map((region) => ({
    region,
    Revenue: summarize(rows.filter((row) => row.region === region)).revenue,
  }))
}

export function statusSeries(rows: Transaction[]) {
  return ['Paid', 'Pending', 'Refunded'].map((status) => ({
    status,
    Transactions: rows.filter((row) => row.status === status).length,
  }))
}

export function updateTransactionStatus(
  rows: Transaction[],
  id: string,
  status: Transaction['status'],
): Transaction[] {
  return rows.map((row) => (row.id === id ? { ...row, status } : row))
}
