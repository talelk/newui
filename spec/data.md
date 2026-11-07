# @talelk/newui-data

The logic layer: the things every application does the same way, and no two
applications agree on when they each write them from scratch.

```ts
import { createUndo, downloadCsv, optionsOf, usd } from '@talelk/newui-data'
```

## The boundary

`@talelk/newui-data` is **headless**. It imports `solid-js` for signals and nothing from
`@talelk/newui-atoms`, `@talelk/newui-molecules`, `@talelk/newui-organisms` or `@talelk/newui-templates`,
which is enforced by dependency-cruiser (`data-is-headless`). The rule in the other direction is just
as strict: no component package may import it (`nothing-below-imports-data`). A
component that needs to format a number takes that from the app — the kit does
not acquire an opinion about money.

What renders stays in the atomic visual packages. `Notice` is the instructive case: the examples
copied it eleven times, and the plan named it here, but it renders a banner with
buttons — so it is a *component*, and promoting it into a headless package would
have made the layer lie about itself. It stays a UI component (or an app
composition) until it earns its own surface.

## Surfaces

| export | signature | what it owns |
| --- | --- | --- |
| `usd` | `(value: number) => string` | whole-dollar USD: `usd(128430)` → `$128,430` |
| `usdK` | `(value: number) => string` | compact axis form: `usdK(42500)` → `$43k` |
| `count` | `(value: number) => string` | grouped integer: `count(128430)` → `128,430` |
| `bytes` | `(value: number) => string` | `bytes(2048)` → `2.0 KB` |
| `isEmail` | `(value: string) => boolean` | the one address check the forms share |
| `optionsOf` | `(values: readonly string[]) => SelectOption[]` | `['Size']` → `[{ label: 'Size', value: 'Size' }]` |
| `first` | `(value: string[], fallback: string) => string` | the single-select unwrap, with a fallback |
| `createUndo` | `<T>() => Undo<T>` | snapshot, capture, undo-once, clear |
| `aggregate` | `(rows, { by, metrics }) => rows` | group-by with the eleven shared metric names |
| `timeBucket` | `(date, unit) => Date` | floor a date to its hour/day/week/month/quarter/year |
| `rollup` | `(rows, { field, unit, metric? }) => points` | time-column → chart series |
| `createUrlState` | `(initial, { adapter? }) => signals` | link-reproducible state in `URLSearchParams` |
| `createConfigStore` | `({ key, storage?, migrate? }) => store` | versioned documents for saved views and dashboard config |
| `createDashboardState` | `({ timeRange?, filters?, adapter?, sync? }) => state` | the shared time range, filters and cross-filter of one dashboard |
| `DashboardProvider` / `useDashboardState` | provider + hook | the same state, read three levels down without prop-drilling |
| `createTablePersist` | `({ id, url?, storage?, onPersistError? }) => persist` | what a table remembers — URL half and document half |
| `exportCsv` | `(table, { scope?, columns? }) => Promise<Blob>` | the table's view as CSV, built on `csvText` |
| `downloadBlob` | `(name: string, blob: Blob) => void` | the Blob / anchor / revoke dance |
| `downloadText` | `(name, text, mime?) => void` | text, `text/plain` unless told otherwise |
| `csvText` | `(rows: (string \| number)[][]) => string` | every cell quoted, inner quotes doubled, CRLF |
| `downloadCsv` | `(name: string, rows) => void` | `csvText` plus the download |

## Behavior

- **Formatters are built once.** `Intl.NumberFormat` is constructed at module
  scope; constructing one per cell is the cost that never shows in a profile and
  always shows in a long list.
- **`createUndo` is one step, on purpose.** `capture` replaces the snapshot —
  there is no stack, because a second undo is a history feature and a history
  feature needs labels to be useful. `snapshot()` being `undefined` is what
  "nothing to undo" means, so `T` must not itself include `undefined`.
