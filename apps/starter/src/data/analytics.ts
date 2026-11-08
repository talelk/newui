import type { CrossFilter, CsvExportTable, TimeRange } from '@talelk/newui-data'
import type { Repository } from '@talelk/newui-data/query'
import type { Realtime, RealtimeSocket } from '@talelk/newui-data/resource'
import { createRealtime } from '@talelk/newui-data/resource'
import { createSignal } from 'solid-js'

/**
 * The analytics data seam — the same shape as `records.ts`, seen from the
 * other side.
 *
 * `records.ts` is a client-mode collection: the whole list in memory, the
 * browser filtering it. This module is its server-mode twin: a few thousand
 * seeded transactions behind a query that sorts, filters and paginates the
 * way a backend would, plus the aggregates the KPI row and the charts read.
 * Nothing here is auth-shaped; every row is public demo data.
 *
 * The seed is deterministic: the same numbers on every load, in every theme,
 * so the page's charts, exports and tests all read the same story. The demo
 * "server" is local, so its mutations and the realtime tick are rotations of
 * the seed, never randomness.
 */

/** One transaction row — the table's row type and the export's unit. */
export interface Transaction {
  id: string
  customer: string
  channel: string
  region: string
  status: 'Paid' | 'Pending' | 'Refunded'
  /** ISO day, `YYYY-MM-DD`. */
  day: string
  /** Whole dollars. */
  amount: number
}

export const CHANNELS = [
  'Direct',
  'Organic',
  'Paid search',
  'Referral',
  'Social',
] as const

export const REGIONS = ['Europe', 'North America', 'Asia Pacific'] as const

export const STATUSES = ['Paid', 'Pending', 'Refunded'] as const

/** Days of history the seed covers — longer than the longest preset. */
export const HISTORY_DAYS = 180

const DAY_MS = 86_400_000

/** Mulberry32: a tiny deterministic PRNG, so the seed is one number. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST_NAMES = [
  'Rhea',
  'Daniel',
  'Mariam',
  'Jonas',
  'Sofia',
  'Kenji',
  'Amara',
  'Liam',
  'Noor',
  'Elena',
  'Mateo',
  'Yuki',
]

const LAST_NAMES = [
  'Kapoor',
  'Okafor',
  'Haddad',
  'Weber',
  'Rossi',
  'Watanabe',
  'Diallo',
  'Novak',
  'Chen',
  'Alvarez',
  'Kowalski',
  'Fischer',
]

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** The seed's last day: today, local. The window presets read `now()` too. */
function seedEnd(): Date {
  return startOfDay(new Date())
}

function isoDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/**
 * The deterministic seed: `HISTORY_DAYS` days ending today, 6–16 transactions
 * per day, keyed by day index so the same day always holds the same rows.
 */
function seedTransactions(): Transaction[] {
  const end = seedEnd()
  const rows: Transaction[] = []
  let index = 0
  for (let back = HISTORY_DAYS - 1; back >= 0; back -= 1) {
    const day = new Date(end.getTime() - back * DAY_MS)
    const rand = mulberry32(0x5eed + (HISTORY_DAYS - back))
    const count = 6 + Math.floor(rand() * 11)
    // A gentle weekly rhythm and a slow upward drift keep the series readable.
    const weekday = day.getDay()
    const weekendFactor = weekday === 0 || weekday === 6 ? 0.55 : 1
    const drift = 1 + (HISTORY_DAYS - back) / HISTORY_DAYS
    for (let n = 0; n < count; n += 1) {
      index += 1
      const channelPick = rand()
      const channel =
        channelPick < 0.3
          ? 'Organic'
          : channelPick < 0.5
            ? 'Direct'
            : channelPick < 0.7
              ? 'Paid search'
              : channelPick < 0.85
                ? 'Referral'
                : 'Social'
      const region = REGIONS[Math.floor(rand() * REGIONS.length)] ?? 'Europe'
      const statusPick = rand()
      const status: Transaction['status'] =
        statusPick < 0.7 ? 'Paid' : statusPick < 0.9 ? 'Pending' : 'Refunded'
      const amount = Math.round((120 + rand() * 3_800) * weekendFactor * drift)
      rows.push({
        id: `TX-${String(index).padStart(5, '0')}`,
        customer: `${FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]} ${
          LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]
        }`,
        channel,
        region,
        status,
        day: isoDay(day),
        amount,
      })
    }
  }
  return rows
}

