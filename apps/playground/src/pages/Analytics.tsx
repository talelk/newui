import { FilterBar } from '@newui/blocks'
import {
  AreaChart,
  BarChart,
  ChartCard,
  DonutChart,
  NumberCard,
} from '@newui/charts'
import {
  Badge,
  Button,
  Icon,
  Pagination,
  Progress,
  Select,
  Switch,
  TextInput,
} from '@newui/ui'
import { A } from '@solidjs/router'
import {
  createMemo,
  createSignal,
  For,
  type JSX,
  lazy,
  Show,
  Suspense,
} from 'solid-js'
import { ThemeMenu } from '../shell/ThemeMenu'
import {
  channelSeries,
  comparisonSeries,
  csv,
  filterTransactions,
  money,
  percentageChange,
  previousTransactions,
  regionSeries,
  type SortKey,
  sortTransactions,
  statusSeries,
  summarize,
  type Transaction,
  transactions,
  updateTransactionStatus,
} from './analytics/data'

const ReceiptDialog = lazy(() => import('./analytics/ReceiptDialog'))

export function Analytics(): JSX.Element {
  const [sidebar, setSidebar] = createSignal(
    typeof window !== 'undefined' && window.innerWidth >= 1024,
  )
  const [region, setRegion] = createSignal('all')
  const [days, setDays] = createSignal('30')
  const [query, setQuery] = createSignal('')
  const [page, setPage] = createSignal(1)
  const [sortKey, setSortKey] = createSignal<SortKey>('day')
  const [ascending, setAscending] = createSignal(false)
  const [state, setState] = createSignal('ready')
  const [compare, setCompare] = createSignal(true)
  const [records, setRecords] = createSignal(
    transactions.map((row) => ({ ...row })),
  )
  const [receiptId, setReceiptId] = createSignal<string>()
  const [notice, setNotice] = createSignal('')
  const [undoRecords, setUndoRecords] = createSignal<Transaction[]>()
  const selectedReceipt = createMemo(() =>
    records().find((row) => row.id === receiptId()),
  )
  const rows = createMemo(() =>
    filterTransactions(
      region(),
      Number(days()),
      query(),
      state() === 'empty',
      records(),
    ),
  )
  const summary = createMemo(() => summarize(rows()))
  const previousRows = createMemo(() =>
    filterTransactions(
      region(),
      Number(days()),
      query(),
      state() === 'empty',
      previousTransactions,
    ),
  )
  const previous = createMemo(() => summarize(previousRows()))
  const trend = createMemo(() =>
    comparisonSeries(rows(), previousRows(), Number(days())),
  )
  const revenueGoal = () =>
    (150000 * (region() === 'all' ? 1 : 1 / 3) * Number(days())) / 30
  const goalProgress = () =>
    Math.min(100, (summary().revenue / revenueGoal()) * 100)
  const leadingChannel = createMemo(
    () => channelSeries(rows()).sort((a, b) => b.Revenue - a.Revenue)[0],
  )
  const deltaFormat = (value: number) => value.toFixed(1)
  const changeStatus = (id: string, status: Transaction['status']) => {
    setUndoRecords(records())
    setRecords((rows) => updateTransactionStatus(rows, id, status))
    setReceiptId(undefined)
    setNotice(
      `${id} is now ${status.toLowerCase()}. Metrics, charts and exports have been updated.`,
    )
  }
  const sorted = createMemo(() =>
    sortTransactions(rows(), sortKey(), ascending()),
  )
  const visible = createMemo(() => sorted().slice((page() - 1) * 8, page() * 8))
  const loading = () => state() === 'loading'
  const error = () =>
    state() === 'error'
      ? 'The report could not be loaded. Try again.'
      : undefined
  const unavailable = () => loading() || Boolean(error())
  const update = (setter: (value: string) => unknown, value: string) => {
    setter(value)
    setPage(1)
  }
  const sort = (key: SortKey) => {
    setAscending(sortKey() === key ? !ascending() : true)
    setSortKey(key)
    setPage(1)
  }
  const exportCsv = () => {
    const url = URL.createObjectURL(
      new Blob([csv(sorted())], { type: 'text/csv;charset=utf-8' }),
    )
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'revenue-september-2026.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }
  const sortState = (key: SortKey): 'ascending' | 'descending' | 'none' =>
    sortKey() === key ? (ascending() ? 'ascending' : 'descending') : 'none'

  return (
    <div
      class="min-h-screen bg-surface-gray-1 text-interface text-ink-gray-9"
      data-slot="analytics"
    >
      <a href="#analytics-content" class="sr-only focus:not-sr-only">
        Skip to report
      </a>
      <header class="flex min-h-12 flex-wrap items-center justify-between gap-3 border-b border-outline-gray-1 bg-surface-elevation-1 px-4 md:px-6">
        <div class="flex items-center gap-3">
          <Button
            icon="lucide-panel-left"
            size="lg"
            variant="ghost"
            aria-label="Toggle workspace navigation"
            aria-expanded={sidebar()}
            aria-controls="analytics-nav"
            onClick={() => setSidebar(!sidebar())}
          />
          <a
            href="/"
            class="flex items-center gap-2 font-semibold focus-visible:focus-ring"
          >
            <img src="/favicon.svg" alt="" class="size-6" /> newui{' '}
            <span class="hidden font-normal text-ink-gray-6 sm:inline">
              / Acme workspace
            </span>
          </a>
        </div>
        <div class="flex max-w-full flex-wrap items-center gap-2">
          <span class="hidden text-caption text-ink-gray-6 sm:inline">
            September 2026 · Demo workspace
          </span>
          <ThemeMenu />
          <span
            class="grid size-7 place-items-center rounded-full bg-surface-blue-2 text-caption text-ink-blue-8"
            role="img"
            aria-label="Alex Morgan"
          >
            AM
          </span>
        </div>
      </header>
      <div class="flex">
        <Show when={sidebar()}>
          <aside
            id="analytics-nav"
            class="w-48 shrink-0 border-e border-outline-gray-1 bg-surface-elevation-1 p-3 max-md:fixed max-md:inset-y-12 max-md:start-0 max-md:z-20 max-md:shadow-lg"
          >
            <nav aria-label="Workspace" class="flex flex-col gap-2">
              <p class="mb-2 text-caption text-ink-gray-6">WORKSPACE</p>
              <A
                href="#analytics-content"
                aria-current="page"
                class="flex items-center gap-2 rounded-3 bg-surface-blue-2 px-3 py-2 text-ink-blue-8 focus-visible:focus-ring"
                onClick={() => setSidebar(false)}
              >
                <Icon icon="lucide-chart-no-axes-combined" class="size-4" />
                Overview
              </A>
              <A
                href="#transactions"
                class="rounded-3 px-3 py-2 hover:bg-surface-gray-2 focus-visible:focus-ring"
                onClick={() => setSidebar(false)}
              >
                Transactions
              </A>
              <a
                href="/examples"
                class="rounded-3 px-3 py-2 hover:bg-surface-gray-2 focus-visible:focus-ring"
              >
                All examples{' '}
                <span
                  aria-hidden="true"
                  class="lucide-arrow-up-right inline-block size-4 align-middle"
                />
              </a>
              <a
                href="/components"
                class="rounded-3 px-3 py-2 hover:bg-surface-gray-2 focus-visible:focus-ring"
              >
                Component library{' '}
                <span
                  aria-hidden="true"
                  class="lucide-arrow-up-right inline-block size-4 align-middle"
                />
              </a>
            </nav>
          </aside>
        </Show>
        <main
          id="analytics-content"
          class="mx-auto flex min-w-0 max-w-[1440px] flex-1 flex-col gap-4 p-3 md:p-4"
        >
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p class="mb-1 text-caption text-ink-gray-6">
                WORKSPACE / ANALYTICS
              </p>
              <h1 class="text-heading">Revenue overview</h1>
              <p class="mt-2 text-ink-gray-6">
                A clear view of how your business is growing.
              </p>
            </div>
            <Button
              variant="solid"
              theme="blue"
              iconLeft="lucide-download"
              disabled={unavailable() || rows().length === 0}
              onClick={exportCsv}
            >
              Export report
            </Button>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <FilterBar
              selects={[
                {
                  label: 'Date range',
                  value: days(),
                  options: [
                    { label: 'Last 30 days', value: '30' },
                    { label: 'Last 7 days', value: '7' },
                  ],
                  onValueChange: (value) => update(setDays, value),
                },
                {
                  label: 'Region',
                  value: region(),
                  options: [
                    'all',
                    'Europe',
                    'North America',
                    'Asia Pacific',
                  ].map((value) => ({
                    value,
                    label: value === 'all' ? 'All regions' : value,
                  })),
                  onValueChange: (value) => update(setRegion, value),
                },
              ]}
            />
            <div class="flex max-w-full flex-wrap items-center gap-2">
              <span class="text-caption text-ink-gray-6">Preview state</span>
              <div class="w-32 max-w-full">
                <Select
                  aria-label="Preview state"
                  value={[state()]}
                  options={['ready', 'loading', 'empty', 'error'].map(
                    (value) => ({
                      value,
                      label: value.charAt(0).toUpperCase() + value.slice(1),
                    }),
                  )}
                  onValueChange={(value) =>
                    update(setState, value[0] ?? 'ready')
                  }
                />
              </div>
            </div>
          </div>
          <section
            aria-label="Key performance indicators"
            class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <NumberCard
              title="Total revenue"
              value={summary().revenue}
              format={money}
              loading={loading()}
              error={error()}
              delta={
                compare()
                  ? percentageChange(summary().revenue, previous().revenue)
                  : undefined
              }
              deltaSuffix="%"
              deltaFormat={deltaFormat}
              deltaCaption={
                compare()
                  ? 'vs. prior month'
                  : 'Paid transactions in this period'
              }
            />
            <NumberCard
              title="Transactions"
              value={summary().orders}
              loading={loading()}
              error={error()}
              delta={
                compare()
                  ? percentageChange(summary().orders, previous().orders)
                  : undefined
              }
              deltaSuffix="%"
              deltaFormat={deltaFormat}
              deltaCaption={
                compare() ? 'vs. prior month' : 'Across all selected channels'
              }
            />
            <NumberCard
              title="Average order value"
              value={summary().average}
              format={money}
              loading={loading()}
              error={error()}
              delta={
                compare()
                  ? percentageChange(summary().average, previous().average)
                  : undefined
              }
              deltaSuffix="%"
              deltaFormat={deltaFormat}
              deltaCaption={
                compare() ? 'vs. prior month' : 'Per paid transaction'
              }
            />
            <NumberCard
              title="Payment success"
              value={summary().paidRate}
              suffix="%"
              loading={loading()}
              error={error()}
              delta={
                compare() ? summary().paidRate - previous().paidRate : undefined
              }
              deltaSuffix=" pts"
              deltaFormat={deltaFormat}
              deltaCaption={
                compare() ? 'vs. prior month' : 'Share of transactions paid'
              }
            />
          </section>
          <section
            aria-label="Revenue charts"
            class="grid min-w-0 gap-4 xl:grid-cols-3"
          >
            <ChartCard class="xl:col-span-2">
              <AreaChart
                data={rows().length ? trend() : []}
                x="date"
                y={compare() ? ['Revenue', 'Previous'] : 'Revenue'}
                seriesConfig={{
                  Previous: {
                    type: 'line',
                    dashed: true,
                    label: 'Prior month',
                  },
                }}
                title="Revenue over time"
                subtitle="Paid revenue · USD"
                height={260}
                loading={loading()}
                error={error()}
                yAxis={{
                  min: 0,
                  format: (value) => `$${Math.round(value / 1000)}k`,
                }}
                smooth
              />
              <p class="mt-2 text-caption text-ink-gray-6">
                Solid line: selected period.
                <Show when={compare()}> Dashed line: prior month.</Show>
              </p>
            </ChartCard>
            <ChartCard>
              <BarChart
                data={rows().length ? channelSeries(rows()) : []}
                x="channel"
                y="Revenue"
                horizontal
                title="Revenue by channel"
                subtitle="Where your customers find you"
                height={260}
                loading={loading()}
                error={error()}
              />
            </ChartCard>
          </section>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-section">Understand the details</h2>
            <Switch
              label="Compare prior month"
              checked={compare()}
              onCheckedChange={setCompare}
            />
          </div>
          <section
            aria-label="Payment and regional breakdown"
            class="grid min-w-0 gap-4 lg:grid-cols-2"
          >
            <ChartCard>
              <DonutChart
                data={rows().length ? statusSeries(rows()) : []}
                category="status"
                value="Transactions"
                title="Payment mix"
                subtitle="Paid, pending and refunded transactions"
                centerLabel="Transactions"
                height={260}
                loading={loading()}
                error={error()}
                showDataLabels
              />
            </ChartCard>
            <ChartCard>
              <BarChart
                data={rows().length ? regionSeries(rows()) : []}
                x="region"
                y="Revenue"
                horizontal
                title="Revenue by region"
                subtitle="Paid revenue across the selected regions"
                height={260}
                loading={loading()}
                error={error()}
              />
            </ChartCard>
          </section>
          <section
            aria-label="Revenue insights"
            class="grid gap-4 lg:grid-cols-2"
          >
            <div class="rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="text-interface font-semibold">
                  Period revenue goal
                </h2>
                <span class="text-caption text-ink-gray-6">
                  {Number(days())} days ·{' '}
                  {region() === 'all' ? 'All regions' : region()}
                </span>
              </div>
              <Show
                when={!unavailable()}
                fallback={
                  <p class="mt-3 text-ink-gray-6">
                    Revenue goal data is unavailable.
                  </p>
                }
              >
                <p class="my-3 text-section tabular-nums">
                  {money(summary().revenue)}{' '}
                  <span class="text-interface font-normal text-ink-gray-6">
                    of {money(revenueGoal())}
                  </span>
                </p>
                <Progress
                  value={goalProgress()}
                  aria-label="Monthly revenue goal"
                  size="lg"
                />
                <p class="mt-2 text-caption text-ink-gray-6">
                  {goalProgress().toFixed(1)}% of the period goal reached.
                </p>
              </Show>
            </div>
            <div class="rounded-5 border border-outline-blue-1 bg-surface-blue-1 p-3">
              <p class="text-caption font-medium text-ink-blue-8">
                CHANNEL INSIGHT
              </p>
              <Show
                when={!unavailable() && summary().revenue > 0}
                fallback={
                  <p class="mt-3 text-ink-gray-6">
                    Insights appear when paid revenue is available.
                  </p>
                }
              >
                <h2 class="mt-2 text-section text-ink-gray-9">
                  {leadingChannel()?.channel} leads the way.
                </h2>
                <p class="mt-2 text-interface text-ink-gray-7">
                  {money(leadingChannel()?.Revenue ?? 0)} in paid revenue,
                  representing{' '}
                  {(
                    ((leadingChannel()?.Revenue ?? 0) / summary().revenue) *
                    100
                  ).toFixed(1)}
                  % of this selection. Open a receipt below to explore the
                  payment details.
                </p>
              </Show>
            </div>
          </section>
          <Show when={notice()}>
            <div
              role="status"
              class="flex flex-wrap items-center justify-between gap-3 rounded-3 border border-outline-green-3 bg-surface-green-1 px-4 py-3"
            >
              <p class="text-interface text-ink-green-8">{notice()}</p>
              <Show when={undoRecords()}>
                <Button
                  variant="outline"
                  onClick={() => {
                    const previous = undoRecords()
                    if (previous) setRecords(previous)
                    setUndoRecords(undefined)
                    setNotice('The transaction change was undone.')
                  }}
                >
                  Undo change
                </Button>
              </Show>
            </div>
          </Show>
          <section
            id="transactions"
            class="min-w-0 overflow-hidden rounded-5 border border-outline-gray-1 bg-surface-elevation-1"
            aria-labelledby="transactions-title"
          >
            <div class="flex flex-wrap items-center justify-between gap-3 p-3">
              <div>
                <h2 id="transactions-title" class="text-section">
                  Transactions
                </h2>
                <p class="text-caption text-ink-gray-6">
                  Your latest activity, all in one place.
                </p>
              </div>
              <div class="w-full sm:w-64">
                <TextInput
                  type="search"
                  aria-label="Search transactions"
                  placeholder="Search transactions…"
                  value={query()}
                  prefix={<Icon icon="lucide-search" class="size-4" />}
                  onInput={(event) =>
                    update(setQuery, event.currentTarget.value)
                  }
                />
              </div>
            </div>
            <Show
              when={!unavailable()}
              fallback={
                <div role="status" class="p-8 text-center text-ink-gray-6">
                  {error() ?? 'Loading transactions…'}
                  <Show when={error()}>
                    <div class="mt-3">
                      <Button onClick={() => setState('ready')}>
                        Try again
                      </Button>
                    </div>
                  </Show>
                </div>
              }
            >
              <section
                class="overflow-x-auto"
                aria-label="Transaction table"
                tabindex="0"
              >
                <table class="w-full min-w-[680px] border-collapse text-start">
                  <thead class="border-y border-outline-gray-1 bg-surface-gray-1 text-caption text-ink-gray-6">
                    <tr>
                      <th
                        scope="col"
                        class="px-4 py-3 text-start"
                        aria-sort={sortState('customer')}
                      >
                        <button
                          type="button"
                          class="rounded-3 focus-visible:focus-ring"
                          onClick={() => sort('customer')}
                        >
                          Customer{' '}
                          <span
                            aria-hidden="true"
                            class="lucide-arrow-up-down inline-block size-4 align-middle"
                          />
                        </button>
                      </th>
                      <th scope="col" class="px-4 py-3 text-start">
                        Status
                      </th>
                      <th scope="col" class="px-4 py-3 text-start">
                        Channel
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-3 text-start"
                        aria-sort={sortState('day')}
                      >
                        <button
                          type="button"
                          class="rounded-3 focus-visible:focus-ring"
                          onClick={() => sort('day')}
                        >
                          Date{' '}
                          <span
                            aria-hidden="true"
                            class="lucide-arrow-up-down inline-block size-4 align-middle"
                          />
                        </button>
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-3 text-end"
                        aria-sort={sortState('amount')}
                      >
                        <button
                          type="button"
                          class="rounded-3 focus-visible:focus-ring"
                          onClick={() => sort('amount')}
                        >
                          Amount{' '}
                          <span
                            aria-hidden="true"
                            class="lucide-arrow-up-down inline-block size-4 align-middle"
                          />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={visible()}>
                      {(row) => (
                        <tr class="border-b border-outline-gray-1 hover:bg-surface-gray-1">
                          <td class="px-4 py-3">
                            <button
                              type="button"
                              aria-label={`View invoice ${row.id} for ${row.customer}`}
                              class="rounded-3 text-start font-medium hover:text-ink-blue-link focus-visible:focus-ring"
                              onClick={() => setReceiptId(row.id)}
                            >
                              {row.customer}
                            </button>
                            <div class="text-caption text-ink-gray-6">
                              {row.id}
                            </div>
                          </td>
                          <td class="px-4 py-3">
                            <Badge
                              theme={
                                row.status === 'Paid'
                                  ? 'green'
                                  : row.status === 'Pending'
                                    ? 'amber'
                                    : 'gray'
                              }
                            >
                              {row.status}
                            </Badge>
                          </td>
                          <td class="px-4 py-3 text-ink-gray-6">
                            {row.channel}
                          </td>
                          <td class="px-4 py-3 text-ink-gray-6">
                            Sep {row.day}, 2026
                          </td>
                          <td class="px-4 py-3 text-end font-medium tabular-nums">
                            {money(row.amount)}
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </section>
              <Show when={rows().length === 0}>
                <div
                  role="status"
                  class="flex flex-col items-center gap-2 p-10"
                >
                  <Icon icon="lucide-search" class="size-6 text-ink-gray-6" />
                  <h3 class="font-medium">No transactions found</h3>
                  <p class="text-ink-gray-6">
                    Try another search or reset your filters.
                  </p>
                  <Button
                    onClick={() => {
                      setQuery('')
                      setRegion('all')
                      setDays('30')
                      setState('ready')
                      setPage(1)
                    }}
                  >
                    Reset filters
                  </Button>
                </div>
              </Show>
              <div class="flex flex-wrap items-center justify-between gap-3 p-3">
                <p class="text-caption text-ink-gray-6" role="status">
                  {rows().length} transactions ·{' '}
                  {region() === 'all' ? 'All regions' : region()}
                </p>
                <Pagination.Root
                  page={page()}
                  onPageChange={setPage}
                  count={rows().length}
                  pageSize={8}
                  size="md"
                >
                  <Pagination.Range />
                  <Pagination.PrevTrigger />
                  <Pagination.Pages />
                  <Pagination.NextTrigger />
                </Pagination.Root>
              </div>
            </Show>
          </section>
          <footer class="flex flex-wrap justify-between gap-2 text-caption text-ink-gray-6">
            <span>Built with newui · Local demo data</span>
            <a
              href="/docs"
              class="rounded-3 hover:text-ink-blue-link focus-visible:focus-ring"
            >
              Build your own dashboard{' '}
              <span
                aria-hidden="true"
                class="lucide-arrow-right inline-block size-4 align-middle"
              />
            </a>
          </footer>
        </main>
      </div>
      <Show when={selectedReceipt()}>
        {(receipt) => (
          <Suspense>
            <ReceiptDialog
              transaction={receipt()}
              onClose={() => setReceiptId(undefined)}
              onStatusChange={changeStatus}
            />
          </Suspense>
        )}
      </Show>
    </div>
  )
}
