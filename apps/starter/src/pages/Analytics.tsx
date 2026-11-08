import { Badge, Button, Skeleton, Switch, TextInput } from '@talelk/newui-atoms'
import {
  type ConfigStore,
  type CrossFilter,
  count,
  createConfigStore,
  createDashboardState,
  createUndo,
  downloadBlob,
  exportCsv,
  type TimeRangePreset,
  usd,
} from '@talelk/newui-data'
import {
  createCollection,
  createServerTableState,
} from '@talelk/newui-data/query'
import { connectRealtime } from '@talelk/newui-data/resource'
import { Alert, Dialog, Tabs, ToggleGroup } from '@talelk/newui-molecules'
import {
  DataTable,
  type DataTableColumn,
  emptyWidgetGridConfig,
  FilterBar,
  normalizeWidgetGridConfig,
  type Stat,
  StatGrid,
  WidgetGrid,
  type WidgetGridConfig,
} from '@talelk/newui-organisms'
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  type JSX,
  lazy,
  onCleanup,
  Show,
  Suspense,
} from 'solid-js'
import {
  analyticsSocket,
  categorySeries,
  countTransactions,
  createCsvTable,
  createTransactionRepository,
  filterTransactions,
  previousWindow,
  REGIONS,
  restoreTransactions,
  revenueSeries,
  snapshotTransactions,
  statusSeries,
  summarize,
  type Transaction,
  type TransactionQuery,
  transactionsVersion,
} from '../data/analytics'
import { dataClient } from '../data/client'
import { emitStarterEvent } from '../devtools/events'
import { createUrlStateBridge } from '../lib/url-bridge'
import { Shell } from '../shell/Shell'

/**
 * Charts are lazy, the way the playground's Analytics page has them lazy:
 * echarts is the heaviest thing a dashboard ships, and the starter's budget
 * is for the app, not for the plot library. A widget that is not on screen
 * never pays for it.
 */
const AreaChart = lazy(() =>
  import('@talelk/newui-charts').then((module) => ({
    default: module.AreaChart,
  })),
)
const BarChart = lazy(() =>
  import('@talelk/newui-charts').then((module) => ({
    default: module.BarChart,
  })),
)
const DonutChart = lazy(() =>
  import('@talelk/newui-charts').then((module) => ({
    default: module.DonutChart,
  })),
)
const Sparkline = lazy(() =>
  import('@talelk/newui-charts').then((module) => ({
    default: module.Sparkline,
  })),
)

/**
 * The analytics recipe — the dashboard half of "build me a dashboard".
 *
 * Where `Records.tsx` is the CRUD recipe (client-mode collection, one typed
 * table, optimistic edits), this page is its analytics twin, and it composes
 * the same levels from the other direction:
 *
 * - `createDashboardState` owns one time range, one filter record and one
 *   cross-filter slot; `DashboardProvider` hands it to the widgets.
 * - `createUrlState` is the bridge underneath — the preset, the filters, the
 *   cross-filter and the table's server slices all round-trip through the
 *   URL, so a shared link reproduces the page exactly.
 * - The KPI row is `StatGrid` over aggregates, plus a `Sparkline` band for
 *   the shape the numbers have.
 * - `WidgetGrid` tiles the Area, Bar and Donut charts; its layout document
 *   persists through `createConfigStore`, which also holds saved views.
 * - The Transactions tab is a server-mode `DataTable` — the backend sorts,
 *   filters and pages — with `virtual` windowing the page and `keepPreviousData`
 *   so a page change never blanks the table.
 * - `connectRealtime` invalidates the cache from the demo socket, and an
 *   export goes out through `exportCsv` with `createUndo` behind the edits.
 *
 * The data story is `src/data/analytics.ts`: a seeded, deterministic demo
 * backend that answers the same queries a real one would.
 */

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const DAY_LABELS: Record<string, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  qtd: 'Quarter to date',
  ytd: 'Year to date',
  custom: 'Custom range',
}

