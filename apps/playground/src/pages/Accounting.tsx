import { StatGrid } from '@newui/blocks'
import {
  AreaChart,
  ChartCard,
  ChartLegend,
  paletteColors,
  useChartTokens,
} from '@newui/charts'
import {
  Badge,
  Button,
  DateRangePicker,
  type DateRangeValue,
  Select,
  Switch,
  TabButtons,
} from '@newui/ui'
import { createMemo, createSignal, For, type JSX, lazy, Show } from 'solid-js'
import {
  aggregateCashflow,
  CATEGORIES,
  currency,
  downloadCSV,
  type Employee,
  INITIAL,
  INITIAL_EMPLOYEES,
  type Transaction,
} from '../examples/accounting-data'
import type { DataTableColumn } from '../examples/DataTable'
import { ExampleFrame } from '../examples/ExampleFrame'

const AccountingDialogs = lazy(() => import('./accounting/AccountingDialogs'))

const ExpenseChart = lazy(() => import('./accounting/ExpenseChart'))

const TransactionTable = lazy(() =>
  import('../examples/DataTable').then((module) => ({
    default: module.DataTable<Transaction>,
  })),
)
const EmployeeTable = lazy(() =>
  import('../examples/DataTable').then((module) => ({
    default: module.DataTable<Employee>,
  })),
)

