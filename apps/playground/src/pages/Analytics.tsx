import { Badge, Button, Switch } from '@newui/atoms'
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
} from '@newui/charts'
import {
  count,
  createUndo,
  downloadText,
  usd as money,
  usdK,
} from '@newui/data'
import { Alert, Select } from '@newui/molecules'
import { DataTable, type DataTableColumn, FilterBar } from '@newui/organisms'
import { useNavigate } from '@solidjs/router'
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

export function Analytics(): JSX.Element {
  const navigate = useNavigate()
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
    state() === 'error'
      ? 'The report could not be loaded. Try again.'
      : undefined
  const unavailable = () => loading() || Boolean(error())
  // DataTable resets to page 1 whenever the filtered row set changes.
  const update = (setter: (value: string) => unknown, value: string) => {
    setter(value)
  }
  const exportCsv = () =>
    downloadText(
      'revenue-september-2026.csv',
      csv(sorted()),
      'text/csv;charset=utf-8',
    )
  const transactionColumns: DataTableColumn<Transaction>[] = [
    {
      accessorKey: 'customer',
      header: 'Customer',
      sortFn: 'text',
      sortDescFirst: false,
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
      cell: (context) => (
        <span class="text-ink-gray-7">{context.row.original.channel}</span>
      ),
    },
    {
      accessorKey: 'day',
      header: 'Date',
      sortFn: 'alphanumeric',
      sortDescFirst: false,
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
      meta: { align: 'end' },
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
      value: summary().revenue,
      target: revenueGoal(),
      format: money,
      loading: loading(),
      error: error() ?? null,
      sparkline: { data: trend().map((point) => point.Revenue) },
      delta: compare()
        ? percentageChange(summary().revenue, previous().revenue)
        : undefined,
      deltaSuffix: '%',
      deltaFormat,
      deltaCaption: compare()
        ? `from ${money(previous().revenue)} last month`
        : 'Paid transactions in this period',
    },
    {
      title: 'Transactions',
      value: summary().orders,
      loading: loading(),
      error: error() ?? null,
      delta: compare()
        ? percentageChange(summary().orders, previous().orders)
        : undefined,
      deltaSuffix: '%',
      deltaFormat,
      deltaCaption: compare()
        ? `from ${count(previous().orders)} last month`
        : 'Across all selected channels',
    },
    {
      title: 'Average order value',
      value: summary().average,
      format: money,
      loading: loading(),
      error: error() ?? null,
      delta: compare()
        ? percentageChange(summary().average, previous().average)
        : undefined,
      deltaSuffix: '%',
      deltaFormat,
      deltaCaption: compare()
        ? `from ${money(previous().average)} last month`
        : 'Per paid transaction',
    },
    {
      title: 'Payment success',
      value: summary().paidRate,
      suffix: '%',
      loading: loading(),
      error: error() ?? null,
      delta: compare() ? summary().paidRate - previous().paidRate : undefined,
      deltaSuffix: ' pts',
      deltaFormat,
      deltaCaption: compare()
        ? `from ${previous().paidRate.toFixed(1)}% last month`
        : 'Share of transactions paid',
    },
  ])

  return (
    <AppPage
      section="Analytics"
      title="Revenue overview"
      description="A clear view of how your business is growing."
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
                .getElementById('workspace-content')
                ?.scrollIntoView({ block: 'start' })
            if (label === 'Transactions')
              document
                .getElementById('transactions')
                ?.scrollIntoView({ block: 'start' })
            if (label === 'Back to examples') navigate('/pages')
            if (label === 'Component library') navigate('/atoms')
          }}
          items={[
            { label: 'Overview', icon: 'lucide-chart-no-axes-combined' },
            {
              label: 'Transactions',
              icon: 'lucide-receipt',
              count: rows().length,
            },
            { label: 'Back to examples', icon: 'lucide-layout-grid' },
            { label: 'Component library', icon: 'lucide-shapes' },
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
            value: days() === '30' ? '' : days(),
            options: [
              { label: 'Last 30 days', value: '30' },
              { label: 'Last 7 days', value: '7' },
            ],
            onValueChange: (value) => update(setDays, value || '30'),
          },
          {
            label: 'Region',
            value: region() === 'all' ? '' : region(),
            options: ['Europe', 'North America', 'Asia Pacific'].map(
              (value) => ({ value, label: value }),
            ),
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
        resultCount={rows().length}
        onClearAll={() => {
          update(setRegion, 'all')
          update(setDays, '30')
          update(setQuery, '')
        }}
      >
        <div class="flex max-w-full flex-wrap items-center gap-2">
          <span class="text-caption text-ink-gray-7">Preview state</span>
          <div class="w-32 max-w-full">
            <Select
              aria-label="Preview state"
              value={[state()]}
              options={['ready', 'loading', 'empty', 'error'].map((value) => ({
                value,
                label: value.charAt(0).toUpperCase() + value.slice(1),
              }))}
              onValueChange={(value) => update(setState, value[0] ?? 'ready')}
            />
          </div>
        </div>
      </FilterBar>
      <section
        aria-label="Key performance indicators"
        class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <For each={kpis()}>{(kpi) => <NumberCard {...kpi} />}</For>
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
              format: usdK,
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
      <section aria-label="Revenue insights" class="grid gap-4 lg:grid-cols-2">
        <NumberCard
          title="Period revenue goal"
          value={summary().revenue}
          target={revenueGoal()}
          format={money}
          loading={loading()}
          error={error() ?? null}
          deltaCaption={`${goalProgress().toFixed(1)}% of the period goal reached · ${Number(days())} days · ${region() === 'all' ? 'All regions' : region()}`}
        />
        <Show
          when={!unavailable() && summary().revenue > 0}
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
      {/* Not a <section>: DataTable's own labelled region is the landmark. */}
      <div id="transactions" class="min-w-0">
        <div class="pb-3">
          <h2 id="transactions-title" class="text-section">
            Transactions
          </h2>
          <p class="text-caption text-ink-gray-7">
            Your latest activity, all in one place. Search runs from the filter
            bar above.
          </p>
        </div>
        <Show
          when={!unavailable()}
          fallback={
            <div
              role="status"
              class="rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-8 text-center text-ink-gray-7"
            >
              {error() ?? 'Loading transactions…'}
              <Show when={error()}>
                <div class="mt-3">
                  <Button onClick={() => setState('ready')}>Try again</Button>
                </div>
              </Show>
            </div>
          }
        >
          <DataTable
            title="Transactions"
            rows={sorted()}
            columns={transactionColumns}
            hideSearch
            selectable={false}
            pageSize={8}
            recordsLabel="transactions"
            emptyTitle="No transactions found"
            emptyHint="Try another search or reset your filters."
            onClearFilters={() => {
              setQuery('')
              setRegion('all')
              setDays('30')
              setState('ready')
            }}
          />
        </Show>
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
