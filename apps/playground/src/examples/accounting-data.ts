export const CATEGORIES = [
  'Revenue',
  'Cost of sales',
  'Operating expenses',
  'Payroll',
]
/** The cash accounts the demo reports on, in display order. */
export const ACCOUNTS = ['Operating account', 'Savings', 'Petty cash'] as const
/**
 * Cash held on 2026-04-01, before the first transaction in `INITIAL`.
 * The page rolls these forward through posted movements, so the demo can answer
 * "how much cash is there" rather than only "what moved".
 */
export const OPENING_BALANCES: Record<string, number> = {
  'Operating account': 184000,
  Savings: 92000,
  'Petty cash': 4800,
}
export interface Transaction {
  account?: string
  id: string
  description: string
  category: string
  date: string
  amount: number
  status: 'Posted' | 'Pending'
}
export interface Employee {
  id: string
  name: string
  role: string
  salary: number
  status: 'Pending' | 'Paid'
}
export const INITIAL: Transaction[] = Array.from(
  { length: 36 },
  (_, index) => ({
    account: ['Operating account', 'Savings', 'Petty cash'][index % 3],
    id: `TXN-${1000 + index}`,
    description:
      [
        'Customer subscription',
        'Professional services',
        'Cloud infrastructure',
        'Workspace supplies',
        'Monthly payroll',
        'Customer renewal',
      ][index % 6] ?? 'Transaction',
    category:
      [
        'Revenue',
        'Revenue',
        'Cost of sales',
        'Operating expenses',
        'Payroll',
        'Revenue',
      ][index % 6] ?? 'Revenue',
    date: `2026-${String(4 + Math.floor(index / 6)).padStart(2, '0')}-${String(3 + (index % 6) * 4).padStart(2, '0')}`,
    amount: Math.round(
      (index % 6 === 0
        ? 42000
        : index % 6 === 1
          ? 14500
          : index % 6 === 2
            ? 8500
            : index % 6 === 3
              ? 2100
              : index % 6 === 4
                ? 18500
                : 27000) *
        (1 + Math.floor(index / 6) * 0.08),
    ),
    status: index % 9 === 3 ? 'Pending' : 'Posted',
  }),
)
export const INITIAL_EMPLOYEES: Employee[] = [
  'Rhea Kapoor',
  'Priya Nair',
  'Sam Rivera',
  'Ana Costa',
  'Grace Liu',
  'Tom Becker',
].map((name, index) => ({
  id: `EMP-${index + 1}`,
  name,
  role:
    [
      'Product designer',
      'Sales manager',
      'Engineer',
      'Operations',
      'Customer success',
      'Engineer',
    ][index] ?? 'Team member',
  salary: 4200 + index * 350,
  status: 'Pending',
}))
export function aggregateCashflow(
  rows: Transaction[],
  grain: 'Monthly' | 'Quarterly',
) {
  const groups = new Map<
    string,
    { month: string; Income: number; Expenses: number }
  >()
  for (const row of rows) {
    const year = row.date.slice(0, 4)
    const month = Number(row.date.slice(5, 7))
    const key =
      grain === 'Quarterly'
        ? `${year}-Q${Math.ceil(month / 3)}`
        : row.date.slice(0, 7)
    const group = groups.get(key) ?? { month: key, Income: 0, Expenses: 0 }
    if (row.category === 'Revenue') group.Income += row.amount
    else group.Expenses += row.amount
    groups.set(key, group)
  }
  return [...groups]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value)
}