- **CSV is quoted unconditionally.** Every cell is wrapped and inner quotes are
  doubled, which is the part that is easy to get subtly wrong; `42` becomes
  `"42"` and a spreadsheet reads it as a number anyway.
- **`downloadBlob` revokes after the click.** The URL is released in the same
  turn as the synthetic click, which is what every browser this kit targets
  accepts; a deferred revoke would leak a URL per download.

## Query — `@talelk/newui-data/query`

The query surface is a separate entry point, so a page that only formats a
number never pays for a cache.

```ts
import { DataProvider, createCollection } from '@talelk/newui-data/query'
```

### `DataProvider` and `createDataClient`

`DataProvider` wraps the page in a `QueryClientProvider`. Pass `client` to share
one cache across panes; omit it and the provider owns a client and **clears it on
unmount**, so a route change leaves no timers or caches behind.

`createDataClient(options)` states the kit's defaults once:

| option | default | why |
| --- | --- | --- |
| `staleTime` | `30_000` | local data does not change under a stale page |
| `retry` | `1` | a transient failure is worth one more try |
| `refetchOnWindowFocus` | `false` | not a dashboard; returning to the tab is not a refresh |
| `throwOnError` | `false` | an error is data the page renders, not an exception that tears the tree down |
| mutations `retry` | `0` | a write is not idempotent by accident |

### The repository

```ts
export interface Repository<T extends { id: string }, New = NewRecord<T>> {
  list(options?: { signal?: AbortSignal }): Promise<T[]>
  create(input: New, options?: { signal?: AbortSignal }): Promise<T>
  update(id: string, patch: Partial<T>, options?: { signal?: AbortSignal }): Promise<T>
  remove(ids: string[], options?: { signal?: AbortSignal }): Promise<void>
}
```

- **`list` is the only read.** A page that needs one record filters the list the
  cache already holds; a remote adapter that wants one request still exposes
  `list` and lets the cache be the collection.
- **Domain verbs are patches.** `complete`, `archive` and `comment` are
  `update(id, { status: 'Done' })` at the call site. A contract that grows a
  method per business action is a database, not a seam.
- **`New` is the create input**, not `Omit<T, 'id'>`: a repository fills the
  defaults it owns, and Tasks creates from `{ title, priority }` alone.

### `createCollection`

```ts
const tasks = createCollection(() => ({
  key: ['example-tasks'],
  repository,
}))

tasks.query.rows()        // T[]
tasks.query.isPending()   // first request in flight
tasks.query.isFetching()  // any request in flight (the Refresh button)
tasks.query.isError()     // the last request failed
tasks.query.error()       // Error | undefined
tasks.query.refetch()     // "Try again"

tasks.create.mutateAsync({ title, priority })
tasks.update.mutate({ id, patch })
tasks.updateMany.mutate({ ids, patch })
tasks.remove.mutate({ ids })
```

- **Updates and removals are optimistic and reversible.** The patch lands on
  screen before the request, and a failure restores the previous list — proven
  in `collection.test.tsx` with a gated promise, not by inspecting the cache.
- **Polling is opt-in.** `refetchInterval?: number | false` (default off) is
  the explicit dial for data that changes on its own; the client's
  `refetchOnWindowFocus: false` stays, so returning to the tab is still not a
  refresh.
- **Creates are not optimistic.** A new record's id and defaults are the
  repository's to decide; guessing them would show a row that then changes
  identity. `mutateAsync` resolves after the refresh, which is what lets a
  create dialog close knowing the row is on screen.
- **Every mutation refreshes the list on settle** (`invalidateQueries`), so a
  mutation and the "Refresh" button take the same path and cannot disagree.
