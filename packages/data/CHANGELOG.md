# @talelk/newui-data

## 1.1.0

### Minor Changes

- 73f9b95: The config-form engine (issue #30): a schema-driven form that renders itself.
  
  - **`createAppForm` grows a declarative layer** in `@talelk/newui-data/form`.
    A field map (`ui`: `FieldConfig` entries keyed by static field path) and a Standard `schema`
    drive the whole document: the schema validates the *submitted* document, so
    fields hidden by `when` are pruned before validation and issues under hidden
    paths are dropped — a field the user cannot see never blocks the submit.
    `dependsOn` compiles onto a TanStack `onChange` listener that revalidates the
    dependent field with the `dynamic` cause; `pruneHidden` (default `true`) drops
    hidden fields from the document handed to `onSubmit` — including a repeater's
    row fields, whose `when(row, values)` sees the row first. `document(values)`
    exposes that submitted document.
  - **`createAutoSave(source, { save, debounce = 800, filter?, id?, storage? })`**
    is debounced backend persistence that validates before writing. Given the
    `createAppForm` result it saves the same pruned document submit sends. With
    `id` it also keeps a local, unpruned draft under `newui.form-draft`, dropped
    after a successful autosave or submit; `hasDraft` is reactive.
  - **`Repeater`** (molecules) is a dynamic array over a `mode="array"` field —
    add/remove/copy with `maxItems`/`minItems` bounds and an optional collapse per
    row. Rows iterate with `Index`, so a removal never takes the wrong row's
    values, and structural changes revalidate from the changed index onward.
  - **`ConfigForm`** (organisms) is the rendered face: a `<form>` that renders
    every field from its field-map entry — the `FormControl` vocabulary for plain
    fields, `Repeater` for arrays, and `when` predicates for visibility, bound to
    the live form state.
  - **`FormControl`** now forwards `onBlur` on the text-like and `textarea` types,
    so a config field can mark itself touched.
- 0711f55: The dashboard-state workstream (issues #23, #25) lands the connective tissue
  of an analytics dashboard, headless by contract — no table, chart or filter
  bar is wired here; consumers bind these to their own widgets.
  
  - **Dashboard state.** `createDashboardState({ timeRange?, filters?, adapter?,
    sync? })` owns the shared time range (`7d | 30d | qtd | ytd | custom`,
    computed from a `now()` seam), the shared filter record, and a single-slot
    cross-filter (`setCross` replaces; the same value twice toggles off).
    `DashboardProvider` + `useDashboardState` publish it through the widget grid
    without prop-drilling. With a router adapter the state round-trips through
    `createUrlState`, pruned to what differs from the default.
  - **Table persistence.** `createTablePersist({ id, url?, storage?,
    onPersistError? })` splits what a table remembers by owner: sorting, column
    filters, density and page size go to the URL, the column layout
    (visibility/order/sizing/pinning) to a versioned `createConfigStore`
    document. `hydrate(columns)` drops persisted columns that no longer exist
    and names them in `dropped`; `commit(state)` writes both halves; older
    documents migrate on read.
  - **CSV export.** `exportCsv(table, { scope, columns })` resolves with a Blob
    of what the user sees — the page, the filtered set, or everything — over
    the columns the user can see, formatted through each column's `meta.format`
    and quoted by `csvText`. It reads the table through a structural interface,
    so it binds to TanStack Table without importing it.
- c6bd300: The headless data layer grows the analytics primitives decided in issues #22,
  #23, #24 and #32 — everything an analytics page kept writing by hand:
  
  - **URL state.** `createUrlState(initial, { adapter? })` serializes
    controllable signals to `URLSearchParams` behind an app-supplied router
    adapter: replace-not-push, one `replace` per coalesced tick, read-once on
    mount so a shared link deep-links without a redirect, and a 300ms debounce
    for search-like keys. Without an adapter it is a plain signal, so tests and
    SSR stay clean.
  - **Config store.** `createConfigStore({ key, storage?, migrate? })` stores
    saved views and dashboard configs as versioned envelopes
    (`{ v, name, type?, updatedAt, doc }`) with `list/load/save/remove/rename`
    over a storage seam — `localStorage` by default, a server adapter by
    substitution. Documents are capped at 64KB with a loud dev warning.
  - **Transforms.** Pure `aggregate(rows, { by, metrics })` with the eleven
    metric names table aggregation uses, `timeBucket(date, unit)` and
    `rollup(rows, { field, unit, metric? })` for chart series — no query, no
    components, nothing that pretends to be a warehouse.
  - **Refresh.** `createCollection` accepts `refetchInterval?: number | false`;
    focus-refetch stays off, the interval is the explicit dial.
  - **Realtime.** `connectRealtime(queryClient, resource, { onEvent })`
    subscribes a `createRealtime` socket to the query cache — list events
    invalidate the `[doctype]` prefix, doc events exactly `[doctype, name]`.
- 08ff107: Server-mode tables, end to end (issue #18):
  
  - **Store.** `createServerTableState({ initial?, sync? })` in
    `@talelk/newui-data/query` owns the four table slices — `sorting`,
    `columnFilters`, `globalFilter`, `pagination` — as controllable signals.
    Sorting, filtering and searching reset `pageIndex` to 0; changing
    `pageSize` keeps the top row in view. `sync: true` mirrors every slice
    through `createUrlState`, so a sorted, filtered, paged table survives a
    reload and a shared link. `key(base?)` serializes the slices into a query
    key for `createCollection`.
  - **DataTable.** `server={{ total }}` switches the table from owning the
    data to trusting the app: it never sorts, filters or slices rows, hands
    the four slices through `sorting`/`columnFilters`/`globalFilter`/
    `pagination` props with `on*Change` callbacks, and keeps `getRowId` for
    stable identity. `total: -1` means unknown — Next stays enabled and the
    pager drops "of N" and page numbers. `createCollection` gained
    `keepPreviousData?: boolean` so paging does not flash an empty table.

## 1.0.0

### Major Changes

- 0d87bbb: Clean break to the atomic public API. The `@talelk/newui-ui`, `@talelk/newui-blocks` and
  `@talelk/newui-layouts` packages are removed; consumers import atoms, molecules,
  organisms and templates from the new package names. No compatibility barrels,
  deprecated shell adapters or legacy route redirects are shipped.
  
  `@talelk/newui-templates` now exposes exactly `AppShell`, `PaneLayout` and
  `AuthLayout`. `AppShell` owns one responsive sidebar with tenant, grouped
  navigation and pinned settings/account controls; split rail/sidebar composition
  is removed. `DataTable`, `ScrollTable` and `VirtualList` move from the logic
  package into the atomic visual packages, leaving `@talelk/newui-data` headless.

### Minor Changes

- c47db72: `@talelk/newui-data/form` — the submit lifecycle and the field-error bridge.
  
  Tasks and Authentication each repeated the same six lines around every field:
  wire `value`, unwrap `meta.errors` into a string, handle submit with
  `noValidate` and `preventDefault`, and read `isSubmitting` for the button. The
  form surface adds those once, over TanStack Form:
  
  ```ts
  const { form, submitting } = createAppForm({
    defaultValues: { email: '' },
    onSubmit: async (value, api) => { await save(value); api.reset() },
  })
  ```
  
  - **`createAppForm`** returns `{ form, submitting }`; `submitting()` is true while
    the handler's promise is pending, which is what a submit button's `loading`
    reads.
  - **`<Form form={form}>`** is the element, wired: `noValidate` (the kit's field
    messages are the error UI; the native bubble appears first, says less, and
    disappears on the next keystroke) and `preventDefault` (a real submit in a SPA
    navigates).
  - **`fieldError(field)`** turns TanStack's error list into the single `error`
    string the P5 contract takes, accepting strings *and* `{ message }` issues.
  
  It deliberately does not render fields: the kit's controls own their markup,
  labels and error region. The bridge is the shared call shape, not a second
  component tree. Its own entry point keeps the validator engine out of pages that
  do not render a form (17.5 kB, budgeted, separate from the 0.77 kB helpers).
- 1f70e3f: `@talelk/newui-data` — the logic layer, starting with the pure helpers.
  
  The examples had already converged on four helpers and then copied each of them
  per page: formatting (four `Intl` USD copies), select plumbing, one-step undo
  (three copies) and downloads (the Blob/anchor/revoke dance in nine files, the
  CSV quoting in two). They are one package now, headless by contract — it imports
  `solid-js` and nothing from the visual packages, and no component may import it.
  
  `format` · `usd`, `usdK`, `count`, `bytes`, `isEmail`
  `select` · `optionsOf`, `first`
  `undo` · `createUndo`
  `download` · `downloadBlob`, `downloadText`, `csvText`, `downloadCsv`
  
  Twenty-five example files now import `@talelk/newui-data`; the local modules are
  deleted. The async shapes (repository, queries, forms, promoted table and list)
  are the next slice — `spec/data.md` is the contract for what has shipped and
  says why `Notice` did *not* move here: it renders, so it is a component.
- 3745084: `@talelk/newui-data/query` — the async surface: one client, one repository contract,
  one collection.
  
  ```ts
  import { DataProvider, createCollection } from '@talelk/newui-data/query'
  ```
  
  - **`DataProvider`** owns the query client and clears it on unmount; pass a
    `client` to share one cache across panes. `createDataClient` states the kit's
    defaults: no refetch on focus, one retry, `throwOnError: false`.
  - **`Repository<T, New>`** is `list / create / update / remove` and nothing else.
    Domain verbs are patches at the call site — a contract that grows a method per
    business action is a database, not a seam.
  - **`createCollection`** returns the list query and four mutations. Updates and
    removals are **optimistic and reversible**: the change is on screen before the
    request, and a failure restores the previous list. Creates wait, because a new
    record's id and defaults are the repository's to decide. Every mutation
    refreshes the list on settle, so a mutation and the Refresh button take the
    same path.
  
  The query surface is its own entry point (15.5 kB gzip, budgeted): importing
  `usd` still costs 0.77 kB and no cache. TanStack Query is the package's
  dependency now; the app no longer depends on it directly, and Tasks — the one
  page that used it — adopts the collection API instead of creating a client and
  writing cache updates by hand.

### Patch Changes

- 7945c81: `fieldError` prints a message once, even when a field declares it for both
  `onChange` and `onSubmit`.
  
  A field that validates as you type *and* on the way out usually uses the same
  sentence for both. TanStack keeps one entry per validator, so the naive join
  rendered it twice ("Use at least 8 characters. Use at least 8 characters.").
  The bridge now de-duplicates the messages, which is what the single `error`
  string the `Field` contract takes was always meant to be.
