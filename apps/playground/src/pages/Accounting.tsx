import { Badge, Button, Switch } from '@talelk/newui-atoms'
import {
  AreaChart,
  ChartCard,
  ChartLegend,
  paletteColors,
  useChartTokens,
} from '@talelk/newui-charts'
import {
  usd as currency,
  downloadCsv as downloadCSV,
  optionsOf,
  usdK,
} from '@talelk/newui-data'
import {
  type DateRangeValue,
  ScrollTable,
  ScrollTableHead,
  TabButtons,
} from '@talelk/newui-molecules'
import type { DataTableColumn } from '@talelk/newui-organisms'
import { StatGrid } from '@talelk/newui-organisms'
import { createMemo, createSignal, For, type JSX, lazy, Show } from 'solid-js'
import { AppPage } from '../examples/AppPage'
import {
  ACCOUNTS,
  aggregateCashflow,
  CATEGORIES,
  type Employee,
  INITIAL,
  INITIAL_EMPLOYEES,
  OPENING_BALANCES,
  type Transaction,
} from '../examples/accounting-data'
import { Notice } from '../examples/Notice'
import { PeriodBar } from './accounting/PeriodBar'

type AccountingPage =
  | 'Cashflow'
  | 'Cash accounts'
  | 'Expenses'
  | 'Payroll'
  | 'Profit & loss'

type ConfirmRequest = {
  kind: 'expenses' | 'payroll'
  ids: string[]
  count: number
  total: number
  skipped: number
}

type Dataset = {
  count: number
  noun: string
  period: boolean
  aggregate: boolean
}

const AccountingDialogs = lazy(() => import('./accounting/AccountingDialogs'))

const TransactionTable = lazy(() =>
  import('@talelk/newui-organisms').then((module) => ({
    default: module.DataTable<Transaction>,
  })),
)
const EmployeeTable = lazy(() =>
  import('@talelk/newui-organisms').then((module) => ({
    default: module.DataTable<Employee>,
  })),
)
const ExpenseRanking = lazy(() => import('./accounting/ExpenseRanking'))