const LAYOUT_DOCUMENT = 'layout'
const VIEW_PREFIX = 'view:'

/** What a saved view carries: everything a link cannot reproduce alone. */
interface AnalyticsView {
  preset: TimeRangePreset
  filters: { region: string; channel: string }
  cross: CrossFilter | null
  layout: WidgetGridConfig
}

function dayLabel(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return iso
  return `${MONTHS[month - 1]} ${day}, ${year}`
}

function axisMoney(value: number): string {
  if (Math.abs(value) < 1000) return usd(value)
  const compact = value / 1000
  return `$${compact.toFixed(1).replace(/\.0$/, '')}k`
}

/** Signed, tone-aware — the StatGrid delta, not a badge. */
function deltaFor(current: number, before: number): Stat['delta'] {
  if (before === 0) return undefined
  const change = ((current - before) / before) * 100
  const direction = change > 0.05 ? 'up' : change < -0.05 ? 'down' : 'flat'
  return {
    value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
    direction,
    good: change >= 0,
  }
}

export function Analytics(): JSX.Element {
  // One bridge for every surface that writes the query string.
  const adapter = createUrlStateBridge()

  const dashboard = createDashboardState({
    timeRange: { preset: '30d' },
    filters: { region: 'all', channel: 'all' },
    adapter,
  })

  const table = createServerTableState({
    initial: { pagination: { pageSize: 50 } },
    sync: { adapter, namespace: 'table' },
  })

  const views = createConfigStore({ key: 'starter.analytics' })
  const storedLayout = views.load<WidgetGridConfig>(LAYOUT_DOCUMENT)
  const [layout, setLayout] = createSignal<WidgetGridConfig>(
    storedLayout
      ? normalizeWidgetGridConfig(storedLayout.doc)
      : emptyWidgetGridConfig(),
  )
  const [customize, setCustomize] = createSignal(false)
  const [tab, setTab] = createSignal('overview')
  const [notice, setNotice] = createSignal<string | null>(null)
  const [viewsOpen, setViewsOpen] = createSignal(false)

  const recordUndo = createUndo<Transaction[]>()

  const version = transactionsVersion
  const windowFilters = () => {
    const filters = dashboard.filters()
    return {
      region: typeof filters['region'] === 'string' ? filters['region'] : 'all',
      channel:
        typeof filters['channel'] === 'string' ? filters['channel'] : 'all',
    }
  }

  /** The whole query: the dashboard's window, the table's slices. */
  const buildQuery = (): TransactionQuery => {
    const range = dashboard.timeRange()
    const pagination = table.pagination()
    return {
      from: range.from,
      to: range.to,
      ...windowFilters(),
      cross: dashboard.cross(),
      search: table.globalFilter(),
      sorting: table.sorting(),
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
    }
  }

  const transactionRepository = createTransactionRepository(buildQuery)

  const collection = createCollection<Transaction, Partial<Transaction>>(
    () => ({
      key: table.key(['transactions']),
      repository: transactionRepository,
      // A page change keeps the old page on screen while the next arrives.
      keepPreviousData: true,
      // The demo data moves on its own (the realtime tick); the interval is
      // the belt to the socket's braces.
      refetchInterval: 30_000,
      onError: (error) => {
        setNotice(error.message)
        emitStarterEvent('query:error', { message: error.message })
      },
    }),
  )

  // The socket's `list_update` events invalidate `['transactions']`, which is
  // where this collection's key starts.
  const connection = connectRealtime(
    dataClient,
    { realtime: analyticsSocket(), doctype: 'transactions' },
    {
      onEvent: (event) =>
        emitStarterEvent('analytics:realtime', {
          type: event.type,
          doctype: event.doctype,
        }),
    },
  )
  onCleanup(() => connection.close())

  const rows = createMemo(() => collection.query.rows())
  const total = createMemo(() => {
    version()
    const query = buildQuery()
    return countTransactions(query)
  })

  // KPI and chart aggregates read the aggregates the way a dashboard would:
  // the whole window, not the current page.
  const windowRows = createMemo(() => {
    version()
    const range = dashboard.timeRange()
    return filterTransactions({
      from: range.from,
      to: range.to,
      ...windowFilters(),
      cross: dashboard.cross(),
    })
  })
  const previousRows = createMemo(() => {
    version()
    const window = previousWindow(dashboard.timeRange())
    return filterTransactions({
      from: window.from,
      to: window.to,
      ...windowFilters(),
      cross: dashboard.cross(),
    })
  })
  const summary = createMemo(() => summarize(windowRows()))
  const previous = createMemo(() => summarize(previousRows()))
  const trend = createMemo(() => {
    version()
    const range = dashboard.timeRange()
    return revenueSeries(range.from, range.to, windowFilters())
  })
  const channels = createMemo(() => {
    version()
    const range = dashboard.timeRange()
    return categorySeries(range.from, range.to, 'channel', windowFilters())
  })
  const regions = createMemo(() => {
    version()
    const range = dashboard.timeRange()
    return categorySeries(range.from, range.to, 'region', windowFilters())
  })
  const statuses = createMemo(() => {
    version()
    const range = dashboard.timeRange()
    return statusSeries(range.from, range.to, windowFilters())
  })

  const preset = () => dashboard.timeRange().preset
  const cross = () => dashboard.cross()
  const hasFilters = () =>
    windowFilters().region !== 'all' ||
    windowFilters().channel !== 'all' ||
    cross() !== null ||
    preset() !== '30d' ||
    table.globalFilter().length > 0

  const setPreset = (next: TimeRangePreset) => {
    dashboard.setTimeRange(next)
    emitStarterEvent('analytics:range', { preset: next })
  }

  const setCross = (next: CrossFilter | null) => {
    dashboard.setCross(next)
    if (next)
      emitStarterEvent('analytics:cross', {
        column: next.column,
        value: String(next.value),
      })
  }

  const clearFilters = () => {
    dashboard.setFilters({ region: 'all', channel: 'all' })
    dashboard.setCross(null)
    dashboard.setTimeRange('30d')
    table.setGlobalFilter('')
  }

  const stats = (): Stat[] => {
    const current = summary()
    const before = previous()
    return [
      {
        label: 'Revenue',
        value: usd(current.revenue),
        hint: 'Paid revenue in this window',
        icon: 'lucide-wallet',
        delta: deltaFor(current.revenue, before.revenue),
      },
      {
        label: 'Transactions',
        value: count(current.orders),
        hint: 'Every status, every channel',
        icon: 'lucide-receipt',
        delta: deltaFor(current.orders, before.orders),
        onClick: () => setTab('transactions'),
      },
      {
        label: 'Average order',
        value: usd(current.average),
        hint: 'Per paid transaction',
        icon: 'lucide-percent',
        delta: deltaFor(current.average, before.average),
      },
      {
        label: 'Paid rate',
        value: `${current.paidRate.toFixed(1)}%`,
        hint: 'Share of transactions paid',
        icon: 'lucide-circle-check',
        delta: deltaFor(current.paidRate, before.paidRate),
      },
    ]
  }

  const sparklineData = createMemo(() => trend().map((point) => point.Revenue))

  const changeLayout = (next: WidgetGridConfig) => {
    setLayout(next)
    views.save(LAYOUT_DOCUMENT, next, { type: 'widget-grid' })
  }

  const currentView = (): AnalyticsView => ({
    preset: preset(),
    filters: windowFilters(),
    cross: cross(),
    layout: layout(),
  })

  const applyView = (name: string, view: AnalyticsView) => {
    dashboard.setTimeRange(view.preset)
    dashboard.setFilters(view.filters)
    dashboard.setCross(view.cross)
    setLayout(view.layout)
    emitStarterEvent('analytics:view', { name, action: 'apply' })
    setNotice(`View “${name}” applied.`)
  }

  const exportColumns = [
    { id: 'id', header: 'Ref' },
    { id: 'customer', header: 'Customer' },
    { id: 'status', header: 'Status' },
    { id: 'channel', header: 'Channel' },
    { id: 'region', header: 'Region' },
    { id: 'day', header: 'Date' },
    {
      id: 'amount',
      header: 'Amount',
      format: (value: unknown) => usd(Number(value)),
    },
  ]
  const csvTable = createCsvTable(
    exportColumns,
    () => rows(),
    () => {
      version()
      return filterTransactions(buildQuery())
    },
  )
  const exportName = () => {
    const range = dashboard.timeRange()
    const from = range.from.toISOString().slice(0, 10)
    const to = range.to.toISOString().slice(0, 10)
    return `acme-transactions-${from}-to-${to}.csv`
  }
  const exportReport = async () => {
    const blob = await exportCsv(csvTable, { scope: 'filtered' })
    downloadBlob(exportName(), blob)
    emitStarterEvent('analytics:export', { rows: total() })
    setNotice(`Exported ${count(total())} transactions.`)
  }

  const markPaid = (ids: string[]) => {
    recordUndo.capture(snapshotTransactions())
    collection.updateMany.mutate({ ids, patch: { status: 'Paid' } })
    setNotice(`${count(ids.length)} transactions marked paid.`)
  }

  const undoLast = () => {
    if (!recordUndo.undo((snapshot) => restoreTransactions(snapshot))) return
    void collection.query.refetch()
    setNotice('The change was undone.')
  }

  const transactionColumns: DataTableColumn<Transaction>[] = [
    { accessorKey: 'id', header: 'Ref', sortFn: 'alphanumeric' },
    {
      accessorKey: 'customer',
      header: 'Customer',
      sortFn: 'text',
      meta: { mobile: 'title' },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      sortFn: 'text',
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
          label={context.row.original.status}
        />
      ),
    },
    {
      accessorKey: 'channel',
      header: 'Channel',
      sortFn: 'text',
      meta: { mobile: 'meta' },
    },
    { accessorKey: 'region', header: 'Region', sortFn: 'text' },
    {
      accessorKey: 'day',
      header: 'Date',
      sortFn: 'alphanumeric',
      meta: { mobile: 'subtitle' },
      cell: (context) => (
        <span class="text-ink-gray-7">
          {dayLabel(context.row.original.day)}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      sortFn: 'alphanumeric',
      meta: { align: 'end', mobile: 'amount' },
      cell: (context) => (
        <span class="tabular-nums">{usd(context.row.original.amount)}</span>
      ),
    },
  ]

  return (
    <Shell
      title="Analytics"
      description="One time range, one filter record, one cross-filter — every widget reads the same state."
      sections={[{ label: 'Workspace', href: '/' }, { label: 'Analytics' }]}
      actions={
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            iconLeft="lucide-bookmark"
            onClick={() => setViewsOpen(true)}
          >
            Saved views
          </Button>
          <Button
            variant="solid"
            theme="blue"
            iconLeft="lucide-download"
            disabled={total() === 0}
            onClick={() => void exportReport()}
          >
            Export CSV
          </Button>
        </div>
      }
    >
      <div class="flex flex-col gap-4">
        <Show when={notice()}>
          {(message) => (
            <Show
              when={recordUndo.snapshot()}
              fallback={
                <Alert
                  theme="green"
                  title={message()}
                  dismissible
                  onDismiss={() => setNotice(null)}
                />
              }
            >
              <Alert
                theme="blue"
                title={message()}
                dismissible
                onDismiss={() => {
                  recordUndo.clear()
                  setNotice(null)
                }}
                primaryAction={{ label: 'Undo', onClick: undoLast }}
              />
            </Show>
          )}
        </Show>

        <Show when={collection.query.isError()}>
          <Alert
            theme="red"
            title="The transactions could not be loaded."
            description={collection.query.error()?.message}
            primaryAction={{
              label: 'Try again',
              onClick: () => void collection.query.refetch(),
            }}
          />
        </Show>

        <FilterBar
          selects={[
            {
              label: 'Region',
              value: windowFilters().region,
              options: [
                { label: 'All regions', value: 'all' },
                ...REGIONS.map((region) => ({ value: region, label: region })),
              ],
              onValueChange: (value) =>
                dashboard.setFilter('region', value ?? 'all'),
            },
            {
              label: 'Channel',
              value: windowFilters().channel,
              options: [
                { label: 'All channels', value: 'all' },
                ...[
                  'Direct',
                  'Organic',
                  'Paid search',
                  'Referral',
                  'Social',
                ].map((channel) => ({ value: channel, label: channel })),
              ],
              onValueChange: (value) =>
                dashboard.setFilter('channel', value ?? 'all'),
            },
          ]}
          chips={[
            ...(windowFilters().region !== 'all'
              ? [
                  {
                    label: `Region: ${windowFilters().region}`,
                    onRemove: () => dashboard.setFilter('region', 'all'),
                  },
                ]
              : []),
            ...(windowFilters().channel !== 'all'
              ? [
                  {
                    label: `Channel: ${windowFilters().channel}`,
                    onRemove: () => dashboard.setFilter('channel', 'all'),
                  },
                ]
              : []),
            ...(cross()
              ? [
                  {
                    label: `Cross-filter: ${cross()?.column} = ${String(cross()?.value)}`,
                    onRemove: () => dashboard.setCross(null),
                  },
                ]
              : []),
          ]}
          resultCount={total()}
          onClearAll={hasFilters() ? clearFilters : undefined}
        >
          <div class="flex items-center gap-3">
            <ToggleGroup.Root
              aria-label="Time range"
              value={[preset()]}
              onValueChange={(values) => {
                const next = values[0]
                if (next) setPreset(next as TimeRangePreset)
              }}
            >
              <ToggleGroup.Item value="7d">7d</ToggleGroup.Item>
              <ToggleGroup.Item value="30d">30d</ToggleGroup.Item>
              <ToggleGroup.Item value="qtd">QTD</ToggleGroup.Item>
              <ToggleGroup.Item value="ytd">YTD</ToggleGroup.Item>
            </ToggleGroup.Root>
            <span class="hidden text-caption text-ink-gray-7 sm:inline">
              {DAY_LABELS[preset()] ?? 'Custom range'}
            </span>
          </div>
        </FilterBar>

        <section aria-label="Key performance indicators">
          <StatGrid stats={stats()} columns={4} />
        </section>

        <section
          aria-label="Revenue shape"
          class="flex flex-col gap-1 rounded-card border border-outline-gray-1 bg-surface-elevation-1 px-4 py-3"
        >
          <p class="text-caption text-ink-gray-7">
            Paid revenue, {trend().length} readings — the shape behind the first
            stat
          </p>
          <Suspense fallback={<Skeleton lines={2} />}>
            <Sparkline data={sparklineData()} height="3rem" />
          </Suspense>
        </section>
        <Tabs.Root value={tab()} onValueChange={setTab}>
          <Tabs.List>
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="transactions">
              Transactions
              <span class="ms-1 text-caption text-ink-gray-7">
                {count(total())}
              </span>
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="overview">
            <div class="flex flex-col gap-3 pt-3">
              <div class="flex items-center justify-end gap-2">
                <Switch
                  checked={customize()}
                  onCheckedChange={setCustomize}
                  label="Customize layout"
                />
              </div>
              <WidgetGrid
                label="Analytics widgets"
                editable={customize()}
                resettable
                config={layout()}
                onConfigChange={changeLayout}
              >
                <WidgetGrid.Widget
                  id="revenue-trend"
                  span={8}
                  rows={4}
                  minSpan={6}
                  title="Revenue trend"
                >
                  <Suspense fallback={<Skeleton lines={5} />}>
                    <AreaChart
                      data={trend()}
                      x="date"
                      y="Revenue"
                      height={216}
                      smooth
                      yAxis={{ min: 0, format: axisMoney }}
                      class="px-2 pb-2"
                    />
                  </Suspense>
                </WidgetGrid.Widget>
                <WidgetGrid.Widget
                  id="channels"
                  span={4}
                  rows={4}
                  minSpan={3}
                  title="Revenue by channel"
                >
                  <Suspense fallback={<Skeleton lines={5} />}>
                    <BarChart
                      data={channels()}
                      x="channel"
                      y="Revenue"
                      horizontal
                      height={216}
                      yAxis={{ min: 0, format: axisMoney }}
                      onPointDblClick={(datum) =>
                        setCross({ column: 'channel', value: String(datum.x) })
                      }
                      class="px-2 pb-2"
                    />
                  </Suspense>
                </WidgetGrid.Widget>
                <WidgetGrid.Widget
                  id="payment-mix"
                  span={4}
                  rows={4}
                  minSpan={3}
                  title="Payment mix"
                >
                  <Suspense fallback={<Skeleton lines={5} />}>
                    <DonutChart
                      data={statuses()}
                      category="status"
                      value="Transactions"
                      centerLabel="Transactions"
                      height={216}
                      class="px-2 pb-2"
                    />
                  </Suspense>
                </WidgetGrid.Widget>
                <WidgetGrid.Widget
                  id="regions"
                  span={4}
                  rows={4}
                  minSpan={3}
                  title="Revenue by region"
                >
                  <Suspense fallback={<Skeleton lines={5} />}>
                    <BarChart
                      data={regions()}
                      x="region"
                      y="Revenue"
                      horizontal
                      height={216}
                      yAxis={{ min: 0, format: axisMoney }}
                      onPointDblClick={(datum) =>
                        setCross({ column: 'region', value: String(datum.x) })
                      }
                      class="px-2 pb-2"
                    />
                  </Suspense>
                </WidgetGrid.Widget>
                <WidgetGrid.Widget
                  id="insight"
                  span={12}
                  rows={2}
                  minSpan={4}
                  title="What leads"
                >
                  <Show
                    when={channels()[0]}
                    fallback={
                      <p class="text-sm text-ink-gray-7">
                        No paid revenue in this window.
                      </p>
                    }
                  >
                    {(lead) => (
                      <p class="text-sm text-ink-gray-8">
                        <span class="font-medium text-ink-gray-9">
                          {String(lead().channel)}
                        </span>{' '}
                        leads with {usd(lead().Revenue)} paid —{' '}
                        {(
                          (lead().Revenue / Math.max(1, summary().revenue)) *
                          100
                        ).toFixed(1)}
                        % of the window. Double-click its bar to cross-filter
                        the table.
                      </p>
                    )}
                  </Show>
                </WidgetGrid.Widget>
              </WidgetGrid>
            </div>
          </Tabs.Content>

          <Tabs.Content value="transactions">
            <div class="pt-3">
              <DataTable
                title="Transactions"
                caption="Server-mode demo: the backend sorts, filters and pages."
                rows={rows()}
                columns={transactionColumns}
                server={{ total: total() }}
                virtual
                sorting={table.sorting()}
                onSortingChange={table.setSorting}
                pagination={table.pagination()}
                onPaginationChange={table.setPagination}
                globalFilter={table.globalFilter()}
                onGlobalFilterChange={table.setGlobalFilter}
                loading={collection.query.isPending()}
                error={
                  collection.query.isError()
                    ? 'The transactions could not be loaded.'
                    : undefined
                }
                onRetry={() => void collection.query.refetch()}
                actionLabel="Mark selected paid"
                onRowsAction={markPaid}
                recordsLabel="transactions"
                emptyTitle="No transactions"
                emptyHint="Widen the time range or clear the filters."
                onClearFilters={hasFilters() ? clearFilters : undefined}
              />
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>

      <SavedViewsDialog
        open={viewsOpen()}
        onOpenChange={setViewsOpen}
        store={views}
        current={currentView()}
        onApply={applyView}
      />
    </Shell>
  )
}