let store: Transaction[] = seedTransactions()
let nextId = store.length + 1

/**
 * A bump signal every mutation writes. The demo backend is synchronous, so
 * memos that read the store also read this to learn that it moved — the
 * realtime tick and undo both land rows this way.
 */
const [dataVersion, setDataVersion] = createSignal(0)
export const transactionsVersion = dataVersion

function mutate(transform: (rows: Transaction[]) => Transaction[]): void {
  store = transform(store)
  setDataVersion((version) => version + 1)
}

/** A copy for undo: the whole store, not the page. */
export function snapshotTransactions(): Transaction[] {
  return store.map((row) => ({ ...row }))
}

/** Undo's restore half — the snapshot goes back whole. */
export function restoreTransactions(rows: Transaction[]): void {
  mutate(() => rows.map((row) => ({ ...row })))
}

/**
 * The demo backend's rotation: tick `n` flips one transaction between Paid
 * and Pending. Deterministic, so a failing assertion is reproducible.
 */
export function advanceDemoData(tick: number): string {
  const row = store[tick % store.length]
  if (!row) return ''
  const status: Transaction['status'] =
    row.status === 'Paid' ? 'Pending' : 'Paid'
  mutate((rows) =>
    rows.map((candidate) =>
      candidate.id === row.id ? { ...candidate, status } : candidate,
    ),
  )
  return row.id
}

/** Everything the server-mode table asks the backend for. */
export interface TransactionQuery {
  from: Date
  to: Date
  region?: string
  channel?: string
  /** The dashboard's cross-filter, when one is set. */
  cross?: CrossFilter | null
  search?: string
  sorting?: { id: string; desc: boolean }[]
  pageIndex: number
  pageSize: number
}

function inWindow(row: Transaction, from: Date, to: Date): boolean {
  const day = Date.parse(`${row.day}T00:00:00`)
  return day >= from.getTime() - DAY_MS && day <= to.getTime()
}

function crossMatches(row: Transaction, cross: CrossFilter): boolean {
  if (cross.column === 'channel') return row.channel === String(cross.value)
  if (cross.column === 'region') return row.region === String(cross.value)
  if (cross.column === 'status') return row.status === String(cross.value)
  return true
}

