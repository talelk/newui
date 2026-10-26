import { Badge, Button, Skeleton, Switch } from '@talelk/newui-atoms'
import {
  AreaChart,
  BarChart,
  ChartCard,
  ChartLegend,
  DonutChart,
  NumberCard,
  type NumberCardProps,
  paletteColors,
  useChartTokens,
} from '@talelk/newui-charts'
import {
  count,
  createUndo,
  downloadText,
  usd as money,
  usdK,
} from '@talelk/newui-data'
import { Alert, EmptyState, Select } from '@talelk/newui-molecules'
import {
  DataTable,
  type DataTableColumn,
  FilterBar,
} from '@talelk/newui-organisms'
import {
  createMemo,
  createSignal,
  For,
  type JSX,
  lazy,
  Show,
  Suspense,
} from 'solid-js'
import { AppNavigation } from '../examples/AppNavigation'
import { AppPage } from '../examples/AppPage'
import { Notice } from '../examples/Notice'
import {
  channelSeries,
  comparisonSeries,
  csv,
  filterTransactions,
  percentageChange,
  previousTransactions,
  regionSeries,
  sortTransactions,
  statusSeries,
  summarize,
  type Transaction,
  transactions,
  updateTransactionStatus,
} from './analytics/data'

const ReceiptDialog = lazy(() => import('./analytics/ReceiptDialog'))

const KPI_SKELETONS = [0, 1, 2, 3]

/** Four KPI placeholders that keep the metric geometry while the report loads. */
function KpiLoadingCards(): JSX.Element {
  return (
    <For each={KPI_SKELETONS}>
      {() => (
        <div
          aria-hidden="true"
          class="flex min-h-48 flex-col rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-card-pad"
        >
          <div class="flex items-start justify-between gap-2">
            <Skeleton class="h-4 w-28 rounded-3" />
            <Skeleton class="h-5 w-14 rounded-full" />
          </div>
          <Skeleton class="mt-3 h-8 w-32 rounded-3" />
          <Skeleton class="mt-3 h-3 w-40 rounded-3" />
          <Skeleton class="mt-auto h-12 w-full rounded-3" />
        </div>
      )}
    </For>
  )
}