/**
 * Saved views: one `createConfigStore`, the same document pattern as the
 * widget layout. A view is the whole page — window, filters, cross-filter,
 * layout — and applying it writes all four back.
 */
function SavedViewsDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  store: ConfigStore
  current: AnalyticsView
  onApply: (name: string, view: AnalyticsView) => void
}): JSX.Element {
  const [refresh, setRefresh] = createSignal(0)
  const [name, setName] = createSignal('')
  const [error, setError] = createSignal<string | null>(null)

  const saved = createMemo(() => {
    refresh()
    return props.store
      .list()
      .filter((summary) => summary.name.startsWith(VIEW_PREFIX))
      .map((summary) => ({
        name: summary.name.slice(VIEW_PREFIX.length),
        updatedAt: summary.updatedAt,
      }))
  })

  const save = () => {
    const trimmed = name().trim()
    if (trimmed.length < 2) {
      setError('Name the view.')
      return
    }
    props.store.save(`${VIEW_PREFIX}${trimmed}`, props.current, {
      type: 'saved-view',
    })
    emitStarterEvent('analytics:view', {
      name: trimmed,
      action: 'save',
    })
    setName('')
    setError(null)
    setRefresh((value) => value + 1)
  }

  const remove = (viewName: string) => {
    props.store.remove(`${VIEW_PREFIX}${viewName}`)
    emitStarterEvent('analytics:view', { name: viewName, action: 'remove' })
    setRefresh((value) => value + 1)
  }

  // A dialog that reopens with the last attempt in it invites a duplicate.
  createEffect(() => {
    if (props.open) {
      setName('')
      setError(null)
    }
  })

  return (
    <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Saved views</Dialog.Title>
          <Dialog.Description>
            Views are documents in the config store — the same seam that keeps
            your widget layout.
          </Dialog.Description>
        </Dialog.Header>
        <div class="mt-5 flex flex-col gap-4">
          <div class="flex flex-wrap items-end gap-2">
            <div class="min-w-48 flex-1">
              <TextInput
                label="Save the current view"
                value={name()}
                error={error() ?? undefined}
                placeholder="Q4, Europe only"
                onInput={(event) => setName(event.currentTarget.value)}
              />
            </div>
            <Button
              variant="solid"
              theme="blue"
              iconLeft="lucide-bookmark-plus"
              onClick={save}
            >
              Save
            </Button>
          </div>
          <Show
            when={saved().length > 0}
            fallback={
              <p class="text-sm text-ink-gray-7">
                No saved views yet. The layout you arrange here is kept even
                without one.
              </p>
            }
          >
            <ul class="flex flex-col divide-y divide-outline-gray-1 rounded-control border border-outline-gray-1">
              <For each={saved()}>
                {(view) => (
                  <li class="flex items-center gap-2 p-2">
                    <button
                      type="button"
                      class="flex-1 rounded-control text-start text-sm-medium text-ink-blue-7 hover:underline focus-visible:focus-ring"
                      onClick={() => {
                        const loaded = props.store.load<AnalyticsView>(
                          `${VIEW_PREFIX}${view.name}`,
                        )
                        if (loaded) props.onApply(view.name, loaded.doc)
                        props.onOpenChange(false)
                      }}
                    >
                      {view.name}
                    </button>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon="lucide-trash-2"
                      aria-label={`Delete ${view.name}`}
                      onClick={() => remove(view.name)}
                    />
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </div>
        <Dialog.Footer>
          <Button onClick={() => props.onOpenChange(false)}>Close</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  )
}
