---
'@talelk/newui-organisms': minor
---

DataTable column operations (issue #20): the header stops being read-only chrome.

- **`columnOps`** switches each operation on separately — `resizable`,
  `reorderable`, and `menu` (default `true` whenever `columnOps` is set), so an
  app can offer resizing without reordering or a menu.
- **Resize.** `resizable` puts a `role="separator"` handle on each leaf header's
  edge with a keyboard twin: arrows nudge 8px, Shift 32px, Home/End jump to the
  column's `minSize`/`maxSize`, double click resets. Widths live in
  `columnSizing` and report through `onColumnSizingChange`; because a resize
  changes no rows it never resets the page. Per-column `size`/`minSize`/`maxSize`
  are honoured, and the selection column is chrome — fixed and not resizable.
- **Reorder.** `reorderable` makes the header draggable (4px threshold, so a
  click stays a click) and adds Move left/right to the column menu. Order is
  TanStack's `columnOrder`, controlled through `columnOrder`/`onColumnOrderChange`.
- **Multi-pin.** `pinnedStart`/`pinnedEnd` widen from `string` to
  `string | string[]`. With two or more pins on an edge each cell's sticky
  offset is composed, so pinned columns stack instead of overlapping.
- **Per-column filters.** A column with `filterable: true` gets a funnel button
  opening the control its `filterFn` needs — text box, `Select`, a min/max pair,
  or date fields. The control writes TanStack's `columnFilters`, the same array
  server mode sends to the backend, so client and server filtering stay one
  vocabulary and the column filter composes with the global search. `facets`
  supplies `{ value, count }` per column for the popover.
- **`ColumnMenu`** is the compound part behind the button (`Root`/`Trigger`/
  `Content`/`Items`): sort, pin, move, reset size and hide, keyboard-complete,
  with Move disabled rather than hidden at the ends of the order.

Two test-environment fixes came out of making the suite deterministic: the unit
config now runs `vite-plugin-solid` with `hot: false` (the `@solid-refresh`
wrapper re-ran component bodies inside a `createMemo`, tearing down a mounted
table mid-test), and keystroke coverage for the popover filter moved to the
browser project, where `userEvent.type` is reliable through a portal — the
jsdom suite drives the same control with one committed `input` event per value.
