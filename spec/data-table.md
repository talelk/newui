# DataTable

A collection rendered as an accessible, searchable, sortable, paginated table.

## Usage

```tsx
import { DataTable, type DataTableColumn } from '@talelk/newui-organisms'

<DataTable
  title="Projects"
  rows={rows()}
  columns={columns}
  actionLabel="Archive selected"
  onRowsAction={(ids) => archive(ids)}
/>
```

TanStack Table owns row models; the page owns records, mutations and domain
actions. The component package is an organism because it composes controls into
a whole data region.

## Props

| prop | type | notes |
| --- | --- | --- |
| `title` | `string` | required accessible name for the table region |
| `rows` | `T[]` | records with stable string `id`s |
| `columns` | `DataTableColumn<T>[]` | TanStack column definitions for the supported feature set |
| `actionLabel` | `string` | bulk-action label; defaults to “Update selected” |
| `onRowsAction` | `(ids: string[]) => void` | called with selected row ids |
| `hideSearch` | `boolean` | hide internal search when an external FilterBar owns it |
| `caption` | `JSX.Element` | page context beside Search, e.g. “18 expenses · Sep 2026” |
| `loading` | `boolean` | replaces the data region with the shared loading skeleton |
| `error` | `JSX.Element` | replaces the data region with the shared error state |
| `onRetry` | `() => void` | retry action in the error state |
| `density` | `'comfortable' \| 'compact'` | `compact` (the default) is about 28px rows; `comfortable` about 36px, for touch-first or reading-heavy screens |
| `cardBreakpoint` | `'sm' \| 'md'` | width at which the table becomes cards; `sm` (640px), `md` (768px) or `lg` (1024px); default `sm` |
| `selectionSummary` | `(ids) => JSX.Element` | total or scope in the mobile selection bar |
| `selectable` | `boolean` | show selection and bulk actions; defaults to `true`, but selection only renders when `onRowsAction` exists |
| `rowSelectable` | `(row: T) => boolean` | per-row eligibility; ineligible checkboxes are disabled and select-all skips them |
| `pageSize` | `number` | initial page size; defaults to `10` — with `virtual`, one page of the whole result unless set |
| `virtual` | `boolean` | window the body so only the rows near the viewport stay mounted, measured as they render; off by default |
| `recordsLabel` | `string` | noun in the footer; defaults to “records” |
| `emptyTitle` | `string` | empty-state title |
| `emptyHint` | `string` | empty-state supporting text |
| `onClearFilters` | `() => void` | clears external filters before internal search |
| `pinnedStart` / `pinnedEnd` | `string \| string[]` | freeze one column or several to each edge of the horizontal scroll; controlled via `onPinnedColumnsChange` |
| `defaultPinnedStart` / `defaultPinnedEnd` | `string \| string[]` | uncontrolled initial pins |
| `onPinnedColumnsChange` | `(pinned: DataTablePinned) => void` | pinning is app-owned state; the table renders, never mutates it |
| `columnOps` | `ColumnOps` | header operations: `resizable`, `reorderable`, `menu` (default `true` when `columnOps` is set) |
| `columnOrder` / `onColumnOrderChange` | `ColumnOrderState` / `(order) => void` | leaf ids in display order; controlled, reported on every move |
| `columnSizing` / `onColumnSizingChange` | `ColumnSizingState` / `(sizing) => void` | user-resized widths in pixels, keyed by column id |
| `facets` | `Record<string, { value: string; count: number }[]>` | server-provided facet counts per column, offered inside that column's filter popover |
| `editable` | `boolean` | turn on inline editing for columns with `meta.editable` |
| `onCellChange` | `(id: string, columnId: string, value: string) => void` | committed cell edits; values are app-owned through `rows` |
| `server` | `{ total: number }` | server mode: the backend owns sorting, filtering and pagination; `total` is the only count the table trusts, `-1` means unknown |
| `getRowId` | `(row: T) => string` | row identity, defaulting to `row.id`; required stable in server mode so selection survives paging |
| `sorting` / `onSortingChange` | `SortingState` / `(state) => void` | controlled sort slice; a change also resets the page (server mode) |
| `columnFilters` / `onColumnFiltersChange` | `ColumnFiltersState` / `(state) => void` | controlled column filters, e.g. from a FilterBar |
| `globalFilter` / `onGlobalFilterChange` | `string` / `(value) => void` | controlled search term (server mode) |
| `pagination` / `onPaginationChange` | `PaginationState` / `(state) => void` | controlled pagination slice |
| `grouping` / `onGroupingChange` | `string[]` / `(grouping) => void` | column ids rows are grouped by, in order; controlled |
| `groupingMode` | `'reorder' \| 'remove'` | what happens to a grouped column's own column; default `reorder` |
| `renderGroupedCell` | `(row) => JSX.Element` | override the default grouped cell |
| `summary` | `'none' \| 'page' \| 'all'` | footer row of totals; `page` totals the visible page, `all` the whole result |
| `aggregates` | `Record<string, number>` | server-computed totals by column id (server mode) |
| `getSubRows` | `(row) => T[] \| undefined` | nested data: a row's children, the same shape as `rows` |
| `renderDetail` | `(row) => JSX.Element` | detail panel rendered under an expanded row |
| `onRowExpand` | `(row) => void` | fires when a row expands — the hook for server-side lazy children |
| `filterFromLeafRows` | `boolean` | filter tree data from its leaves, so a parent survives on a descendant's match |

