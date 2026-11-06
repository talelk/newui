---
'@talelk/newui-data': minor
'@talelk/newui-organisms': minor
---

Server-mode tables, end to end (issue #18):

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