export function Analytics(): JSX.Element {
  const chartTokens = useChartTokens()
  const [nav, setNav] = createSignal('Overview')
  const [region, setRegion] = createSignal('all')
  const [days, setDays] = createSignal('30')
  const [query, setQuery] = createSignal('')
  const [state, setState] = createSignal('ready')
  const [compare, setCompare] = createSignal(true)
  const [records, setRecords] = createSignal(
    transactions.map((row) => ({ ...row })),
  )
  const [receiptId, setReceiptId] = createSignal<string>()
  const [notice, setNotice] = createSignal('')
  const recordUndo = createUndo<Transaction[]>()
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
  const hasRows = () => rows().length > 0
  const summary = createMemo(() => summarize(rows()))
  const allRegionRows = createMemo(() =>
    filterTransactions(
      'all',
      Number(days()),
      query(),
      state() === 'empty',
      records(),
    ),
  )
  const allRegionRevenue = createMemo(() => summarize(allRegionRows()).revenue)
  const regionShare = () =>
    allRegionRevenue() > 0 ? (summary().revenue / allRegionRevenue()) * 100 : 0
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
  const leadingChannel = createMemo(
    () => channelSeries(rows()).sort((a, b) => b.Revenue - a.Revenue)[0],
  )
  const statusPalette = createMemo(() => {
    const tokens = chartTokens()
    if (typeof document === 'undefined') return tokens.series.slice(1, 4)
    const styles = getComputedStyle(document.documentElement)
    const read = (name: string) => styles.getPropertyValue(name).trim()
    return [
      read('--chart-2') || tokens.series[1] || 'currentColor',
      read('--chart-3') || tokens.series[2] || 'currentColor',
      read('--ink-gray-4') || tokens.series[3] || 'currentColor',
    ]
  })
  const deltaFormat = (value: number) => value.toFixed(1)
  const axisMoney = (value: number) => {
    if (Math.abs(value) < 1000) return money(value)
    const compact = value / 1000
    return `$${compact.toFixed(1).replace(/\.0$/, '')}k`
  }
  const changeStatus = (id: string, status: Transaction['status']) => {
    recordUndo.capture(records())
    setRecords((rows) => updateTransactionStatus(rows, id, status))
    setReceiptId(undefined)
    setNotice(
      `${id} is now ${status.toLowerCase()}. Metrics, charts and exports have been updated.`,
    )
  }
  // Latest first on arrival; DataTable owns sorting/paging from there.
  const sorted = createMemo(() => sortTransactions(rows(), 'day', false))
  const loading = () => state() === 'loading'
  const error = () =>
    state() === 'error' ? 'Check your connection, then try again.' : undefined
  const unavailable = () => loading() || Boolean(error())
  const scopeDescription = () =>
    `${days() === '30' ? 'Last 30 days' : `Last ${days()} days`} · ${
      region() === 'all' ? 'All regions' : region()
    } · paid revenue in USD.`
  const hasActiveFilters = () =>
    region() !== 'all' || days() !== '30' || query().length > 0
  // DataTable resets to page 1 whenever the filtered row set changes.
  const update = (setter: (value: string) => unknown, value: string) => {
    setter(value)
  }
  const clearFilters = () => {
    update(setRegion, 'all')
    update(setDays, '30')
    update(setQuery, '')
    update(setState, 'ready')
  }
  const exportName = () => {
    const regionPart =
      region() === 'all'
        ? 'all-regions'
        : region().toLowerCase().replace(/\s+/g, '-')
    return `revenue-2026-09-${regionPart}-last-${days()}-days${
      query() ? '-search' : ''
    }.csv`
  }
  const exportCsv = () =>
    downloadText(exportName(), csv(sorted()), 'text/csv;charset=utf-8')
  const transactionColumns: DataTableColumn<Transaction>[] = [
    {
      accessorKey: 'customer',
      header: 'Customer',
      sortFn: 'text',
      sortDescFirst: false,
      meta: { mobile: 'title' },
      cell: (context) => (
        <>
          <button
            type="button"
            aria-label={`View invoice ${context.row.original.id} for ${context.row.original.customer}`}
            class="rounded-3 text-start font-medium hover:text-ink-blue-link focus-visible:focus-ring"
            onClick={() => setReceiptId(context.row.original.id)}
          >
            {context.row.original.customer}
          </button>
          <div class="text-caption text-ink-gray-7">
            {context.row.original.id}
          </div>
        </>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: false,
      meta: { mobile: 'status' },
      cell: (context) => (
        <Badge
          theme={
            context.row.original.status === 'Paid'
              ? 'green'
              : context.row.original.status === 'Pending'
                ? 'amber'
                : 'gray'
          }
        >
          {context.row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'channel',
      header: 'Channel',
      enableSorting: false,
      meta: { mobile: 'meta' },
      cell: (context) => (
        <span class="text-ink-gray-7">{context.row.original.channel}</span>
      ),
    },
    {
      accessorKey: 'day',
      header: 'Date',
      sortFn: 'alphanumeric',
      sortDescFirst: false,
      meta: { mobile: 'subtitle' },
      cell: (context) => (
        <span class="text-ink-gray-7">
          Sep {context.row.original.day}, 2026
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      sortFn: 'alphanumeric',
      sortDescFirst: false,
      meta: { align: 'end', mobile: 'amount' },
      cell: (context) => (
        <span class="font-medium tabular-nums">
          {money(context.row.original.amount)}
        </span>
      ),
    },
  ]
  const kpis = createMemo<NumberCardProps[]>(() => [
    {
      title: 'Total revenue',
      value: hasRows() ? summary().revenue : null,
      target: hasRows() ? revenueGoal() : undefined,
      format: money,
      sparkline: hasRows()
        ? { data: trend().map((point) => point.Revenue) }
        : undefined,
      delta:
        hasRows() && compare()
          ? percentageChange(summary().revenue, previous().revenue)
          : undefined,
      deltaSuffix: '%',
      deltaFormat,
      deltaCaption: hasRows()
        ? compare()
          ? `from ${money(previous().revenue)} last month`
          : 'Paid transactions in this period'
        : undefined,
    },
    {
      title: 'Transactions',
      value: hasRows() ? summary().orders : null,
      delta:
        hasRows() && compare()
          ? percentageChange(summary().orders, previous().orders)
          : undefined,
      deltaSuffix: '%',
      deltaFormat,
      deltaCaption: hasRows()
        ? compare()
          ? `from ${count(previous().orders)} last month`
          : 'Across all selected channels'
        : undefined,
    },
    {
      title: 'Average order value',
      value: hasRows() ? summary().average : null,
      format: money,
      delta:
        hasRows() && compare()
          ? percentageChange(summary().average, previous().average)
          : undefined,
      deltaSuffix: '%',
      deltaFormat,
      deltaCaption: hasRows()
        ? compare()
          ? `from ${money(previous().average)} last month`
          : 'Per paid transaction'
        : undefined,
    },
    {
      title: 'Payment success',
      value: hasRows() ? Math.round(summary().paidRate * 10) / 10 : null,
      suffix: '%',
      delta:
        hasRows() && compare()
          ? summary().paidRate - previous().paidRate
          : undefined,
      deltaSuffix: ' pts',
      deltaFormat,
      deltaCaption: hasRows()
        ? compare()
          ? `from ${previous().paidRate.toFixed(1)}% last month`
          : 'Share of transactions paid'
        : undefined,
    },
  ])

  return (
    <AppPage
      section="Analytics"
      title="Revenue overview"
      description={scopeDescription()}
      actions={
        <Button
          variant="solid"
          theme="blue"
          iconLeft="lucide-download"
          disabled={unavailable() || rows().length === 0}
          onClick={exportCsv}
        >
          Export report
        </Button>
      }
      navigation={() => (
        <AppNavigation
          label="Analytics sections"
          heading="Workspace"
          value={nav()}
          onChange={(label) => {
            setNav(label)
            if (label === 'Overview')
              document
                .querySelector<HTMLElement>('[data-slot="app-shell-content"]')
                ?.scrollTo({ top: 0 })
            if (label === 'Transactions')
              document
                .getElementById('transactions')
                ?.scrollIntoView({ block: 'start' })
          }}
          items={[
            { label: 'Overview', icon: 'lucide-chart-no-axes-combined' },
            {
              label: 'Transactions',
              icon: 'lucide-receipt',
              count: unavailable() ? undefined : rows().length,
            },
          ]}
        />
      )}
    >
      <FilterBar
        query={{
          placeholder: 'Search transactions…',
          value: query(),
          onInput: (value) => update(setQuery, value),
        }}
        selects={[
          {
            label: 'Date range',
            value: days(),
            options: [
              { label: 'Last 30 days', value: '30' },
              { label: 'Last 7 days', value: '7' },
            ],
            onValueChange: (value) => update(setDays, value || '30'),
          },
          {
            label: 'Region',
            value: region(),
            options: [
              { label: 'All regions', value: 'all' },
              ...['Europe', 'North America', 'Asia Pacific'].map((value) => ({
                value,
                label: value,
              })),
            ],
            onValueChange: (value) => update(setRegion, value || 'all'),
          },
        ]}
        chips={[
          ...(region() !== 'all'
            ? [
                {
                  label: `Region: ${region()}`,
                  onRemove: () => update(setRegion, 'all'),
                },
              ]
            : []),
          ...(days() !== '30'
            ? [
                {
                  label: `Range: Last ${days()} days`,
                  onRemove: () => update(setDays, '30'),
                },
              ]
            : []),
          ...(query()
            ? [
                {
                  label: `Search: ${query()}`,
                  onRemove: () => update(setQuery, ''),
                },
              ]
            : []),
        ]}
        resultCount={unavailable() ? undefined : rows().length}
        onClearAll={hasActiveFilters() ? clearFilters : undefined}
      >
        <div class="flex max-w-full flex-wrap items-center gap-3">
          <Switch
            label="Compare prior month"
            checked={compare()}
            onCheckedChange={setCompare}
          />
          <div class="flex max-w-full flex-wrap items-center gap-2">
            <span class="text-caption text-ink-gray-7">Demo state</span>
            <div class="w-32 max-w-full">
              <Select
                aria-label="Preview state"
                value={state()}
                options={['ready', 'loading', 'empty', 'error'].map(
                  (value) => ({
                    value,
                    label: value.charAt(0).toUpperCase() + value.slice(1),
                  }),
                )}
                onValueChange={(value) => update(setState, value ?? 'ready')}
              />
            </div>
          </div>
        </div>
      </FilterBar>
      <Show when={error()}>
        {(message) => (
          <Alert
            class="min-w-0"
            theme="red"
            variant="outline"
            title="The report could not be loaded."
            description={message()}
            primaryAction={{
              label: 'Try again',
              onClick: () => {
                setState('ready')
              },
            }}
          />
        )}
      </Show>
      <Show when={!error()}>
        <section
          aria-label="Key performance indicators"
          aria-busy={loading()}
          class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <Show when={loading()}>
            <span class="sr-only" role="status">
              Loading report
            </span>
          </Show>
          <Show when={!loading()} fallback={<KpiLoadingCards />}>
            <Show
              when={hasRows()}
              fallback={
                <div class="rounded-card border border-outline-gray-1 bg-surface-elevation-1 sm:col-span-2 xl:col-span-4">
                  <EmptyState
                    icon="lucide-inbox"
                    size="sm"
                    title="No data for this selection"
                    description="Try another region, date range, or search."
                  />
                </div>
              }
            >
              <For each={kpis()}>{(kpi) => <NumberCard {...kpi} />}</For>
            </Show>
          </Show>
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
              yAxis={{
                min: 0,
                format: axisMoney,
              }}
              smooth
            />
            <ChartLegend
              items={(compare() ? ['Revenue', 'Previous'] : ['Revenue']).map(
                (name, index) => ({
                  name,
                  label: name === 'Previous' ? 'Prior month' : name,
                  color:
                    paletteColors('sequential', chartTokens(), 2)[index] ??
                    'currentColor',
                }),
              )}
            />
          </ChartCard>
          <ChartCard>
            <BarChart
              data={rows().length ? channelSeries(rows()) : []}
              x="channel"
              y="Revenue"
              horizontal
              title="Revenue by channel"
              subtitle="Paid revenue by acquisition channel · USD"
              height={260}
              loading={loading()}
              yAxis={{ min: 0, format: axisMoney }}
              seriesConfig={{ Revenue: { format: usdK } }}
              showDataLabels
            />
          </ChartCard>
        </section>
        <h2 class="text-section">Payment and regions</h2>
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
              palette={statusPalette()}
              showDataLabels
            />
          </ChartCard>
          <Show
            when={region() !== 'all' && hasRows() && !loading()}
            fallback={
              <ChartCard>
                <BarChart
                  data={rows().length ? regionSeries(rows()) : []}
                  x="region"
                  y="Revenue"
                  horizontal
                  title="Revenue by region"
                  subtitle="Paid revenue by region · USD"
                  height={260}
                  loading={loading()}
                  yAxis={{ min: 0, format: axisMoney }}
                />
              </ChartCard>
            }
          >
            <ChartCard>
              <div class="flex h-full min-h-64 flex-col">
                <div>
                  <h3 class="text-base font-semibold text-ink-gray-9">
                    {region()} focus
                  </h3>
                  <p class="text-caption text-ink-gray-7">
                    Paid revenue and share · USD
                  </p>
                </div>
                <div class="my-3 border-t border-outline-gray-1" />
                <p class="text-metric tabular-nums text-ink-gray-9">
                  {regionShare().toFixed(1)}%
                </p>
                <p class="text-caption text-ink-gray-7">
                  of all-region paid revenue
                </p>
                <dl class="mt-auto grid grid-cols-2 gap-3 pt-4 text-interface">
                  <div>
                    <dt class="text-caption text-ink-gray-7">Paid revenue</dt>
                    <dd class="mt-0.5 font-medium tabular-nums">
                      {money(summary().revenue)}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-caption text-ink-gray-7">Transactions</dt>
                    <dd class="mt-0.5 font-medium tabular-nums">
                      {count(summary().orders)}
                    </dd>
                  </div>
                </dl>
              </div>
            </ChartCard>
          </Show>
        </section>
        <section aria-label="Revenue insights" class="grid gap-4">
          <Show
            when={!loading()}
            fallback={
              <div class="rounded-card border border-outline-gray-1 bg-surface-elevation-1 p-card-pad">
                <Skeleton lines={3} />
              </div>
            }
          >
            <Show
              when={hasRows() && summary().revenue > 0}
              fallback={
                <Alert
                  theme="blue"
                  title="Channel insight"
                  description="Insights appear when paid revenue is available."
                />
              }
            >
              <Alert
                theme="blue"
                title={`${leadingChannel()?.channel ?? 'A channel'} leads the way.`}
                description={`${money(leadingChannel()?.Revenue ?? 0)} in paid revenue, representing ${(((leadingChannel()?.Revenue ?? 0) / summary().revenue) * 100).toFixed(1)}% of this selection. Open a receipt below to explore the payment details.`}
              />
            </Show>
          </Show>
        </section>
        <Notice
          text={notice()}
          tone="green"
          onUndo={
            recordUndo.snapshot()
              ? () => {
                  recordUndo.undo(setRecords)
                  setNotice('The transaction change was undone.')
                }
              : undefined
          }
          undoLabel="Undo change"
        />
      </Show>
      {/* Not a <section>: DataTable's own labelled region is the landmark. */}
      <div id="transactions" class="min-w-0 scroll-mt-4">
        <div class="pb-3">
          <h2 id="transactions-title" class="text-section">
            Transactions
          </h2>
        </div>
        <DataTable
          title="Transactions"
          caption={
            loading()
              ? 'Loading transactions…'
              : 'Latest activity · search from the filter bar above'
          }
          rows={sorted()}
          columns={transactionColumns}
          hideSearch
          cardBreakpoint="lg"
          selectable={false}
          pageSize={8}
          recordsLabel="transactions"
          loading={loading()}
          error={
            error()
              ? 'Transactions are unavailable while the report reloads.'
              : undefined
          }
          emptyTitle="No transactions found"
          emptyHint="Try another search or reset your filters."
          onClearFilters={clearFilters}
        />
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
    </AppPage>
  )
}
