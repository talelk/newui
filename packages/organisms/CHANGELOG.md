# @newui/organisms

## 1.0.0

### Major Changes

- 6fda044: Adopt compact analytics styling: 32px default controls, outlined text entry,
  6px control corners, border-led cards and role typography. Style NumberCard,
  clarify dark chart palettes, and align block controls with the shared defaults.
  See spec/migrations.md for explicit props that retain previous defaults.
  
  Chart engines are registered by their wrapper. Raw ChartBase/useChart consumers
  register their own mark and coordinate-system modules through ECharts core.
  
  Typography utilities retain their names and use rem sizes so user text scaling
  is respected. Controls, badges and metrics reflow instead of clipping enlarged
  labels. All input families share Field help/error wiring without remounting
  uncontrolled state when validation appears. Settings tabs support vertical
  arrow, Home and End navigation.
- 0d87bbb: Clean break to the atomic public API. The `@newui/ui`, `@newui/blocks` and
  `@newui/layouts` packages are removed; consumers import atoms, molecules,
  organisms and templates from the new package names. No compatibility barrels,
  deprecated shell adapters or legacy route redirects are shipped.
  
  `@newui/templates` now exposes exactly `AppShell`, `PaneLayout` and
  `AuthLayout`. `AppShell` owns one responsive sidebar with tenant, grouped
  navigation and pinned settings/account controls; split rail/sidebar composition
  is removed. `DataTable`, `ScrollTable` and `VirtualList` move from the logic
  package into the atomic visual packages, leaving `@newui/data` headless.
- 436c6ec: Remove the dead `PageToolbarTab` type export. It was exported from
  `PageToolbar` but never used by the component (tabs are composed with
  `Tabs`/`TabButtons` from `@newui/atoms` beside the toolbar, not through a
  toolbar prop) and had no consumers. This is a breaking change only for
  code importing the unused type; delete the import.
- e02769b: The final template API is a clean break from the intermediate
  `DesktopShell`/`MobileShell`/`ResponsiveShell` design. `AppShell` owns one
  responsive sidebar model: it docks and collapses to labelled icons on desktop,
  and the same expanded menu opens as a modal drawer on mobile. The brand, tenant,
  grouped destinations, settings and account actions remain in that single
  navigation surface. No separate rail, mobile-only shell or compatibility
  wrapper is exported.

### Minor Changes

- 436c6ec: `AppSidebar` can fold. It now forwards the sidebar's collapse state —
  `collapsible`, `collapsed`, `onCollapsedChange` and `collapsedWidth` — and
  renders the frappe-shaped `SidebarCollapseToggle` at its foot (below the
  scroll region, dropped when `collapsible={false}`). Previously the block
  rendered a bare `Sidebar` with no visible fold control: ⌘B worked, but
  nothing on screen said so. Items without an `icon` fold to a tooltip-only
  row, as `SidebarItem` already specifies.
- 02c12c3: `@newui/organisms` is the composed page-region layer, built on atoms and
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
- 6fda044: Default control sizing is now sm (28px), including buttons, text entry, selectors,
  date/time triggers, tabs, toggle groups and pagination. Explicit md remains 32px;
  checkboxes, radios and avatars retain their geometry. Consumers that require the
  previous default should pass size="md". Cards default to 12px padding; pass
  padding="md" for the previous 16px. Chart cards, editor toolbar commands and blocks use compact spacing.
  Page, section, metric and hero typography now follow 24/30, 18/24, 28/32 and
  36/40px respectively. Existing semantic colors and dialog padding are retained.
- 4b90ba3: `@newui/organisms` — the promoted table surface.
  
  ```ts
  import { DataTable, type DataTableColumn } from '@newui/organisms'
  ```
  
  The collection→table composition six example pages had converged on, moved out
  of the playground: search, sorting, pagination, column visibility, row selection
  with a bulk action and an empty state.
  
  TanStack Table is the engine and the reason the surface lives in `@newui/data`
  rather than `@newui/atoms`: a component package carrying a table engine would make
  every `Button` pay for row models. It renders with `@newui/atoms` — the single
  carve-out from the layer's headless rule, scoped to `packages/data/src/table/**`
  in the dependency rules.
  
  `ScrollTable` (the focusable scroll shell for a table wider than its column) has
  its own entry, `@newui/organisms/scroll`, so a page that renders a semantic
  table of its own does not pull the TanStack composition in: importing both from
  one entry added 20 kB to the accounting route, because rollup puts them in one
  chunk.
  
  Measured at 37.6 kB gzip on its own entry, budgeted, with a `forbid` list that
  proves it drags no dialog, chart or editor with it. `data-slot` is now
  `data-table` (it was `example-data-table` while it lived in the playground).
