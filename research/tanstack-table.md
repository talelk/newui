# TanStack Table for the newui analytics DataTable

Research for ticket #14. Question: how far does TanStack Table take us out of
the box for a server-mode analytics DataTable — manual pagination/sorting/
filtering, grouping, aggregation/summary rows, expanded rows, tree data,
column resizing/ordering/visibility, per-column filters — and what must newui
build on top?

## Headline finding: we are not on v8 — we are on v9.3.1

The planning question says "@tanstack/solid-table v8", but the repository
already pins **`@tanstack/solid-table` ^9.3.1**
(`packages/organisms/package.json`; installed under
`node_modules/.pnpm/@tanstack+table-core@9.3.1`). v9 is a **major rewrite** of
v8, not an increment: new construction API (`createTable` replaces
`createSolidTable`), explicit feature registration via `tableFeatures()`,
TanStack Store–backed state atoms, ESM-only builds, and renamed/reshaped APIs
(sortingFn→sortFn, left/right→start/end pinning, `flexRender()`→`<FlexRender/>`).
The existing `DataTable` is already v9-shaped. The three downstream tickets
(server-mode contract, grouping/aggregation, column operations) must be written
against v9, not the v8 docs. Sources: installed `dist/**/*.d.ts`, the v9
migration guide (tanstack.com/table → Solid → Migrating to V9), and the
`migrate-v8-to-v9` skill that ships inside the installed package.

## 1. What TanStack Table v9 gives us out of the box

### 1.1 The v9 model

- **Headless state machine + row models.** The table owns state slices
  (pagination, sorting, filters, grouping, expanded, column sizing/visibility/
  ordering/pinning, selection, …) and exposes typed APIs (`table.nextPage()`,
  `column.toggleSorting()`, `row.toggleExpanded()`, …). It never renders or
  fetches — markup, CSS, keyboard, and data fetching stay ours.
- **Explicit features.** `tableFeatures({...})` registers feature modules,
  row-model factories (`createSortedRowModel()` etc.) and function registries
  (`sortFns`, `filterFns`, `aggregationFns`) as type-checked slots; APIs only
  exist when their feature is registered, and unused code tree-shakes.
  `stockFeatures` exists as a v8-like escape hatch.
- **Solid adapter surface.** `createTable()` in a Solid owner, `get data()`
  getters for reactive inputs, `table.atoms.<slice>.get()` for tracked reads,
  external atoms (`atoms: { sorting: atom }` from `@tanstack/solid-store`) so
  the app can own state slices, plus `tableOptions()` / `createTableHook()`
  for reusable app-level table factories (the Form-style hook pattern).
- **v9 additions relevant to an analytics grid:** cell selection (rectangular
  ranges), cell spanning (merged cells), row pinning, logical `start`/`end`
  pinning vocabulary, `table.getMaxSubRowDepth()`, and an aggregation feature
  that is **independent from grouping** (grand totals without grouping).

### 1.2 Server mode ("manual") — built in, as a contract, not a fetcher

Every dataset-wide operation has a `manual*` option that keeps the state/API
layer but tells the row model to stand down:

| Operation | Manual option | Client-side bypass |
| --- | --- | --- |
| Column + global filtering | `manualFiltering` | `filteredRowModel` |
| Sorting | `manualSorting` | `sortedRowModel` |
| Pagination | `manualPagination` | `paginatedRowModel` |
| Grouping | `manualGrouping` | `groupedRowModel` |
| Expanding (tree) | `manualExpanding` | `expandedRowModel` |
| Aggregation values | `manualAggregation` | `aggregationFn` local fallback |

Built-in pieces that make server mode real:

- `pageCount` / `rowCount` options for manual pagination (row count drives
  page math; `-1` for unknown), `getCanNextPage()`, `getPageOptions()`,
  `setPageIndex()`, `resetPagination()`.
- State shapes ready for query keys: `PaginationState`, `SortingState`
  (multi-sort array), `ColumnFiltersState` (per-column `{id, value}[]`),
  `GroupingState` (ordered column ids), `ExpandedState`.
- Per-slice `state` + `on*Change` control (v8-style, still supported) and the
  v9-preferred external atoms — both let a TanStack Query key read the exact
  same state the table mutates.
