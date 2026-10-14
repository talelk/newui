---
'@newui/blocks': minor
---

`@newui/blocks` — composed sections built on `@newui/ui`.

A component answers "what is this control"; a block answers "how does a page
open". The distinction is why this is a package rather than a folder inside
`@newui/ui`: a block is opinionated about layout, is meant to be replaceable
wholesale, and should not be able to move a component's budget.

Six to start, each with a demo, a contract and a live reference page on the site:

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

`List` also gains `ListHeaderCellSort` (a controlled sortable column header,
with `aria-sort` and an opacity-revealed glyph so hovering never shifts the
label) and `ListGroup` (`role="rowgroup"`, optional sticky label), both of which
the recipes need.

The sites's `check-css` gate now scans `packages/blocks` as well — Tailwind's
`@source` did not, so every block rendered with only inherited styling until a
screenshot showed the stat grid stacked one per row.