export function Accounting(): JSX.Element {
  const chartTokens = useChartTokens()
  const [transactions, setTransactions] = createSignal(INITIAL)
  const [employees, setEmployees] = createSignal(INITIAL_EMPLOYEES)
  const [page, setPage] = createSignal('Cashflow')
  const [flow, setFlow] = createSignal('incoming')
  const [range, setRange] = createSignal<DateRangeValue>([
    '2026-04-01',
    '2026-09-30',
  ])
  const [grain, setGrain] = createSignal<'Monthly' | 'Quarterly'>('Monthly')
  const [compare, setCompare] = createSignal(true)
  const [hiddenSeries, setHiddenSeries] = createSignal<string[]>([])
  const [notice, setNotice] = createSignal('')
  const [open, setOpen] = createSignal(false)
  const [employeeOpen, setEmployeeOpen] = createSignal(false)
  let nextId = 2000
  const ledger = createMemo(() =>
    transactions().filter(
      (transaction) =>
        !range().length ||
        (transaction.date >= (range()[0] ?? '') &&
          transaction.date <= (range()[1] ?? '9999')),
    ),
  )
  const posted = createMemo(() =>
    ledger().filter((transaction) => transaction.status === 'Posted'),
  )
  const income = () =>
    posted()
      .filter((transaction) => transaction.category === 'Revenue')
      .reduce((sum, item) => sum + item.amount, 0)
  const expenses = () =>
    posted()
      .filter((transaction) => transaction.category !== 'Revenue')
      .reduce((sum, item) => sum + item.amount, 0)
  const totals = createMemo(() =>
    CATEGORIES.map((name) => ({
      name,
      total: posted()
        .filter((transaction) => transaction.category === name)
        .reduce((sum, item) => sum + item.amount, 0),
    })),
  )
  const chart = createMemo(() => aggregateCashflow(posted(), grain()))
  const flowRows = createMemo(() =>
    ledger().filter((transaction) =>
      flow() === 'incoming'
        ? transaction.category === 'Revenue'
        : transaction.category !== 'Revenue',
    ),
  )
  const expenseRows = createMemo(() =>
    ledger().filter((transaction) => transaction.category !== 'Revenue'),
  )
  const pay = (ids: string[]) => {
    const selected = employees().filter(
      (employee) => ids.includes(employee.id) && employee.status !== 'Paid',
    )
    if (!selected.length) return
    setEmployees((previous) =>
      previous.map((employee) =>
        ids.includes(employee.id) ? { ...employee, status: 'Paid' } : employee,
      ),
    )
    setTransactions((previous) => [
      ...previous,
      ...selected.map(
        (employee): Transaction => ({
          id: `TXN-${nextId++}`,
          description: `September salary · ${employee.name}`,
          category: 'Payroll',
          date: '2026-09-30',
          amount: employee.salary,
          status: 'Posted',
        }),
      ),
    ])
    setNotice(
      `${selected.length} payroll payments recorded locally. No money was transferred.`,
    )
  }
  const transactionColumns: DataTableColumn<Transaction>[] = [
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'date', header: 'Date' },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: (context) => (
        <span class="tabular-nums">
          {currency(context.row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (context) => (
        <Badge
          theme={context.row.original.status === 'Posted' ? 'green' : 'amber'}
        >
          {context.row.original.status}
        </Badge>
      ),
    },
  ]
  const employeeColumns: DataTableColumn<Employee>[] = [
    { accessorKey: 'name', header: 'Employee' },
    { accessorKey: 'role', header: 'Role' },
    {
      accessorKey: 'salary',
      header: 'Monthly salary',
      cell: (context) => currency(context.row.original.salary),
    },
    {
      accessorKey: 'status',
      header: 'Payroll status',
      cell: (context) => (
        <Badge
          theme={context.row.original.status === 'Paid' ? 'green' : 'amber'}
        >
          {context.row.original.status}
        </Badge>
      ),
    },
  ]
  const exportReport = () => {
    if (page() === 'Profit & loss')
      downloadCSV('acme-profit-and-loss.csv', [
        ['Category', 'Amount (USD)'],
        ...totals().map((item) => [item.name, item.total]),
        ['Net profit', income() - expenses()],
      ])
    else if (page() === 'Payroll')
      downloadCSV('acme-payroll.csv', [
        ['Employee', 'Role', 'Monthly salary', 'Status'],
        ...employees().map((employee) => [
          employee.name,
          employee.role,
          employee.salary,
          employee.status,
        ]),
      ])
    else
      downloadCSV('acme-ledger.csv', [
        ['Description', 'Category', 'Date', 'Amount (USD)', 'Status'],
        ...(page() === 'Expenses' ? expenseRows() : flowRows()).map(
          (transaction) => [
            transaction.description,
            transaction.category,
            transaction.date,
            transaction.amount,
            transaction.status,
          ],
        ),
      ])
  }
  return (
    <ExampleFrame
      title="Know where your business stands"
      section="Accounting"
      description="A clear view of cash, costs and the people behind your business. All figures are local demonstration data."
      actions={
        <>
          <Button
            variant="outline"
            iconLeft="lucide-download"
            onClick={exportReport}
          >
            Export report
          </Button>
          <Button
            variant="solid"
            theme="blue"
            iconLeft="lucide-plus"
            onClick={() => {
              if (page() === 'Payroll') setEmployeeOpen(true)
              else setOpen(true)
            }}
          >
            {page() === 'Payroll' ? 'Add employee' : 'Add transaction'}
          </Button>
        </>
      }
    >
      <nav aria-label="Accounting pages" class="flex flex-wrap gap-2">
        <For
          each={[
            'Cashflow',
            'Cash accounts',
            'Expenses',
            'Payroll',
            'Profit & loss',
          ]}
        >
          {(name) => (
            <Button
              variant={page() === name ? 'solid' : 'outline'}
              theme={page() === name ? 'blue' : 'gray'}
              onClick={() => setPage(name)}
            >
              {name}
            </Button>
          )}
        </For>
      </nav>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <h2 class="text-section">{page()}</h2>
        <div class="flex flex-wrap items-end gap-2">
          <Select
            label="Aggregate cashflow"
            value={[grain()]}
            options={['Monthly', 'Quarterly'].map((value) => ({
              value,
              label: value,
            }))}
            onValueChange={(value) =>
              setGrain(value[0] === 'Quarterly' ? 'Quarterly' : 'Monthly')
            }
          />
          <Select
            label="Date preset"
            value={[]}
            options={[
              { label: 'September 2026', value: 'month' },
              { label: 'Q3 2026', value: 'quarter' },
              { label: 'Last six months', value: 'six' },
            ]}
            onValueChange={(value) =>
              setRange(
                value[0] === 'month'
                  ? ['2026-09-01', '2026-09-30']
                  : value[0] === 'quarter'
                    ? ['2026-07-01', '2026-09-30']
                    : ['2026-04-01', '2026-09-30'],
              )
            }
          />
          <DateRangePicker
            label="Reporting period"
            value={range()}
            onValueChange={setRange}
            class="max-w-full"
          />
          <Button
            variant="outline"
            onClick={() => setRange(['2026-09-01', '2026-09-30'])}
          >
            September
          </Button>
          <Button
            variant="outline"
            onClick={() => setRange(['2026-04-01', '2026-09-30'])}
          >
            Last six months
          </Button>
        </div>
      </div>
      <Show when={notice()}>
        <p
          role="status"
          class="rounded-3 border border-outline-blue-1 bg-surface-blue-1 p-3 text-ink-blue-8"
        >
          {notice()}
        </p>
      </Show>
      <StatGrid
        stats={[
          { label: 'Posted income', value: currency(income()) },
          { label: 'Posted expenses', value: currency(expenses()) },
          { label: 'Net profit', value: currency(income() - expenses()) },
          {
            label: 'Profit margin',
            value: `${income() ? (((income() - expenses()) / income()) * 100).toFixed(1) : '0'}%`,
          },
        ]}
      />
      <Show when={page() === 'Cash accounts'}>
        <section class="grid gap-4 sm:grid-cols-3" aria-label="Cash accounts">
          <For each={['Operating account', 'Savings', 'Petty cash']}>
            {(account) => (
              <article class="rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-3">
                <h3 class="font-medium">{account}</h3>
                <p class="mt-3 text-metric">
                  {currency(
                    posted()
                      .filter(
                        (row) =>
                          (row.account ?? 'Operating account') === account,
                      )
                      .reduce(
                        (sum, row) =>
                          sum +
                          (row.category === 'Revenue'
                            ? row.amount
                            : -row.amount),
                        0,
                      ),
                  )}
                </p>
                <p class="mt-2 text-caption text-ink-gray-6">
                  Net posted movement in the selected period
                </p>
                <Button
                  onClick={() => {
                    setPage('Cashflow')
                    setNotice(
                      `Showing cashflow. ${account} movement is included in the posted totals.`,
                    )
                  }}
                >
                  View cashflow
                </Button>
              </article>
            )}
          </For>
        </section>
      </Show>
      <Show when={page() === 'Cashflow'}>
        <div class="grid min-w-0 gap-4 xl:grid-cols-3">
          <ChartCard class="xl:col-span-2">
            <AreaChart
              data={chart()}
              hiddenSeries={hiddenSeries()}
              seriesConfig={{ Expenses: { type: 'line', dashed: true } }}
              x="month"
              y={['Income', 'Expenses']}
              title="Cashflow over time"
              subtitle="Posted income and expenses in your selected period"
              yAxis={{ format: (value) => `$${Math.round(value / 1000)}k` }}
              height={300}
              aria-label={`Income and expenses ${grain().toLowerCase()}`}
            />
            <ChartLegend
              items={['Income', 'Expenses'].map((name, index) => ({
                name,
                label: name,
                color:
                  paletteColors('sequential', chartTokens(), 2)[index] ??
                  'currentColor',
                hidden: hiddenSeries().includes(name),
              }))}
              onToggle={(name) =>
                setHiddenSeries((previous) =>
                  previous.includes(name)
                    ? previous.filter((item) => item !== name)
                    : [...previous, name],
                )
              }
            />
          </ChartCard>
          <ChartCard>
            <ExpenseChart
              data={totals().filter((item) => item.name !== 'Revenue')}
              x="name"
              y="total"
              title="Where your money goes"
              horizontal
              yAxis={{ format: currency }}
              height={300}
              aria-label="Expense breakdown by category"
            />
          </ChartCard>
        </div>
        <TabButtons
          value={flow()}
          onValueChange={setFlow}
          options={[
            { label: 'Incoming', value: 'incoming' },
            { label: 'Outgoing', value: 'outgoing' },
          ]}
        />
        <section
          aria-label="Cashflow ledger"
          tabindex="0"
          class="overflow-x-auto rounded-5 border border-outline-gray-1 bg-surface-elevation-1 focus-visible:focus-ring"
        >
          <table class="w-full min-w-[640px] text-interface">
            <thead class="border-b border-outline-gray-1 bg-surface-gray-1 text-caption text-ink-gray-6">
              <tr>
                <For
                  each={['Description', 'Category', 'Date', 'Amount', 'Status']}
                >
                  {(title) => (
                    <th scope="col" class="px-4 py-3 text-start">
                      {title}
                    </th>
                  )}
                </For>
              </tr>
            </thead>
            <tbody>
              <For each={flowRows()}>
                {(transaction) => (
                  <tr class="border-b border-outline-gray-1 last:border-b-0">
                    <td class="px-4 py-3">{transaction.description}</td>
                    <td class="px-4 py-3">{transaction.category}</td>
                    <td class="px-4 py-3">{transaction.date}</td>
                    <td class="px-4 py-3 tabular-nums">
                      {currency(transaction.amount)}
                    </td>
                    <td class="px-4 py-3">
                      <Badge
                        theme={
                          transaction.status === 'Posted' ? 'green' : 'amber'
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
          <Show when={!flowRows().length}>
            <p class="p-8 text-center text-ink-gray-6">
              No transactions in this period.
            </p>
          </Show>
        </section>
      </Show>
      <Show when={page() === 'Expenses'}>
        <TransactionTable
          title="Expenses"
          rows={expenseRows()}
          columns={transactionColumns}
          actionLabel="Approve expenses"
          onRowsAction={(ids) => {
            setTransactions((previous) =>
              previous.map((transaction) =>
                ids.includes(transaction.id)
                  ? { ...transaction, status: 'Posted' }
                  : transaction,
              ),
            )
            setNotice('Selected expenses posted to the local ledger.')
          }}
        />
      </Show>
      <Show when={page() === 'Payroll'}>
        <div class="rounded-5 border border-outline-blue-1 bg-surface-blue-1 p-3">
          <p class="font-medium text-ink-blue-8">
            September payroll ·{' '}
            {currency(
              employees().reduce((sum, employee) => sum + employee.salary, 0),
            )}
          </p>
          <p class="mt-1 text-caption text-ink-gray-7">
            Select employees to record their payment once. Payments update the
            ledger, charts and profit report.
          </p>
        </div>
        <EmployeeTable
          title="Payroll"
          rows={employees()}
          columns={employeeColumns}
          actionLabel="Record payroll payments"
          onRowsAction={pay}
        />
      </Show>
      <Show when={page() === 'Profit & loss'}>
        <section
          class="rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-3"
          aria-label="Profit and loss report"
        >
          <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h3 class="text-section">Profit & loss</h3>
            <Switch
              label="Compare with prior period"
              checked={compare()}
              onCheckedChange={setCompare}
            />
          </div>
          <p class="mb-4 text-caption text-ink-gray-6">
            Prior-period figures are a fixed comparison cohort at 90% of each
            selected category.
          </p>
          <section
            class="overflow-x-auto rounded-3 focus-visible:focus-ring"
            tabindex="0"
            aria-label="Profit and loss figures"
          >
            <table class="w-full min-w-[400px] text-interface">
              <thead class="border-b border-outline-gray-1 text-caption text-ink-gray-6">
                <tr>
                  <th class="p-3 text-start" scope="col">
                    Category
                  </th>
                  <th class="p-3 text-end" scope="col">
                    Selected period
                  </th>
                  <Show when={compare()}>
                    <th class="p-3 text-end" scope="col">
                      Prior period
                    </th>
                  </Show>
                </tr>
              </thead>
              <tbody>
                <For each={totals()}>
                  {(item) => (
                    <tr class="border-b border-outline-gray-1">
                      <th class="p-3 text-start font-normal" scope="row">
                        {item.name}
                      </th>
                      <td class="p-3 text-end tabular-nums">
                        {currency(item.total)}
                      </td>
                      <Show when={compare()}>
                        <td class="p-3 text-end tabular-nums text-ink-gray-6">
                          {currency(item.total * 0.9)}
                        </td>
                      </Show>
                    </tr>
                  )}
                </For>
                <tr class="bg-surface-blue-1 font-semibold text-ink-blue-8">
                  <th class="p-3 text-start" scope="row">
                    Net profit
                  </th>
                  <td class="p-3 text-end tabular-nums">
                    {currency(income() - expenses())}
                  </td>
                  <Show when={compare()}>
                    <td class="p-3 text-end tabular-nums">
                      {currency((income() - expenses()) * 0.9)}
                    </td>
                  </Show>
                </tr>
              </tbody>
            </table>
          </section>
        </section>
      </Show>
      <Show when={open() || employeeOpen()}>
        <AccountingDialogs
          open={open()}
          employeeOpen={employeeOpen()}
          onOpenChange={setOpen}
          onEmployeeOpenChange={setEmployeeOpen}
          onTransaction={(row) =>
            setTransactions((previous) => [row, ...previous])
          }
          onEmployee={(row) => setEmployees((previous) => [...previous, row])}
          onNotice={setNotice}
          nextId={() => nextId++}
        />
      </Show>
    </ExampleFrame>
  )
}