- **There is deliberately no server row model and no fetching layer.** The
  docs state this explicitly: any backend contract (REST params, GraphQL,
  RPC) is ours; TanStack Query is the recommended companion, and the
  `with-tanstack-query` example plus the bundled `with-tanstack-query` skill
  give the canonical pattern (state in query key + queryFn, `placeholderData:
  keepPreviousData`, page index reset in change handlers).

Caveats the docs flag, which become our engineering work:

- `manualPagination` disables `autoResetPageIndex` by default, and when a
  client row model is omitted, state changes **do not run their auto-reset
  hooks** — resetting the page index on filter/sort/group changes is our code.
- Mixing client and server processing is only valid when the smaller scope is
  intentional ("when the server owns pagination, it should also own filtering,
  grouping, sorting or aggregation over the full result set").
- Stable `getRowId` is required so selection/expansion survive paging.

### 1.3 Per-axis inventory (the ticket's checklist)

- **Manual/server-side pagination + sorting + filtering:** yes, as above —
  state, APIs, manual bypasses, `rowCount`. Nothing fetched.
- **Row grouping:** `columnGroupingFeature` — grouping state (ordered column
  ids), synthetic grouped rows with `subRows`, `groupedColumnMode`
  (reorder/remove), `cell.getIsGrouped()/getIsPlaceholder()`, `row.
  getGroupingValue()`. Client-side is turnkey (`createGroupedRowModel()`);
  server-side is `manualGrouping: true` **plus a caveat the docs put in bold:
  "there are not currently many known easy ways to do server-side grouping…
  you will need to do lots of custom cell rendering."**
- **Aggregation / summary rows:** refreshed in v9 into its own
  `rowAggregationFeature`. 11 built-in definitions (`sum`, `count`, `min`,
  `max`, `extent`, `mean`, `median`, `unique`, `uniqueCount`, `first`, `last`),
  multiple keyed aggregations per column (`aggregationFn: ['count','mean',
  {id:'range',aggregationFn:'extent'}]`), `aggregatedCell` for grouped rows,
  and `column.getAggregationValue({ rows, maxDepth })` to total any row subset
  (page rows, filtered-selected, etc.) in a footer. **Server-provided totals
  plug in** via a `getAggregationValue` provider on the column/defaultColumn
  (return `{ value }` to mark handled) and `manualAggregation`.
- **Expanded rows / tree data:** `rowExpandingFeature` + `getSubRows` for
  nested data; `manualExpanding` for server-side expansion; custom detail
  panels via `getRowCanExpand` + `row.getIsExpanded()`; tree-aware filtering
  (`filterFromLeafRows`, `maxLeafRowFilterDepth`), `paginateExpandedRows`,
  and `table.getMaxSubRowDepth()` for depth-aware aggregation.
- **Column resizing / ordering / visibility:** `columnSizingFeature`
  (size/min/max state, `getSize/getStart/getAfter`, total-size helpers) and —
  new in v9 — `columnResizingFeature` as a separate drag-interaction feature
  and `columnResizing` state slice. `columnOrderingFeature` and
  `columnVisibilityFeature` are state + toggle APIs. **All four are
  headless state — the drag handles, reorder gestures, and menus are ours.**
- **Per-column filters:** `columnFilteringFeature` with per-column
  `ColumnFilter {id, value}` state, 18 built-in filter fns (string, equality,
  array, `inNumberRange`, `inDateRange`, `between`, `empty/notEmpty`…),
  `constructFilterFn` for custom variants with value resolvers, plus
  `globalFilteringFeature` for the search box. Faceting (count-in-facet UI)
  is `columnFacetingFeature`, and server-side facets use custom factories
  rather than a `manual*` flag.
- **Also free:** row selection (with v9 Shift-range selection), row/column
  pinning (`start`/`end` — matches our `pinnedStart`/`pinnedEnd` prop names),
  row pinning, cell selection, cell spanning, virtualization guidance via
  `@tanstack/virtual` (we already depend on `@tanstack/solid-virtual`).

## 2. What newui must build on top

1. **The server-mode wiring layer (the real work).** A documented request/
   response contract: table state slices → query key → backend params →
   `{ rows, rowCount, aggregates? }` response. Page-index reset in every
   change handler (no auto-reset hooks fire in manual mode), stale-response
   protection (`placeholderData: keepPreviousData` or equivalent), loading/
   error states, and `getRowId` discipline across pages. This is exactly the
   `@talelk/newui-data` `/query` territory, not the organism's.
2. **Server-side grouping + aggregation.** TanStack gives us the state and
   the bypass, not the query. We need: a group-keys/group-values backend
   contract, custom cell rendering for synthetic grouped rows (the docs' own
   warning), and a convention for feeding server totals into footers via the
   `getAggregationValue` provider + `manualAggregation`.
3. **Lazy tree loading.** `manualExpanding` + load-on-expand wiring,
   per-row loading affordances, `getRowCanExpand` driven by a
   `hasChildren`/`childrenLoaded` flag, and expansion keyed by stable ids.
4. **Column-operation UI.** Resize handles + pointer-event wiring (the
   feature ships state, not a handle), drag-to-reorder (ordering is
   state-only), the visibility menu (we have one), pinning controls, and
   persistence of `columnSizing`/`columnOrder`/`columnVisibility` — external
   atoms make localStorage persistence straightforward.
5. **Rendering for large server pages.** Virtualized body for big page
   sizes, sticky header, summary/footer row markup, mobile cards (existing).
6. **The current `DataTable` is client-mode only.** Its registered features
   are filtering/pagination/sorting/visibility/pinning/global/selection with
   client row models, and `spec/data-table.md` states "search, sorting,
   visibility and pagination are local table state." Server mode is a new
   contract, not a prop tweak.

## 3. API-shape implications for a server-mode DataTable

- **State ownership decides the design.** Recommend building the server-mode
  DataTable on **external atoms** (or at minimum controlled `state` +
  per-slice `on*Change` with getters) so `@talelk/newui-data` can read the
  exact slices for the query key without component-local mirroring. Note the
  v8 global `onStateChange` is **gone** in v9 — per-slice handlers only.
- **Feature-set typing is load-bearing.** Column defs are typed
  `ColumnDef<typeof features, T>`, so a server-mode table that adds grouping/
  aggregation/expanding needs those features registered. Either widen the
  canonical `createFeatures()` in `DataTable.tsx` to the full shipped axis set
  (one `DataTableColumn<T>` type, slightly larger bundle) or ship two feature
  profiles and two column types (drift risk). The single-widened-profile
  option fits the kit's "one component, one API" bias.
- **Prop shape.** A `mode: 'client' | 'server'` (or per-axis `manual*`
  passthroughs) plus controlled `pagination`/`sorting`/`filters`/`grouping`/
  `expanded` props with `on*Change`, mirroring `createDisclosure`-style
  controlled/uncontrolled pairs already used in the kit; `rowCount` becomes a
  first-class prop.
- **v9-specific code rules for the implementation tickets:** never destructure
  row/cell/column methods (prototype-bound now — `row.getValue(id)` must stay
  on the instance); `data`/`state` must be getters, not snapshots; pinning
  vocabulary is `start`/`end`; `sortFn` not `sortingFn`; `<FlexRender/>` not
  `flexRender()`; ESM-only + ES2022 (fine for our consumers); `getIsSomeRowsSelected()`
  semantics changed ("at least one", gate indeterminate on `!getIsAllRowsSelected()`).
- **The good news for the column-ops ticket:** `pinnedStart`/`pinnedEnd`
  already match v9's `start`/`end` rename, and `table.atoms.columnSizing` +
  external atoms give persistence for free.

## Sources

- Installed package (primary, version-matched): `@tanstack/table-core@9.3.1`
  `dist/**` type declarations (manual* options, aggregation/grouping/
  expanding/filtering feature types, `tableFeatures`, `createTableHook`) and
  `@tanstack/solid-table@9.3.1` `skills/` (`getting-started`,
  `table-state`, `migrate-v8-to-v9`, `with-tanstack-query`).
- tanstack.com/table v9 docs: `guide/client-side-vs-server-side` (manual
  table, server flow, no-built-in-server-model rationale), Solid guides:
  `migrating`, `sorting`, `grouping`, `aggregation`, `expanding`,
  `column-filtering`, `column-sizing`.
- Repository: `packages/organisms/package.json` (v9 pin),
  `packages/organisms/src/organisms/DataTable/DataTable.tsx` (current v9
  client-mode usage), `spec/data-table.md` (current contract).
