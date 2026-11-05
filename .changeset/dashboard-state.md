---
'@talelk/newui-data': minor
---

The dashboard-state workstream (issues #23, #25) lands the connective tissue
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
