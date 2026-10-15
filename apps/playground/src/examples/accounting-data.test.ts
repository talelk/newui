import { expect, it } from 'vitest'
import { aggregateCashflow, type Transaction } from './accounting-data'

it('aggregates calendar quarters across year boundaries and keeps income separate from costs', () => {
  const rows: Transaction[] = [
    {
      id: 'a',
      date: '2025-12-31',
      category: 'Revenue',
      amount: 100,
      description: '',
      status: 'Posted',
    },
    {
      id: 'b',
      date: '2026-01-01',
      category: 'Revenue',
      amount: 200,
      description: '',
      status: 'Posted',
    },
    {
      id: 'c',
      date: '2026-03-31',
      category: 'Payroll',
      amount: 70,
      description: '',
      status: 'Posted',
    },
    {
      id: 'd',
      date: '2026-04-01',
      category: 'Revenue',
      amount: 300,
      description: '',
      status: 'Posted',
    },
  ]
  expect(aggregateCashflow(rows, 'Quarterly')).toEqual([
    { month: '2025-Q4', Income: 100, Expenses: 0 },
    { month: '2026-Q1', Income: 200, Expenses: 70 },
    { month: '2026-Q2', Income: 300, Expenses: 0 },
  ])
  expect(aggregateCashflow(rows, 'Monthly')).toHaveLength(4)
  expect(aggregateCashflow([], 'Quarterly')).toEqual([])
})