/** The filtered, sorted set — the same rows the export writes. */
export function filterTransactions(
  query: Pick<
    TransactionQuery,
    'from' | 'to' | 'region' | 'channel' | 'cross' | 'search' | 'sorting'
  >,
): Transaction[] {
  const search = (query.search ?? '').trim().toLowerCase()
  const rows = store.filter((row) => {
    if (!inWindow(row, query.from, query.to)) return false
    if (query.region && query.region !== 'all' && row.region !== query.region)
      return false
    if (
      query.channel &&
      query.channel !== 'all' &&
      row.channel !== query.channel
    )
      return false
    if (query.cross && !crossMatches(row, query.cross)) return false
    if (search) {
      const haystack =
        `${row.id} ${row.customer} ${row.channel} ${row.region} ${row.status}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })
  const sort = query.sorting?.[0]
  if (sort) {
    const direction = sort.desc ? -1 : 1
    rows.sort((a, b) => {
      const left = a[sort.id as keyof Transaction]
      const right = b[sort.id as keyof Transaction]
      if (typeof left === 'number' && typeof right === 'number')
        return (left - right) * direction
      return String(left).localeCompare(String(right)) * direction
    })
  }
  return rows
}

/** The page the backend hands back, and the count behind it. */
export function queryTransactions(query: TransactionQuery): {
  rows: Transaction[]
  total: number
} {
  const filtered = filterTransactions(query)
  const start = query.pageIndex * query.pageSize
  return {
    rows: filtered.slice(start, start + query.pageSize),
    total: filtered.length,
  }
}

/** The count without the page — the `server.total` the table trusts. */
export function countTransactions(
  query: Omit<TransactionQuery, 'pageIndex' | 'pageSize' | 'sorting'>,
): number {
  return filterTransactions(query).length
}

/**
 * The repository the collection reads. `list` runs the query the page is in
 * right now — the same shape a paged HTTP endpoint would have.
 */
// `Partial<Transaction>` is the honest `New` here: the demo backend fills the
// fields a caller leaves out, the same way a server default would.
export function createTransactionRepository(
  query: () => TransactionQuery,
  options: { latency?: number } = {},
): Repository<Transaction, Partial<Transaction>> {
  const latency = options.latency ?? 120
  const wait = (signal?: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, latency)
      signal?.addEventListener(
        'abort',
        () => {
          clearTimeout(timer)
          reject(new DOMException('The request was cancelled.', 'AbortError'))
        },
        { once: true },
      )
    })

  return {
    async list({ signal } = {}) {
      await wait(signal)
      return queryTransactions(query()).rows
    },
    async create(input, { signal } = {}) {
      await wait(signal)
      const row: Transaction = {
        day: input.day ?? isoDay(new Date()),
        status: input.status ?? 'Paid',
        channel: input.channel ?? CHANNELS[0] ?? 'Direct',
        region: input.region ?? REGIONS[0] ?? 'Europe',
        amount: input.amount ?? 0,
        customer: input.customer ?? 'New customer',
        id: `TX-${String(nextId++).padStart(5, '0')}`,
      }
      mutate((rows) => [row, ...rows])
      return { ...row }
    },
    async update(id, patch, { signal } = {}) {
      await wait(signal)
      const current = store.find((row) => row.id === id)
      if (!current) throw new Error(`No transaction with the id ${id}.`)
      const row: Transaction = { ...current, ...patch, id: current.id }
      mutate((rows) =>
        rows.map((candidate) => (candidate.id === id ? row : candidate)),
      )
      return { ...row }
    },
    async remove(ids, { signal } = {}) {
      await wait(signal)
      const gone = new Set(ids)
      mutate((rows) => rows.filter((row) => !gone.has(row.id)))
    },
  }
}

// ---------------------------------------------------------------------------
// Aggregates — the KPI row and the charts read these, not the page.
// ---------------------------------------------------------------------------

export interface Summary {
  revenue: number
  orders: number
  average: number
  paidRate: number
}

export function summarize(rows: Transaction[]): Summary {
  const paid = rows.filter((row) => row.status === 'Paid')
  const revenue = paid.reduce((sum, row) => sum + row.amount, 0)
  const orders = rows.length
  return {
    revenue,
    orders,
    average: orders === 0 ? 0 : Math.round(revenue / Math.max(1, paid.length)),
    paidRate: orders === 0 ? 0 : (paid.length / orders) * 100,
  }
}

/** The window shifted back by its own length — the comparison period. */
export function previousWindow(range: TimeRange): { from: Date; to: Date } {
  const length = range.to.getTime() - range.from.getTime() + DAY_MS
  return {
    from: new Date(range.from.getTime() - length),
    to: new Date(range.from.getTime() - DAY_MS),
  }
}

/**
 * The revenue series the Area chart draws. Past two months the days collapse
 * into weekly buckets so the line stays a trend, not a smear.
 */
export function revenueSeries(
  from: Date,
  to: Date,
  filters: { region?: string; channel?: string },
): { date: string; Revenue: number }[] {
  const rows = filterTransactions({ from, to, ...filters })
  const days = Math.round((to.getTime() - from.getTime()) / DAY_MS) + 1
  const bucket = days > 60 ? 7 : 1
  const byDate = new Map<string, number>()
  const start = startOfDay(from)
  for (let day = start.getTime(); day <= to.getTime(); day += bucket * DAY_MS) {
    byDate.set(isoDay(new Date(day)), 0)
  }
  for (const row of rows) {
    if (row.status !== 'Paid') continue
    const dayIndex = Math.floor(
      (Date.parse(`${row.day}T00:00:00`) - start.getTime()) / DAY_MS,
    )
    const bucketStart = Math.floor(dayIndex / bucket) * bucket
    const key = isoDay(new Date(start.getTime() + bucketStart * DAY_MS))
    byDate.set(key, (byDate.get(key) ?? 0) + row.amount)
  }
  return [...byDate].map(([date, Revenue]) => ({ date, Revenue }))
}

/** Category totals for the bar charts, largest first. */
export function categorySeries(
  from: Date,
  to: Date,
  key: 'channel' | 'region',
  filters: { region?: string; channel?: string } = {},
): { channel?: string; region?: string; Revenue: number }[] {
  const totals = new Map<string, number>()
  for (const row of filterTransactions({ from, to, ...filters })) {
    if (row.status !== 'Paid') continue
    const name = row[key]
    totals.set(name, (totals.get(name) ?? 0) + row.amount)
  }
  return [...totals]
    .map(([name, Revenue]) => ({ [key]: name, Revenue }))
    .sort((a, b) => b.Revenue - a.Revenue)
}

/** Slice counts for the donut, in the seeded status order. */
export function statusSeries(
  from: Date,
  to: Date,
  filters: { region?: string; channel?: string } = {},
): { status: string; Transactions: number }[] {
  const counts = new Map<string, number>(STATUSES.map((status) => [status, 0]))
  for (const row of filterTransactions({ from, to, ...filters })) {
    counts.set(row.status, (counts.get(row.status) ?? 0) + 1)
  }
  return STATUSES.map((status) => ({
    status,
    Transactions: counts.get(status) ?? 0,
  }))
}

// ---------------------------------------------------------------------------
// The CSV bridge — `exportCsv` reads a table's shape, not an app's.
// ---------------------------------------------------------------------------

/**
 * A structural table over the demo backend, so `exportCsv` can export what the
 * user sees. `getCoreRowModel` is the raw data (the `'all'` scope), and
 * `getFilteredRowModel` is the current query across pages (the `'filtered'`
 * scope) — the same distinction a server-backed table would draw.
 */
export function createCsvTable(
  columns: readonly {
    id: string
    header: string
    format?: (value: unknown) => string | number
  }[],
  pageRows: () => Transaction[],
  filteredRows: () => Transaction[],
): CsvExportTable {
  const leaf = columns.map((column) => ({
    id: column.id,
    columnDef: {
      meta: {
        exportName: column.header,
        ...(column.format ? { format: column.format } : {}),
      },
    },
  }))
  const model = (rows: Transaction[]) => ({
    rows: rows.map((row) => ({
      getValue: (columnId: string) => row[columnId as keyof Transaction],
    })),
  })
  return {
    getAllLeafColumns: () => leaf,
    getVisibleLeafColumns: () => leaf,
    getCoreRowModel: () => model(store),
    getFilteredRowModel: () => model(filteredRows()),
    getState: () => ({
      pagination: { pageIndex: 0, pageSize: pageRows().length },
    }),
  }
}

// ---------------------------------------------------------------------------
// Realtime — the socket the cache invalidates on.
// ---------------------------------------------------------------------------

/** Every `list_update` tick, in ms. Long enough not to distract. */
const REALTIME_TICK_MS = 20_000

/**
 * The demo transport. It satisfies the socket factory's contract without a
 * wire: a tick flips one seeded row and announces `list_update` for the
 * `transactions` doctype, exactly as a server would.
 */
function demoSocket(): RealtimeSocket {
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>()
  let timer: ReturnType<typeof setInterval> | undefined
  let tick = 0
  let closed = false

  const fire = (event: string, payload: unknown): void => {
    for (const listener of listeners.get(event) ?? []) listener(payload)
  }

  return {
    on(event, listener) {
      if (closed) return
      const set = listeners.get(event) ?? new Set()
      listeners.set(event, set)
      set.add(listener)
      if (event === 'open') {
        queueMicrotask(() => {
          if (!closed) listener(undefined)
        })
      }
      if (event === 'list_update' && timer === undefined) {
        timer = setInterval(() => {
          advanceDemoData(tick)
          tick += 1
          fire('list_update', { type: 'list', doctype: 'transactions' })
        }, REALTIME_TICK_MS)
      }
    },
    off(event, listener) {
      listeners.get(event)?.delete(listener)
    },
    close() {
      closed = true
      if (timer !== undefined) clearInterval(timer)
    },
    send() {
      // The demo transport has no wire to write to.
    },
    get connected() {
      return !closed
    },
  }
}

let socket: Realtime | undefined

/**
 * The app's realtime socket: a real `createRealtime` over the demo factory.
 * `connectRealtime` invalidates `['transactions']` from its events, which is
 * what the collection's key starts with.
 */
export function analyticsSocket(): Realtime {
  socket ??= createRealtime({
    url: 'wss://realtime.demo.newui.invalid/',
    factory: demoSocket,
  })
  return socket
}
