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
| `density` | `'comfortable' \| 'compact'` | 44px or 36px rows |
| `cardBreakpoint` | `'sm' \| 'md'` | width at which the table becomes cards; `sm` (640px), `md` (768px) or `lg` (1024px); default `sm` |
| `selectionSummary` | `(ids) => JSX.Element` | total or scope in the mobile selection bar |
| `selectable` | `boolean` | show selection and bulk actions; defaults to `true`, but selection only renders when `onRowsAction` exists |
| `rowSelectable` | `(row: T) => boolean` | per-row eligibility; ineligible checkboxes are disabled and select-all skips them |
| `pageSize` | `number` | initial page size; defaults to `10` |
| `recordsLabel` | `string` | noun in the footer; defaults to “records” |
| `emptyTitle` | `string` | empty-state title |
| `emptyHint` | `string` | empty-state supporting text |
| `onClearFilters` | `() => void` | clears external filters before internal search |
| `pinnedStart` / `pinnedEnd` | `string` | freeze one column to each edge of the horizontal scroll; controlled via `onPinnedColumnsChange` |
| `defaultPinnedStart` / `defaultPinnedEnd` | `string` | uncontrolled initial pins |
| `onPinnedColumnsChange` | `(pinned: DataTablePinned) => void` | pinning is app-owned state; the table renders, never mutates it |
| `editable` | `boolean` | turn on inline editing for columns with `meta.editable` |
| `onCellChange` | `(id: string, columnId: string, value: string) => void` | committed cell edits; values are app-owned through `rows` |

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
  externally filtered row set resets the current page.
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
- The root is `data-slot="data-table"` for stable browser-level integration.
- `ScrollTable` is a separate molecule at `@talelk/newui-molecules`; importing it does
  not import the table engine into a route that renders its own semantic table.