export function Accounting(): JSX.Element {
  const chartTokens = useChartTokens()
  const [transactions, setTransactions] = createSignal(INITIAL)
  const [employees, setEmployees] = createSignal(INITIAL_EMPLOYEES)
  const [page, setPage] = createSignal<AccountingPage>('Cashflow')
  const [flow, setFlow] = createSignal('incoming')
  const [range, setRange] = createSignal<DateRangeValue>([
    '2026-04-01',
    '2026-09-30',
  ])
  const [grain, setGrain] = createSignal<'Monthly' | 'Quarterly'>('Monthly')
  const [compare, setCompare] = createSignal(true)
  const [hiddenSeries, setHiddenSeries] = createSignal<string[]>([])
  const [notice, setNotice] = createSignal('')
  const [undoAction, setUndoAction] = createSignal<(() => void) | null>(null)
  const [confirmRequest, setConfirmRequest] =
    createSignal<ConfirmRequest | null>(null)
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
  const notify = (text: string, undo?: () => void) => {
    setNotice(text)
    setUndoAction(() => undo ?? null)
  }
  const netMovement = (rows: Transaction[]) =>
    rows.reduce(
      (sum, row) =>
        sum + (row.category === 'Revenue' ? row.amount : -row.amount),
      0,
    )
  const accountBalances = createMemo(() => {
    const [start = '0000-01-01', end = '9999-12-31'] = range()
    return ACCOUNTS.map((account) => {
      const postedRows = transactions().filter(
        (transaction) =>
          transaction.status === 'Posted' &&
          (transaction.account ?? 'Operating account') === account,
      )
      const opening =
        (OPENING_BALANCES[account] ?? 0) +
        netMovement(
          postedRows.filter((transaction) => transaction.date < start),
        )
      const movement = netMovement(
        postedRows.filter(
          (transaction) => transaction.date >= start && transaction.date <= end,
        ),
      )
      return { account, opening, movement, closing: opening + movement }
    })
  })
  const cashTotal = () =>
    accountBalances().reduce((sum, account) => sum + account.closing, 0)
  const dataset = createMemo<Dataset>(() => {
    switch (page()) {
      case 'Cash accounts':
        return {
          count: ACCOUNTS.length,
          noun: 'accounts',
          period: true,
          aggregate: false,
        }
      case 'Expenses':
        return {
          count: expenseRows().length,
          noun: 'expense records',
          period: true,
          aggregate: false,
        }
      case 'Payroll':
        return {
          count: employees().length,
          noun: 'employees',
          period: false,
          aggregate: false,
        }
      case 'Profit & loss':
        return {
          count: totals().length + 1,
          noun: 'report lines',
          period: true,
          aggregate: false,
        }
      default:
        return {
          count: flowRows().length,
          noun:
            flow() === 'incoming'
              ? 'incoming transactions'
              : 'outgoing transactions',
          period: true,
          aggregate: true,
        }
    }
  })
  const canReset = () =>
    range()[0] !== '2026-04-01' ||
    range()[1] !== '2026-09-30' ||
    (page() === 'Cashflow' && grain() !== 'Monthly')
  const resetPeriod = () => {
    setRange(['2026-04-01', '2026-09-30'])
    setGrain('Monthly')
  }
  const shortDate = (value: string | undefined) =>
    value
      ? new Intl.DateTimeFormat('en', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(new Date(`${value}T00:00:00`))
      : ''
  const periodLabel = () =>
    `${shortDate(range()[0])} – ${shortDate(range()[1] ?? '2026-09-30')}`
  const companyStats = () => [
    {
      label: 'Posted income',
      value: currency(income()),
      hint: 'Posted in the selected period',
      icon: 'lucide-trending-up',
    },
    {
      label: 'Posted expenses',
      value: currency(expenses()),
      hint: 'Posted in the selected period',
      icon: 'lucide-receipt',
    },
    {
      label: 'Net profit',
      value: currency(income() - expenses()),
      hint: 'Income less expenses, posted only',
      icon: 'lucide-scale',
    },
    {
      label: 'Profit margin',
      value: `${income() ? (((income() - expenses()) / income()) * 100).toFixed(1) : '0'}%`,
      hint: 'Share of posted income kept',
      icon: 'lucide-percent',
    },
  ]
  const stats = createMemo(() => {
    if (page() === 'Cash accounts') {
      return [
        {
          label: 'Total cash',
          value: currency(cashTotal()),
          hint: `As of ${range()[1] ?? '2026-09-30'}`,
          icon: 'lucide-wallet',
        },
        ...accountBalances().map((account) => ({
          label: account.account,
          value: currency(account.closing),
          hint: `Opening ${currency(account.opening)} · ${account.movement >= 0 ? '+' : ''}${currency(account.movement)}`,
          icon: 'lucide-landmark',
        })),
      ]
    }
    if (page() === 'Expenses') {
      const rows = expenseRows()
      const total = rows.reduce((sum, row) => sum + row.amount, 0)
      const pendingRows = rows.filter((row) => row.status === 'Pending')
      const pending = pendingRows.reduce((sum, row) => sum + row.amount, 0)
      const byCategory = new Map<string, number>()
      for (const row of rows) {
        byCategory.set(
          row.category,
          (byCategory.get(row.category) ?? 0) + row.amount,
        )
      }
      const top = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0]
      return [
        {
          label: 'Total expenses',
          value: currency(total),
          hint: 'Selected period',
          icon: 'lucide-receipt',
        },
        {
          label: 'Pending approval',
          value: currency(pending),
          hint: `${pendingRows.length} ${pendingRows.length === 1 ? 'record' : 'records'}`,
          icon: 'lucide-clock',
        },
        {
          label: 'Posted expenses',
          value: currency(total - pending),
          hint: 'Already in the ledger',
          icon: 'lucide-check',
        },
        {
          label: 'Largest category',
          value: currency(top?.[1] ?? 0),
          hint: top?.[0] ?? 'No expenses in this period',
          icon: 'lucide-chart-pie',
        },
      ]
    }
    if (page() === 'Payroll') {
      const paid = employees().filter((employee) => employee.status === 'Paid')
      const pending = employees().filter(
        (employee) => employee.status === 'Pending',
      )
      const total = employees().reduce(
        (sum, employee) => sum + employee.salary,
        0,
      )
      return [
        {
          label: 'September payroll',
          value: currency(total),
          hint: 'Fixed monthly run',
          icon: 'lucide-users',
        },
        {
          label: 'Paid',
          value: currency(
            paid.reduce((sum, employee) => sum + employee.salary, 0),
          ),
          hint: `${paid.length} ${paid.length === 1 ? 'employee' : 'employees'}`,
          icon: 'lucide-check',
        },
        {
          label: 'Pending',
          value: currency(
            pending.reduce((sum, employee) => sum + employee.salary, 0),
          ),
          hint: `${pending.length} ${pending.length === 1 ? 'employee' : 'employees'}`,
          icon: 'lucide-clock',
        },
        {
          label: 'Employees',
          value: String(employees().length),
          hint: 'On this run',
          icon: 'lucide-user-round',
        },
      ]
    }
    return companyStats()
  })
  const requestExpenses = (ids: string[]) => {
    const eligible = transactions().filter(
      (transaction) =>
        ids.includes(transaction.id) &&
        transaction.category !== 'Revenue' &&
        transaction.status === 'Pending',
    )
    if (!eligible.length) {
      notify('That selection is already posted to the ledger.')
      return
    }
    setConfirmRequest({
      kind: 'expenses',
      ids: eligible.map((transaction) => transaction.id),
      count: eligible.length,
      total: eligible.reduce((sum, transaction) => sum + transaction.amount, 0),
      skipped: ids.length - eligible.length,
    })
  }
  const requestPayroll = (ids: string[]) => {
    const eligible = employees().filter(
      (employee) => ids.includes(employee.id) && employee.status !== 'Paid',
    )
    if (!eligible.length) {
      notify('That selection is already recorded as paid.')
      return
    }
    setConfirmRequest({
      kind: 'payroll',
      ids: eligible.map((employee) => employee.id),
      count: eligible.length,
      total: eligible.reduce((sum, employee) => sum + employee.salary, 0),
      skipped: ids.length - eligible.length,
    })
  }
  const completeRequest = () => {
    const request = confirmRequest()
    if (!request) return
    if (request.kind === 'expenses') {
      const before = transactions()
      setTransactions((previous) =>
        previous.map((transaction) =>
          request.ids.includes(transaction.id)
            ? { ...transaction, status: 'Posted' }
            : transaction,
        ),
      )
      notify(
        `Posted ${request.count} ${request.count === 1 ? 'expense' : 'expenses'} · ${currency(request.total)}.${
          request.skipped ? ` ${request.skipped} already posted.` : ''
        }`,
        () => setTransactions(before),
      )
    } else {
      const beforeEmployees = employees()
      const beforeTransactions = transactions()
      const selected = employees().filter((employee) =>
        request.ids.includes(employee.id),
      )
      setEmployees((previous) =>
        previous.map((employee) =>
          request.ids.includes(employee.id)
            ? { ...employee, status: 'Paid' }
            : employee,
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
      notify(
        `Recorded ${request.count} payroll ${request.count === 1 ? 'payment' : 'payments'} · ${currency(request.total)}.${
          request.skipped ? ` ${request.skipped} already paid.` : ''
        }`,
        () => {
          setEmployees(beforeEmployees)
          setTransactions(beforeTransactions)
        },
      )
    }
    setConfirmRequest(null)
  }
  const transactionColumns: DataTableColumn<Transaction>[] = [
    {
      accessorKey: 'description',
      header: 'Description',
      meta: { mobile: 'title' },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      meta: { mobile: 'subtitle' },
    },
    { accessorKey: 'date', header: 'Date', meta: { mobile: 'meta' } },
    {
      accessorKey: 'amount',
      header: 'Amount',
      meta: { align: 'end', mobile: 'amount' },
      cell: (context) => (
        <span class="tabular-nums">
          {currency(context.row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { mobile: 'status' },
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
    { accessorKey: 'name', header: 'Employee', meta: { mobile: 'title' } },
    { accessorKey: 'role', header: 'Role', meta: { mobile: 'subtitle' } },
    {
      accessorKey: 'salary',
      header: 'Monthly salary',
      meta: { align: 'end', mobile: 'amount' },
      cell: (context) => currency(context.row.original.salary),
    },
    {
      accessorKey: 'status',
      header: 'Payroll status',
      meta: { mobile: 'status' },
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
    const accounts = accountBalances()
    switch (page()) {
      case 'Profit & loss':
        downloadCSV('acme-profit-and-loss.csv', [
          ['Category', 'Amount (USD)'],
          ...totals().map((item) => [item.name, item.total]),
          ['Net profit', income() - expenses()],
        ])
        break
      case 'Payroll':
        downloadCSV('acme-payroll.csv', [
          ['Employee', 'Role', 'Monthly salary', 'Status'],
          ...employees().map((employee) => [
            employee.name,
            employee.role,
            employee.salary,
            employee.status,
          ]),
        ])
        break
      case 'Cash accounts':
        downloadCSV('acme-cash-accounts.csv', [
          ['Account', 'Opening', 'Movement', 'Closing'],
          ...accounts.map((account) => [
            account.account,
            account.opening,
            account.movement,
            account.closing,
          ]),
        ])
        break
      case 'Expenses':
        downloadCSV('acme-expenses.csv', [
          ['Description', 'Category', 'Date', 'Amount (USD)', 'Status'],
          ...expenseRows().map((transaction) => [
            transaction.description,
            transaction.category,
            transaction.date,
            transaction.amount,
            transaction.status,
          ]),
        ])
        break
      default:
        downloadCSV('acme-cashflow.csv', [
          ['Description', 'Category', 'Date', 'Amount (USD)', 'Status'],
          ...flowRows().map((transaction) => [
            transaction.description,
            transaction.category,
            transaction.date,
            transaction.amount,
            transaction.status,
          ]),
        ])
    }
  }
  return (
    <AppPage
      title="Accounting"
      section="Accounting"
      description="Cash, costs and payroll for the selected period — local demo data."
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
      <div class="flex flex-col gap-3">
        <TabButtons
          label="Accounting sections"
          wrap
          value={page()}
          onValueChange={setPage}
          options={optionsOf([
            'Cashflow',
            'Cash accounts',
            'Expenses',
            'Payroll',
            'Profit & loss',
          ])}
        />
        <h2 class="sr-only">{page()}</h2>
        <Show
          when={page() !== 'Payroll'}
          fallback={
            <p class="text-caption text-ink-gray-7">
              Payroll period: September 2026 · select employees to record their
              payment once.
            </p>
          }
        >
          <PeriodBar
            range={range()}
            onRangeChange={setRange}
            grain={grain()}
            onGrainChange={setGrain}
            showGrain={dataset().aggregate}
            canReset={canReset()}
            onReset={resetPeriod}
          />
        </Show>
        <Show when={notice()}>
          <div class="fixed inset-x-4 bottom-4 z-top sm:inset-x-auto sm:end-6 sm:w-[24rem]">
            <Notice
              text={notice()}
              onUndo={
                undoAction()
                  ? () => {
                      undoAction()?.()
                      setNotice('')
                      setUndoAction(null)
                    }
                  : undefined
              }
              onDismiss={() => {
                setNotice('')
                setUndoAction(null)
              }}
            />
          </div>
        </Show>
        <StatGrid compact stats={stats()} />
        <Show when={page() === 'Cash accounts'}>
          <section
            aria-label="Cash account balances"
            class="flex flex-col gap-3 rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-card-pad"
          >
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <h3 class="text-section text-ink-gray-9">Account balances</h3>
              <p class="text-caption text-ink-gray-7">
                As of {range()[1] ?? '2026-09-30'} · {dataset().count}{' '}
                {dataset().noun}
              </p>
            </div>
            <ScrollTable label="Cash account balance table">
              <table class="w-full min-w-[480px] text-interface">
                <ScrollTableHead>
                  <tr>
                    <th scope="col" class="px-4 py-3 text-start">
                      Account
                    </th>
                    <th scope="col" class="px-4 py-3 text-end">
                      Opening
                    </th>
                    <th scope="col" class="px-4 py-3 text-end">
                      Movement
                    </th>
                    <th scope="col" class="px-4 py-3 text-end">
                      Closing
                    </th>
                  </tr>
                </ScrollTableHead>
                <tbody>
                  <For each={accountBalances()}>
                    {(account) => (
                      <tr class="border-b border-outline-gray-1 last:border-b-0">
                        <th
                          scope="row"
                          class="px-4 py-3 text-start font-normal"
                        >
                          {account.account}
                        </th>
                        <td class="px-4 py-3 text-end tabular-nums">
                          {currency(account.opening)}
                        </td>
                        <td class="px-4 py-3 text-end tabular-nums">
                          {account.movement >= 0 ? '+' : ''}
                          {currency(account.movement)}
                        </td>
                        <td class="px-4 py-3 text-end font-medium tabular-nums">
                          {currency(account.closing)}
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
                <tfoot>
                  <tr class="border-t border-outline-gray-1 bg-surface-gray-1">
                    <th scope="row" class="px-4 py-3 text-start">
                      Total cash
                    </th>
                    <td class="px-4 py-3 text-end font-medium tabular-nums">
                      {currency(
                        accountBalances().reduce(
                          (sum, account) => sum + account.opening,
                          0,
                        ),
                      )}
                    </td>
                    <td class="px-4 py-3 text-end font-medium tabular-nums">
                      {currency(
                        accountBalances().reduce(
                          (sum, account) => sum + account.movement,
                          0,
                        ),
                      )}
                    </td>
                    <td class="px-4 py-3 text-end font-semibold tabular-nums">
                      {currency(cashTotal())}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </ScrollTable>
            <p class="text-caption text-ink-gray-7">
              Opening balances start at 1 April 2026 and roll forward through
              posted movements.
            </p>
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  setPage('Cashflow')
                  notify(
                    'Showing cashflow. Account movement is included in the posted totals.',
                  )
                }}
              >
                View cashflow ledger
              </Button>
            </div>
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
                yAxis={{ format: usdK }}
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
            <ExpenseRanking
              data={totals().filter((item) => item.name !== 'Revenue')}
            />
          </div>
          <TabButtons
            label="Cashflow direction"
            value={flow()}
            onValueChange={setFlow}
            options={[
              { label: 'Incoming', value: 'incoming' },
              { label: 'Outgoing', value: 'outgoing' },
            ]}
          />
          <div class="rounded-card border border-outline-gray-1 bg-surface-elevation-1">
            <div class="hidden sm:block">
              <ScrollTable label="Cashflow ledger" stickyHeader>
                <table class="w-full min-w-[640px] text-interface">
                  <ScrollTableHead>
                    <tr>
                      <For
                        each={[
                          'Description',
                          'Category',
                          'Date',
                          'Amount',
                          'Status',
                        ]}
                      >
                        {(title) => (
                          <th scope="col" class="px-4 py-3 text-start">
                            {title}
                          </th>
                        )}
                      </For>
                    </tr>
                  </ScrollTableHead>
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
                                transaction.status === 'Posted'
                                  ? 'green'
                                  : 'amber'
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
              </ScrollTable>
            </div>
            <ul
              aria-label="Cashflow ledger cards"
              class="flex flex-col divide-y divide-outline-gray-1 sm:hidden"
            >
              <For each={flowRows()}>
                {(transaction) => (
                  <li class="flex flex-col gap-1 p-3">
                    <div class="flex items-start justify-between gap-2">
                      <span class="min-w-0 text-interface font-medium [overflow-wrap:anywhere]">
                        {transaction.description}
                      </span>
                      <span class="shrink-0 tabular-nums">
                        {currency(transaction.amount)}
                      </span>
                    </div>
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <span class="text-caption text-ink-gray-7">
                        {transaction.category} · {transaction.date}
                      </span>
                      <Badge
                        theme={
                          transaction.status === 'Posted' ? 'green' : 'amber'
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </li>
                )}
              </For>
            </ul>
            <Show when={!flowRows().length}>
              <p class="p-8 text-center text-ink-gray-7">
                No transactions in this period.
              </p>
            </Show>
            <div class="flex flex-wrap items-center justify-between gap-2 border-t border-outline-gray-1 px-4 py-3 text-caption text-ink-gray-7">
              <span role="status">
                {dataset().count} {dataset().noun}
              </span>
              <span>{periodLabel()}</span>
            </div>
          </div>
        </Show>
        <Show when={page() === 'Expenses'}>
          <TransactionTable
            title="Expenses"
            rows={expenseRows()}
            columns={transactionColumns}
            actionLabel="Approve expenses"
            recordsLabel="expense records"
            pageSize={8}
            caption={`${dataset().count} expense records · ${periodLabel()}`}
            selectionSummary={(ids) =>
              currency(
                expenseRows()
                  .filter((row) => ids.includes(row.id))
                  .reduce((sum, row) => sum + row.amount, 0),
              )
            }
            rowSelectable={(row) => row.status === 'Pending'}
            onRowsAction={requestExpenses}
          />
        </Show>
        <Show when={page() === 'Payroll'}>
          <EmployeeTable
            title="Payroll"
            rows={employees()}
            columns={employeeColumns}
            actionLabel="Record payroll payments"
            recordsLabel="employees"
            caption={`${employees().length} employees · September 2026`}
            selectionSummary={(ids) =>
              currency(
                employees()
                  .filter((employee) => ids.includes(employee.id))
                  .reduce((sum, employee) => sum + employee.salary, 0),
              )
            }
            rowSelectable={(row) => row.status === 'Pending'}
            onRowsAction={requestPayroll}
          />
        </Show>
        <Show when={page() === 'Profit & loss'}>
          <section
            class="mx-auto w-full max-w-[56rem] rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-card-pad"
            aria-label="Profit and loss report"
          >
            <div class="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div class="flex flex-col gap-1">
                <h3 class="text-section">Statement</h3>
                <p class="text-caption text-ink-gray-7">
                  {dataset().count} lines · prior column is an illustrative 90%
                  cohort
                </p>
              </div>
              <Switch
                label="Show illustrative prior"
                checked={compare()}
                onCheckedChange={setCompare}
              />
            </div>
            <section
              class="overflow-x-auto rounded-3 focus-visible:focus-ring"
              tabindex="0"
              aria-label="Profit and loss figures"
            >
              <table class="w-full min-w-[400px] text-interface">
                <thead class="border-b border-outline-gray-1 text-caption text-ink-gray-7">
                  <tr>
                    <th class="p-3 text-start" scope="col">
                      Category
                    </th>
                    <th class="p-3 text-end" scope="col">
                      Selected period
                    </th>
                    <Show when={compare()}>
                      <th class="p-3 text-end" scope="col">
                        Illustrative prior
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
                          <td class="p-3 text-end tabular-nums text-ink-gray-7">
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
        <Show when={open() || employeeOpen() || confirmRequest()}>
          <AccountingDialogs
            open={open()}
            employeeOpen={employeeOpen()}
            confirm={confirmRequest()}
            onOpenChange={setOpen}
            onEmployeeOpenChange={setEmployeeOpen}
            onConfirmOpenChange={(value) => {
              if (!value) setConfirmRequest(null)
            }}
            onConfirm={completeRequest}
            onTransaction={(row) =>
              setTransactions((previous) => [row, ...previous])
            }
            onEmployee={(row) => setEmployees((previous) => [...previous, row])}
            onNotice={notify}
            nextId={() => nextId++}
          />
        </Show>
      </div>
    </AppPage>
  )
}