## Behavior

- Selection is a checkbox column and the bulk action appears only when rows are
  selected. After the callback, selection resets. `rowSelectable` marks a row
  ineligible: its checkbox is disabled and select-all ignores it. Selected rows
  use the blue selection wash in both the table and the mobile cards. Below
  `sm`, the bulk action moves to a fixed `SelectionBar` at the bottom edge and
  the toolbar action is hidden.
- `loading` and `error` use the shared `DataState`; the data region and footer
  are replaced. The toolbar is stable: with `hideSearch` and no `caption` it
  shows the table title, so selecting rows never inserts a new 58px row and
  never moves Columns.
- The Columns menu sits in the stable toolbar, uses the column's visible header
  text, and never appears as a raw accessor id.
- A selectable table requires a bulk action. With no `onRowsAction`, no
  checkbox column is rendered. With `hideSearch` and no `onClearFilters`, the
  empty state omits an action that cannot reset the external filter.
- The mobile pager is compact (`Page 1 of N` plus arrows); the numbered pages
  and range are hidden below `sm`. An empty table hides the footer entirely.
- Columns may declare `meta.mobile` as `title`, `subtitle`, `amount`, `status`
  or `meta`. When at least one column does, a card list replaces the table
  below `sm` (640px); the library owns the card wrapper, selection and
  pagination, and renders each column's existing cell. Columns without
  `meta.mobile` stay table-only. With no such metadata the table keeps its
  horizontal scroll at every width.
- Search, sorting, visibility and pagination are local table state. A new
  externally filtered row set resets the current page. **Server mode** flips
  sorting, filtering and pagination to the app; see below.
- Column alignment is set with `meta: { align: 'end' }` for numeric columns.
- **Pinning.** One column per edge stays visible while the rest scroll
  horizontally (`pinnedStart` — the identifier; `pinnedEnd` — typically the
  actions). Pinned cells are sticky at the edge with an opaque surface, a
  shared divider border, and the row's hover/selected tint, so they read as
  part of the row. The mobile-card layout ignores pinning — cards do not
  scroll horizontally. Pinning state belongs to the app; the table renders
  it and reports nothing on its own.
- **Inline editing.** With `editable` and `onCellChange` set, columns whose
  `meta.editable` is `true` render a click-to-edit cell (`meta.editInput`
  picks `text` or `number`). Enter or blur commits the trimmed value through
  `onCellChange`; Escape cancels. The cell edits the row's *raw* field — a
  formatted `cell` render (e.g. `$10`) is replaced by the editor while
  editing and restored after. Values are app-owned: the table never mutates
  `rows`; it shows whatever the next `rows` carry.
- **Server mode.** With `server={{ total }}` set, the backend owns
  sorting, filtering and pagination over the whole result set and `rows` is
  the current page. Presence of `server` is the switch — TanStack's `manual*`
  flags stop the table from re-deriving those axes, and the state slices stay
  controllable (`sorting`, `columnFilters`, `globalFilter`, `pagination`, each
  with its `on…Change`). The table resets the page index to 0 inside its
  sorting/filtering change handlers, and it does not repaginate on row churn:
  new rows arriving is the paging, not a new query. `server.total` is the only
  count the table trusts — the footer shows it, the pager derives its numbers
  from it; `total: -1` means unknown, so the pager drops the numbered pages
  and the range and drives Next from `getCanNextPage()`. Selection keys rows
  by `getRowId` (default `row.id`), which must be stable across requests so a
  selection survives paging. The query-key half of this mode is
  `createServerTableState` in `@talelk/newui-data/query`.
- The root is `data-slot="data-table"` for stable browser-level integration.
- **Header groups.** A column definition may carry `columns`, and the header
  stacks into as many rows as the tree is deep. No new prop: the column tree
  is the API. Placeholders keep the grid aligned and are never interactive.
