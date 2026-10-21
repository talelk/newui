# DataTable

A collection rendered as an accessible, searchable, sortable, paginated table.

## Usage

```tsx
import { DataTable, type DataTableColumn } from '@newui/organisms'

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
| `selectable` | `boolean` | show selection and bulk actions; defaults to `true` |
| `pageSize` | `number` | initial page size; defaults to `10` |
| `recordsLabel` | `string` | noun in the footer; defaults to “records” |
| `emptyTitle` | `string` | empty-state title |
| `emptyHint` | `string` | empty-state supporting text |
| `onClearFilters` | `() => void` | clears external filters before internal search |

## Behavior

- Selection is a checkbox column and the bulk action appears only when rows are
  selected. After the callback, selection resets.
- Search, sorting, visibility and pagination are local table state. A new
  externally filtered row set resets the current page.
- Column alignment is set with `meta: { align: 'end' }` for numeric columns.
- The root is `data-slot="data-table"` for stable browser-level integration.
- `ScrollTable` is a separate molecule at `@newui/molecules`; importing it does
  not import the table engine into a route that renders its own semantic table.
