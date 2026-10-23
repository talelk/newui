---
'@talelk/newui-organisms': minor
---

Add the shared region and state foundation: `Section` (header, toolbar, body,
footer, heading level, density), `DataState` (ready/loading/empty/error using
the existing `Skeleton` and `EmptyState`), and `SelectionBar` (inline or sticky
mobile bulk actions).

Data organisms adopt it:

- `DataTable`: `loading`, `error`, `onRetry`, `density`, `selectionSummary`;
  shared empty/loading/error states; sticky mobile `SelectionBar`; sticky header.
- `VirtualList`: `loading`, `error`, `onRetry` and empty-state props.
- `KanbanBoard`: `loading`, `error`, `onRetry` and a board empty state.
- `StatGrid`: `loading` skeletons.
- `FilterBar`: `variant="bare"` and start-aligned tabs when there is no search
  or select.
- `PageToolbar`: semantic `headingLevel`, secondary actions, loading/disabled
  actions; the primary no longer implies a `+`.
- `DetailHeader`: `headingLevel`; the title wraps instead of clipping.
- `SettingsDialog`: visible close control.
- `AuthCard`: form-level `error` summary.
- `CommandPalette`: `loading` state.
- `MobileNav`: active item wash.

Existing props remain valid; the new state and region props are additive.
