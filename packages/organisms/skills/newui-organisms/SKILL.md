---
name: newui-organisms
description: >
  Use when composing page regions with @talelk/newui-organisms — DataTable
  (search, sort, pagination, selection, column pinning, inline editing),
  AppSidebar, Sidebar, FilterBar, StatGrid, KanbanBoard, VirtualList,
  CommandPalette, DetailHeader, Section, SelectionBar, DataState, MobileNav,
  AuthCard, SettingsDialog. Use when the user asks for a data table, app
  sidebar, board, KPI grid or command palette in newui.
metadata:
  type: core
  domain: ui
  library: '@talelk/newui-organisms'
  library_version: '2.0.0'
sources:
  - talelk/newui:packages/organisms/src/organisms/DataTable/DataTable.tsx
  - talelk/newui:packages/organisms/src/organisms/AppSidebar/AppSidebar.tsx
  - talelk/newui:packages/organisms/src/organisms/DataState/DataState.tsx
  - talelk/newui:packages/organisms/src/organisms/SelectionBar/SelectionBar.tsx
  - talelk/newui:spec/data-table.md
  - talelk/newui:spec/sidebar.md
---

# newui organisms

Page regions composed from the molecules and atoms. Read the `newui` skill
for the token vocabulary first.

## Setup

```tsx no-check
import { DataTable } from '@talelk/newui-organisms'
import { createSignal } from 'solid-js'

interface Row { id: string; title: string; amount: number }

export function Ledger(props: { rows: Row[] }) {
  return (
    <DataTable
      title="Ledger"
      rows={props.rows}
      columns={[
        { accessorKey: 'id', header: 'Ref' },
        { accessorKey: 'title', header: 'Title' },
        { accessorKey: 'amount', header: 'Amount', meta: { align: 'end' } },
      ]}
      actionLabel="Export selected"
      onRowsAction={(ids) => exportRows(ids)}
    />
  )
}
```

## Core patterns

**Selection exists to feed the bulk action.** Checkboxes render only when
`onRowsAction` is set; a read table sets `selectable={false}` (or omits the
action).

**App-owned states: pinning, edits, data.** `pinnedStart`/`pinnedEnd` freeze
one column per scroll edge; pinning changes go through
`onPinnedColumnsChange` — the table never mutates it. With `editable` +
`onCellChange`, columns marked `meta.editable` render click-to-edit cells;
edits commit through the callback and the table shows whatever the next
`rows` carry. The table never mutates data itself.

**Loading, empty and error come from `DataState`, not ad-hoc markup.** Pass
`loading`, `error` + `onRetry` to `DataTable` (or wrap custom regions in
`DataState`); the shared surfaces keep the sweep's contracts.

**One sidebar model.** `AppShell` (templates) renders `AppSidebar` for you —
do not mount `Sidebar` beside it. Compose `Sidebar` directly only in pages
that are not `AppShell`-shaped.

## Common mistakes

**Don't nest AppShell and Sidebar.** Two navigation regions fail the a11y
sweep's `no-duplicate-controls` rule.

**Don't format values in editable columns' raw fields.** `meta.editable`
edits the row's raw field; the formatted `cell` render returns after commit.
Editing a formatted string would corrupt it.

**Don't build sticky columns by hand.** Pinning already carries the sticky
chrome, divider and hover/selected tint; a hand-rolled `sticky` cell will
miss the row tint and fail the visual contract.

## Completion

`pnpm verify:affected` covers the organisms suites; `spec/data-table.md` and
`spec/sidebar.md` are the contracts for the two largest regions.
