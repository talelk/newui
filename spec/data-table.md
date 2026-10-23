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
| `selectionSummary` | `(ids) => JSX.Element` | total or scope in the mobile selection bar |
| `selectable` | `boolean` | show selection and bulk actions; defaults to `true` |
| `rowSelectable` | `(row: T) => boolean` | per-row eligibility; ineligible checkboxes are disabled and select-all skips them |
| `pageSize` | `number` | initial page size; defaults to `10` |
| `recordsLabel` | `string` | noun in the footer; defaults to “records” |
| `emptyTitle` | `string` | empty-state title |
| `emptyHint` | `string` | empty-state supporting text |
| `onClearFilters` | `() => void` | clears external filters before internal search |

## Behavior

- Selection is a checkbox column and the bulk action appears only when rows are
  selected. After the callback, selection resets. `rowSelectable` marks a row
  ineligible: its checkbox is disabled and select-all ignores it. Selected rows
  use the blue selection wash in both the table and the mobile cards. Below
  `sm`, the bulk action moves to a fixed `SelectionBar` at the bottom edge and
  the toolbar action is hidden.
- `loading` and `error` use the shared `DataState`; the toolbar stays, the data
  region and footer are replaced.
- Columns may declare `meta.mobile` as `title`, `subtitle`, `amount`, `status`
  or `meta`. When at least one column does, a card list replaces the table
  below `sm` (640px); the library owns the card wrapper, selection and
  pagination, and renders each column's existing cell. Columns without
  `meta.mobile` stay table-only. With no such metadata the table keeps its
  horizontal scroll at every width.
- Search, sorting, visibility and pagination are local table state. A new
  externally filtered row set resets the current page.
- Column alignment is set with `meta: { align: 'end' }` for numeric columns.
- The root is `data-slot="data-table"` for stable browser-level integration.
- `ScrollTable` is a separate molecule at `@talelk/newui-molecules`; importing it does
  not import the table engine into a route that renders its own semantic table.