- **Errors are normalised** to `Error` (TanStack's is `unknown`) and reported
  once through `onError`, so a page words one notice for every failure.
- **`key` is the cache identity** — two panes reading the same collection share
  one request and one update.
- **`keepPreviousData` keeps the page alive across keys.** With it on, a key
  change (server-mode paging, a new sort) keeps the previous rows on screen
  until the next response lands — stale for one round trip, never blank.

### `createServerTableState`

The store behind a server-mode `DataTable`: the slices the table mirrors, as
one object that also serializes to a query key and — with a router adapter —
to the URL.

```ts
import { createServerTableState } from '@talelk/newui-data/query'

const tableState = createServerTableState({
  initial: { pagination: { pageSize: 25 } },
  sync: { adapter, namespace: 'tasks' }, // keys become `tasks.sorting`, …
})

tableState.sorting() // ServerTableSort[]
tableState.pagination() // { pageIndex, pageSize }
tableState.setSorting([{ id: 'title', desc: true }]) // returns to page 0
tableState.key(['tasks']) // query key: base + every slice
```

- **The reset rule lives here and in the table**: `setSorting`,
  `setColumnFilters` and `setGlobalFilter` return `pageIndex` to 0, because
  page 3 of a result set that just changed shape is not a page anyone asked
  for. `setPageSize` keeps the top row instead.
- **The slices are structural copies of TanStack's state shapes** — this
  package never imports the table engine, so the app is the only place the
  two meet (`sorting={tableState.sorting()}` etc.).
- **`key(base)` is the request identity.** Pass it to `createCollection`'s
  `key` (with `keepPreviousData`) and the same table state that renders is
  the state that fetches.
- **Without `sync.adapter` the store is plain signals**; with one it is
  `createUrlState` under the namespace, so a shared link deep-links the
  table's view.

## Form — `@talelk/newui-data/form`

```ts
import { createAppForm, createAutoSave, fieldError, Form } from '@talelk/newui-data/form'
```

TanStack Form stays the engine — validators, field state, reset. This surface
adds the three things every page was writing by hand:

- **`createAppForm({ defaultValues, onSubmit, schema?, ui?, pruneHidden? })`**
  returns `{ form, submitting, ui, document }`. `submitting()` is true while the submit
  handler's promise is pending, which is exactly what a submit button's
  `loading` reads. `onSubmit` receives `(value, api)`; `api.reset()` clears the
  form after a successful submit.
- **`<Form form={form}>`** is the element, wired: `noValidate` because the kit's
  field messages are the error UI (the native bubble appears first, says less and
  disappears on the next keystroke), and `preventDefault` because a real submit
  in a single-page app navigates.
- **`fieldError(field)`** turns TanStack's error list into the single `error`
  string the P5 `Field` contract takes. It accepts strings and `{ message }`
  issues, so a Standard Schema validator works without a page-level adapter.

The bridge deliberately **does not render fields**. `TextInput`, `Select`,
`Password` and the rest already own their markup, labels and error region (P5);
a wrapper that picked one for you would either grow a variant per control or
take the control as a prop and become a second component tree. The shared call
shape is `value` / `error={fieldError(field())}` / `handleChange`.

### The config-form engine

The same `createAppForm` grows a declarative layer, driven by the **field
map** (`ui`: `FieldConfig` entries keyed by *static* field path) that says
*how* each field behaves. The engine reads only `when` and `dependsOn`; the
rest is renderer vocabulary the `ConfigForm` organism consumes from the same
object. A key that names an array position (`items[1]`) throws: a repeater's
row fields are declared once under its `fields` and apply to every row.

- **`schema`** is a Standard Schema (Zod, Valibot, Ark), validated on change and
  on submit with issues mapped onto fields. It validates the *submitted*
  document: hidden fields are pruned before the check, and issues under hidden
  paths are dropped, so a field the user cannot see never blocks the submit.
- **`ui`** is the field map. Each `FieldConfig` carries `when(scope, values)`
  and `dependsOn` (paths that revalidate this field, compiled onto a TanStack
  `onChange` listener with the `dynamic` cause). `scope` is the form's values
  for a top-level entry and **the row** for a repeater's row field; `values`
  is always the whole form. Row fields are expanded per row (`items[1].url`)
  for pruning and for dropping issues, so the prune rule holds inside
  repeaters. Visibility itself needs no wiring — `when` reads the form's
  reactive values.
- **`pruneHidden`** (default `true`) drops fields hidden by `when` from the
  document handed to `onSubmit`, so a hidden setting is not required of it. A
  hidden row field leaves its row; the row stays.
- **`document(values)`** is that submitted document for any values — what
  submit sends, and what autosave sends.
- **`createAutoSave(source, { save, debounce = 800, filter?, id?, storage? })`**
  runs two stores (see *autosave* and *draft* in `CONTEXT.md`):
  - the **autosave** — debounced; when the timer fires it runs
    `validateAllFields('submit')` and calls `save` only when the document is
    valid. Pass the `createAppForm` result as `source` and `save` receives
    `document(values)`, the same pruned document submit sends; a bare TanStack
    form has no field map and saves its values as they are. An autosave is not
    a submit: `isSubmitting` and `submissionAttempts` do not move.
  - the **draft** — with `id`, every change writes the *unpruned* values to
    `createConfigStore` under `newui.form-draft`, so a closed tab loses nothing
    and re-showing a hidden field gives back what was typed. A successful
    autosave or a successful submit drops it.

  It returns `{ saving, saved, dirty, flush, hasDraft, restoreDraft,
  discardDraft }`; every accessor, `hasDraft` included, is reactive. Cleanup
  runs with the owner (`onCleanup`), so there is no `dispose`. `restoreDraft()`
  returns the stored values as they are: a draft may predate the current
  schema or field map, so treat it as untrusted input — `form.reset(draft)`
  and let validation report what no longer fits.

The rendered face of this layer is the `ConfigForm` organism and the `Repeater`
molecule — see `spec/config-form.md` and `spec/repeater.md`.


## URL state — `createUrlState`

The state that makes a page reproducible by link — filters, view/tab, page
index, sort, density, time range — lives in the URL, and the kit stays
router-agnostic by contract: the app supplies the adapter.

```ts
import { createUrlState } from '@talelk/newui-data'

const state = createUrlState(
  { 'board.view': 'kanban', 'board.page': 1, q: '' },
  { adapter, debounce: ['q'] },
)

state['board.view']()      // read, like any signal
state.set('q', 'invoice')  // write; `undefined` means absent, never ""
```

- **The adapter is the seam.** `search()` is read **once on mount** — first
  paint renders from the URL, so a shared link deep-links without a client
  redirect — and `replace(params)` writes. Solid Start's `useNavigate`,
  TanStack Router or a `history.replaceState` shim all satisfy it. Without an
  adapter the primitive is a plain controllable signal and the URL is never
  touched, which is what keeps tests and SSR clean.
- **Replace, not push.** State changes within a page replace the query string
  (the back button leaves the page, it does not walk a filter history), and
  writes coalesce into one `replace` per tick.
- **Search-like keys debounce.** `debounce: ['q']` waits out 300ms of idle
  before writing, so typing does not spam the history; `debounceMs` moves the
  window.
- **Serialization is typed by `initial`.** Primitives go in as-is, arrays and
  objects as JSON with stable key order, and a value that no longer parses
  falls back to the initial — a stale link is a reset, not a crash.
- **Keys are the app's, not the table's** — `board.sort` rather than `sort` —
  so one URL can host several surfaces without collisions. Transient UI
  (popover `open`, hover, scroll) and secrets do not belong here.

## Config store — `createConfigStore`

One storage abstraction for user-authored views, with two consumers: the
**saved view** (a named filter + column + sort bundle) and the **dashboard
config** (the widget-layout document). Both are documents in the same store,
distinguished by a `type` discriminator in the envelope — never by separate
stores.

```ts
import { createConfigStore } from '@talelk/newui-data'

const views = createConfigStore({ key: 'acme.views' })

views.save('week-only', { filters: [], sorting: [] }, { type: 'saved-view' })
views.load<{ filters: unknown[] }>('week-only') // { v, name, type?, updatedAt, doc }
views.list()                                    // newest first
views.rename('week-only', 'this-week')
views.remove('week-only')
```

- **Documents are versioned envelopes** (`{ v, name, type?, updatedAt, doc }`)
  so a future shape migrates per-store, not globally. `migrate(doc, from)`
  upgrades older reads; without one, a version mismatch is unreadable rather
  than silently wrong. `updatedAt` is what makes conflict resolution a later
  decision, not a later accident.
- **Storage is a seam.** The default is `localStorage` (an in-memory Map under
  SSR — importing and using the store never throws); a server-backed adapter
  drops in without touching consumers. `key` namespaces the entries, so
  stores never collide.
- **Documents are capped at 64KB with a loud dev warning** — a widget grid
  that grows unbounded is caught in development, not in a quota error. A
  backend that throws drops the write and warns; it never fails the caller.
- **Sharing is data, not a second API**: a saved view is portable as its
  document — "copy link" encodes it through `createUrlState` when it fits,
  otherwise it exports as JSON.

## Transforms — `aggregate`, `timeBucket`, `rollup`

Pure functions over rows the app already fetched. No signals, no query, no
components — and past their size the answer is server-side, per server mode's
own doctrine.

```ts
import { aggregate, rollup, timeBucket } from '@talelk/newui-data'

const byRegion = aggregate(rows, {
  by: 'region',
  metrics: { total: { field: 'amount', metric: 'sum' }, n: { field: 'id', metric: 'count' } },
})

const series = rollup(rows, {
  field: 'createdAt',
  unit: 'month',
  metric: { field: 'amount', metric: 'sum' },
}) // { bucket: Date, value }[] ascending — chart-ready
```

- **One metric vocabulary** spans tables and transforms: `sum`, `count`,
  `min`, `max`, `extent`, `mean`, `median`, `unique`, `uniqueCount`, `first`,
  `last`. `count` counts rows; the numeric metrics skip non-numeric values;
  `unique` keeps first-seen order.
- **`timeBucket` floors to local time** — weeks start on Monday — and accepts
  a `Date`, an ISO string or an epoch. An unparseable date yields an Invalid
  Date, and `rollup` skips those rows instead of leaving a hole in the series.
- **`rollup` is `aggregate` over time**: a bare metric name counts rows per
  bucket; a `{ field, metric }` spec aggregates a value column.

## Dashboard state — `createDashboardState`

The connective tissue of an analytics dashboard: one shared time range, one
shared filter record and one cross-filter slot that charts, KPI cards and
tables all read and write.

```ts
import { createDashboardState, DashboardProvider, useDashboardState } from '@talelk/newui-data'

const dashboard = createDashboardState({
  timeRange: { preset: '30d' },
  filters: { region: 'EMEA' },
  adapter, // optional — the state round-trips to the URL
})

// Deep in the widget grid, no prop on any card:
const dashboardState = useDashboardState()
dashboardState.setTimeRange('qtd')
dashboardState.setCross({ column: 'region', value: 'EMEA' })
```

- **Presets are computed from a clock seam.** `7d` and `30d` end at today's
  end-of-day and start 6 and 29 days back at midnight; `qtd` and `ytd` floor
  to the quarter and the year. `now()` is an option so the math is testable;
  setting `from`/`to` marks the range `'custom'`, and a preset switch clears
  the custom dates.
- **The cross-filter is one slot.** `setCross({ column, value })` replaces
  whatever held the slot; the same column and value twice is a toggle, not a
  second filter, and `null` clears it.
- **Filters are a shared record.** Declared keys get their own URL params
  (`f:<key>`); undeclared keys work and serialize too. `undefined` returns a
  declared key to its default rather than to nothing.
- **The URL is the sync surface, via `createUrlState`.** `range`, `from`,
  `to`, `cross` and the filter keys round-trip through the app's adapter,
  pruned to what differs from the default; `sync: false` keeps the state a
  plain signal while `params()` still serializes it for "copy link".

## Table persistence — `createTablePersist`

What a table remembers, split by who owns the question. The **URL half** —
sorting, column filters, density, page size — makes a link reproducible and
serializes through `createUrlState`; the **storage half** — the column layout
(visibility, order, sizing, pinning) — is a personal preference that survives
a shared link, so it lives in a versioned `createConfigStore` document named
by the table id. The document carries the whole state, so a returning user
gets their sort back even when the URL says nothing; **the URL wins when it
does**.

```ts
import { createTablePersist } from '@talelk/newui-data'

const persist = createTablePersist({ id: 'orders', url: { adapter } })

const initial = persist.hydrate(['date', 'amount', 'status'])
// { columns?, sorting?, columnFilters?, density?, pageSize?, dropped }
persist.commit({ sorting: [{ id: 'date', desc: true }], pageSize: 25 })
persist.reset() // forget everything persisted for this id
```

- **Columns are dropped, not hidden forever.** A persisted column that no
  longer exists in the table is removed from the layout, named in `dropped`,
  and new columns are appended to the order, visible.
- **The document is versioned.** A payload without `v` predates the shape —
  `columns` as the visible ids, `sort` not `sorting` — and is migrated on
  read; fields that fail validation are dropped rather than trusted.
- **Failures are reported, not thrown.** A storage backend that rejects the
  write or a document that no longer parse reaches `onPersistError`; the
  table keeps working either way.

## CSV export — `exportCsv`

The table→CSV binding: export what the user sees. `exportCsv` reads the row
models and column state through a structural interface — TanStack Table
satisfies it, tests can hand it a literal — renders cells through the
column's `meta.format` when it has one, and resolves with a `Blob` built on
`csvText`; `downloadBlob(name, await exportCsv(table))` finishes the job.

```ts
import { downloadBlob, exportCsv } from '@talelk/newui-data'

const blob = await exportCsv(table, { scope: 'page', columns: 'visible' })
downloadBlob('orders.csv', blob)
```

- **`scope`** is `'page'` (the current slice of the filtered, sorted view),
  `'filtered'` (every filtered row, across pages — the default) or `'all'`
  (the raw data, ignoring filters).
- **`columns`** is `'visible'` (default) or `'all'`; a column with
  `meta.exportable: false` never ships, `meta.exportName` names the header.
- **It is a promise on purpose.** A server-side or streaming export can
  replace the in-browser one without the call site noticing.

## Realtime — `connectRealtime`

The socket finally has a consumer. `connectRealtime` (from
`@talelk/newui-data/resource`) subscribes to a `createRealtime` socket and
invalidates the matching query keys — **list events the `[doctype]` prefix,
doc events exactly `[doctype, name]`**. It is a function, not a hook: the
cache is the integration point.

```ts
import { createRealtime, connectRealtime } from '@talelk/newui-data/resource'

const socket = createRealtime({ url: realtimeUrl })
const connection = connectRealtime(queryClient, {
  realtime: socket,
  doctype: 'Task',
  onEvent: (event) => console.debug(event.type, event.doctype, event.name),
})

connection.close() // stop listening; the socket stays open for other consumers
```

A payload's `type` wins when present; otherwise a `name` means one document
changed and its absence means the list did.

## Rendered collections belong to organisms

`DataTable`, its `ScrollTable` shell and `VirtualList` render UI, so they live in
`@talelk/newui-organisms`, not in this headless package. TanStack Table and Virtual are
owned there too. Here the query/form logic ends at data and state; organisms
choose how that state is shown. See `spec/data-table.md`, `spec/scroll-table.md`
and `spec/virtual-list.md` for those visual contracts.

The playground imports no TanStack package directly: `@talelk/newui-data/query` owns
Query and `@talelk/newui-data/form` owns Form. Render engines are owned by organisms,
so a page pays for only the surface it renders.
