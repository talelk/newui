---
'@newui/organisms': minor
---

`@newui/organisms` is the composed page-region layer, built on atoms and
molecules. Its entries answer *what is this section?* and each has a demo,
contract and generated reference page:

- **`AppSidebar`** — the navigation sidebar a screen opens with. Every reference
  screen was repeating the same twenty lines of `SidebarHeader`/`SidebarLabel`/
  `SidebarItem`, including the header outside the scroll region and counts as a
  quiet suffix rather than a badge.
- **`PageToolbar`** — title, title menu, actions, in the pinned `PageHeader`.
- **`FilterBar`** — search, selects and the view switcher, with search leading
  and the switcher at the far end because it changes how the data is drawn rather
  than what is in it.
- **`DetailHeader`** — trail, title, status, actions, in the order a reader
  arriving from a list needs them answered.
- **`StatGrid`** — KPI cards, with a delta toned by whether it is *good* rather
  than by its direction (churn falling is good).
- **`AuthCard`** — the centred card sign-in, sign-up and reset share.
- **`KanbanBoard`** — columns of cards you drag between them. The gesture is
  pointer geometry (there is no Zag machine for a sortable board): a mouse lifts
  after 4px of travel, a touch holds for 250ms and becomes a scroll if it drifts,
  and position, hit-test and edge auto-scroll all run in one rAF loop, because a
  held pointer at the edge keeps moving the slots it is not moving over. Cards
  are reordered by FLIP, and every card also has a **Move to…** menu, so the
  board is operable without a pointer — the reference is drag-only, which puts
  reordering out of reach of a keyboard. Reordering is *previewed* and committed
  once on drop: cancelling is discarding a preview, so a controlled board never
  receives a move it did not accept.

The package also contains the sidebar, filter bar, stat grid, board, table,
virtual list and other page regions. Its dependencies point down to
`@newui/atoms` and `@newui/molecules`; optional chart/editor engines remain in
their own packages.