- 09d4eda: `@newui/organisms` — the bounded list.
  
  ```tsx
  <VirtualList label="Task activity" items={rows} itemSize={72} height="440px">
    {(row) => <Row row={row} />}
  </VirtualList>
  ```
  
  A thousand-row feed does not need a thousand nodes: this keeps about a
  viewport's worth mounted and positions them. Fixed `itemSize` by design (a
  virtualiser that measures every row defeats the point), a focusable scroll
  region (WCAG 2.1.1, the same contract as `ScrollArea`), and `aria-posinset` /
  `aria-setsize` on each row so assistive tech knows the list's real length.
  
  It renders only the region, the list and the positioned rows — the row's
  anatomy and the card around it stay with the page, as the task activity stream
  shows. 20 kB gzip on its own budgeted entry.
  
  With this, all four TanStack adapters are behind `@newui/data`: Query, Form,
  Table and Virtual. The playground no longer depends on any of them directly.
- 436c6ec: `FilterBar` gains the active-filter row: optional `chips` (active filters
  restated as removable pills), `resultCount` (stated under the bar and announced
  politely), and `onClearAll` (a "Clear all" button shown only while a filter is
  active; the caller resets its own state). The bar now sits on one quiet
  surface, filled selects take the filled `subtle` surface, and the search box
  honours the `/` hint it draws. `AppSidebar` counts become quiet tabular pills,
  and `PageToolbar` sets its title at the `text-heading` scale.
- 436c6ec: Sidebar family reaches frappe-ui parity. `SidebarItem` gains `route`/`href`
  link rendering (route wins, `onClick` still fires for router interception) and marks the active row with
  `aria-current="page"`. `SidebarItem` gains an `icon` prop (used when
  `prefix` is unset), derives its collapsed tooltip label from string
  children, and renders `suffix` beside the link instead of inside it, so a
  menu button there is valid HTML. `SidebarSection` can be controlled via
  `collapsed`/`onCollapsedChange`. `SidebarCard` actions receive
  `{ dismiss }`. `AppSidebar` items pass `route`/`href` through.

### Patch Changes

- 436c6ec: `AuthCard` now sits on a card surface: the centred column gains
  `bg-surface-elevation-1`, a one-step border, `rounded-6`, `shadow-sm` and
  `p-6` padding over the plain page background, and the description and footer
  move to `text-ink-gray-7`. Visual change only; no API delta.
- ffeac69: `@newui/organisms` stops exporting the Kanban board's drag engine.
  
  `export *` from `KanbanBoard/index.ts` made `createKanbanDrag` and six tuning
  constants (`EDGE_SPEED`, `LIFT_DELAY`, `SETTLE_MS`, …) public API, so changing a
  threshold was a breaking release. The barrel now exports the block,
  `placeKanbanItem` (documented in `spec/kanban-board.md`) and the types consumers
  use (`KanbanColumn`, `KanbanMove`, `KanbanTone`, `KanbanBoardProps`). The
  board's own tests import the drag module directly, which is where an internal
  belongs.
  
  Found by `packages/organisms/src/exports.test.ts`, which pins the composed
  layer's surface by name alongside the other atomic package export tests.
- 6fda044: Refresh workspace dependencies to current stable releases. The Vite integration
  now requires Vite ^8.3.4. Consumer runtime dependencies, Solid development
  versions and Tailwind tooling are updated together; application examples migrate
  to TanStack Table 9. Type checking uses TypeScript 7, with Microsoft's TypeScript 6
  compatibility API retained for ESLint. Tests use Vitest 5 and Playwright 1.64.1.
  
  Keep visible labels in accessible names for calendar view controls and example
  actions; treat custom navigation avatars as decorative beside their labels.
  The updated axe checks stay enabled.
- ca458aa: `Select` single mode (the default) takes `value: string | null` and reports
  `onValueChange` with a scalar, matching `Combobox`; `multiple` keeps the
  `string[]` contract. `FormControl`'s `type="select"` follows the same split.
  `FilterBar` selects pass scalars instead of wrapping values in arrays. See
  `spec/migrations.md`.
- ba4540f: Stacking and motion become named scales from `@newui/tokens`: `z-raised`,
  `z-floating`, `z-overlay`, `z-top`, `duration-fast/base/slow` and
  `ease-standard` resolve `@theme` variables instead of components hard-coding
  `z-50`, `z-[100]` and numeric durations. Computed values are unchanged. The
  disclosure chevron keeps its literal 200ms, paired with the
  `disclosure-panel` utility's timing.
- Updated dependencies [6fda044]
- Updated dependencies [0d87bbb]
- Updated dependencies [04c3629]
- Updated dependencies [6fda044]
- Updated dependencies [0ef7c79]
- Updated dependencies [1249641]
- Updated dependencies [6fda044]
- Updated dependencies [6fda044]
- Updated dependencies [04c3629]
- Updated dependencies [ca458aa]
- Updated dependencies [4a5b1fb]
- Updated dependencies [436c6ec]
- Updated dependencies [ba4540f]
- Updated dependencies [de468fe]
- Updated dependencies [7b85ab4]
  - @newui/atoms@1.0.0
  - @newui/molecules@1.0.0