- **Row grouping.** `grouping` is a list of column ids, in order, and the table
  reports every change through `onGroupingChange`. A group row is the recessed
  surface (`bg-surface-gray-1`) spanning the record columns: expander, the
  grouped column's name, the shared value, the count under it, and the
  aggregated values of the columns that ask for them. A column opts out of
  grouping with `groupable: false` (the other column option), and
  `groupingMode` decides whether the grouped column keeps its own column
  (`reorder`, the default) or leaves the list (`remove`). In server mode `grouping` is echoed from the app
  and the rows arrive with `subRows` populated — server grouping is real rows,
  not synthetic ones.
- **Aggregation.** A column option — `aggregate` on the column definition, not
  a table prop — declares one of the eleven built-ins
  (`sum`, `count`, `min`, `max`, `extent`, `mean`, `median`, `unique`,
  `uniqueCount`, `first`, `last`) or a function over the group's records.
  `summary` renders the footer row: `page` over the visible page, `all` over
  the whole filtered result. In server mode `aggregates` carries the totals the
  backend computed and the table computes nothing.
- **Tree data and detail rows.** `getSubRows` gives a row children of the same
  shape; `renderDetail` gives any row a panel that opens beneath it. Both make
  the row expandable, and the expander button is the keyboard affordance —
  there is no Escape gesture to learn. `onRowExpand` fires the moment a row
  opens, which is where a server page fetches children it has not sent yet.
  Filtering a tree uses `filterFromLeafRows` so a parent survives because a
  descendant matches.
- **Grouped and detail rows follow the active `density`.** Below the card
  breakpoint, a group becomes a section header and its records stay flat cards
  — cards never nest inside cards.
- **Selection.** `rowSelectable` gates parents as well as records, and
  select-all skips what is ineligible. Selecting a parent selects its eligible
  descendants; the bulk action receives the record ids, including a tree row
  selected under a parent that is not itself selectable.
- **Column operations.** `columnOps` turns on the header operations; each is a
  separate switch so an app can offer resizing without reordering.
  - **Resize.** `resizable` puts a `role="separator"` handle on each leaf
    header's edge — a pointer drag with the keyboard twin: arrows nudge 8px,
    Shift 32px, Home and End jump to the column's `minSize`/`maxSize`, double
    click resets. Widths land in `columnSizing`, reported through
    `onColumnSizingChange`; a resize changes no rows, so it never resets the
    page. The selection column is chrome and is never resized.
  - **Reorder.** `reorderable` makes the header itself draggable (a 4px
    threshold keeps a click a click) and adds Move left/right to the column
    menu. Order is `columnOrder`, TanStack's own vocabulary, so a persisted
    order is just an id list.
  - **Pin.** `pinnedStart`/`pinnedEnd` take one id or several; with two or more
    pins on an edge each cell's sticky offset is composed, so they stack
    instead of overlapping. The menu's Pin entries toggle the column's edge.
  - **Filter.** A column with `filterable: true` gets a funnel button that
    opens the control its `filterFn` needs — a text box for substring matching,
    a `Select` for equality and array filters, two number fields for a range,
    date fields for a date range. The control writes TanStack's `columnFilters`,
    the same array server mode sends to the backend, so client and server
    filtering stay one vocabulary and the column filter composes with the
    global search. `facets` supplies `{ value, count }` per column; a select
    filter renders them as its options and any other filter offers them as a
    list under the control. There is no client faceting engine — counting over
    unknown data is the backend's job.
  - **Menu.** `menu` (default `true` with `columnOps` set) adds the per-column
    button. Set `columnOps={{}}` with `menu: false` for drag-only operations.
- `ScrollTable` is a separate molecule at `@talelk/newui-molecules`; importing it does
  not import the table engine into a route that renders its own semantic table.

### Props (ColumnMenu.Root)

| prop | type | notes |
| --- | --- | --- |
| `columnId` | `string` | the column the items act on |
| `label` | `string` | the column's visible header text, used in the accessible names |
| `pinnedStart` / `pinnedEnd` | `string[]` | the current pins, so the Pin items read as pressed |
| `resizable` | `boolean` | show Reset size |
| `reorderable` | `boolean` | show Move left/right |
| `canSort` / `canHide` | `boolean` | show the sort items / Hide |
| `canMoveLeft` / `canMoveRight` | `boolean` | disabled rather than hidden at the ends of the order |
| `onSort` | `(columnId, desc) => void` | sort direction chosen in the menu |
| `onPin` | `(columnId, edge) => void` | `edge` is `start`, `end` or `unpin` |
| `onMove` | `(columnId, direction) => void` | `-1` left, `1` right |
| `onResetSize` | `(columnId) => void` | clear one column's resized width |
| `onHide` | `(columnId) => void` | hide the column |
