# @talelk/newui-templates

## 1.1.1

### Patch Changes

- b60e321: Documentation and strategy batch: `spec/pages.md` becomes the Pages rung's
  contract (responsiveness, a11y, coherence, state coverage, determinism and
  budgets — every clause backed by an existing gate), ADR-0014 settles
  PRODUCT.md's open success-metric question as four evidence-backed questions
  reviewed at the one-year mark, and ADR-0015 fixes the editor packages'
  positioning: their props are contracts, the engines stay optional, and the
  verification floor now includes browser-tier tests for both.
- d2060b8: The templates package now owns the contracts `spec/kit.md` promises for it.
  `AppShell` gains in-package coverage for the drawer close control, the one-`h1`
  rule, footer ordering, desktop fold (uncontrolled and controlled via
  `collapsed`/`onCollapsedChange`) and header actions. `AuthLayout` gains
  contract tests for the aside panel, the header row, the brand order and the
  layout slot, and a story showing the desktop context panel.
- Updated dependencies [d2060b8]
- Updated dependencies [a332a12]
- Updated dependencies [d2060b8]
- Updated dependencies [d2060b8]
- Updated dependencies [d2060b8]
- Updated dependencies [d2060b8]
- Updated dependencies [a332a12]
- Updated dependencies [a332a12]
- Updated dependencies [a332a12]
- Updated dependencies [d2060b8]
- Updated dependencies [d2060b8]
- Updated dependencies [d2060b8]
- Updated dependencies [d2060b8]
- Updated dependencies [d2060b8]
- Updated dependencies [a332a12]
  - @talelk/newui-organisms@2.1.0
  - @talelk/newui-atoms@1.1.0
  - @talelk/newui-molecules@2.1.0

## 1.1.0

### Minor Changes

- dad472a: The application sidebar's fold becomes chrome instead of a menu row: `Collapse`
  sits at the end of the identity block and the rail repeats an `Expand` control
  under the tenant, so the footer is free for settings and account. `AppSidebar`
  now binds `⌘B`/`Ctrl+B` like the bare `Sidebar`, and its trigger tooltip only
  advertises the shortcut when it is real.
  
  `AppShell` and `AppSidebar` accept a `utilities` slot, rendered above Settings
  while the sidebar is expanded, and a compact `utilitiesCollapsed` form so a
  global control such as the theme switch does not disappear in the rail. Group
  labels drop to 12px Ink Muted, active rows gain weight and a tinted count, and
  counts join the collapsed tooltip. The mobile drawer pins its close control in
  a 40px header, keeps the navigation list as the only scroller, and uses an
  opaque surface in dark mode.
  
  The page heading and its actions now share one row; breadcrumbs sit above them.

### Patch Changes

- 8710ce8: Application coherence pass across the twelve example applications.
  
  - **Atoms:** checked/indeterminate Checkbox now paints a semantic check icon that
    is legible in both themes and disabled states; Switch thumbs contrast against
    both track states; required markers use a passing red step; disabled solid
    blue actions use the neutral disabled treatment; Password keeps its visual
    size with a larger coarse-pointer hit area.
  - **Molecules:** Card descriptions use the interface type role; `ListRow` only
    advertises pointer/hover when it is actionable; TabButtons fluid tracks can
    shrink at 320/150%; editor mention surfaces use the overlay radius; a
    controlled DateRangePicker holds the first click as a draft until the range
    completes.
  - **Organisms:** DataTable gains `cardBreakpoint`, a stable titled toolbar,
    humanized column labels, compact mobile paging, guarded external empty
    actions, a bottom spacer for the sticky selection bar, and selection only
    when a bulk action exists; Section gains explicit accessible naming; DataState
    accepts an empty-state icon; SettingsDialog has stable desktop width, true
    mobile full-bleed, 40px mobile nav/close, an accessible tablist label and
    logical RTL borders; AuthCard is card-only and flat; KanbanBoard restores
    focus after keyboard moves, uses 40px touch targets below `lg`, and fits four
    columns at 1440; PageToolbar uses an ellipsis menu, icons on secondary
    actions and the section scale for nested headings; FilterBar selects are
    two-up from 360px; StatGrid compact is four-up at `md`.
  - **Templates:** AppShell's mobile menu trigger is 40px.
  - **Charts:** ChartLegend renders static text when it has no handler; NumberCard
    titles wrap under text zoom and its loading state reserves card geometry;
    time-axis labels format the numeric timestamp ECharts passes, so monthly
    plots keep their month ticks; axis charts reserve the label band.
  - **Editor:** toolbar and mention surfaces follow the card/overlay radius scale.
  
  Existing props remain valid; the new state and layout props are additive.
- Updated dependencies [dad472a]
- Updated dependencies [8710ce8]
- Updated dependencies [dad472a]
- Updated dependencies [dad472a]
- Updated dependencies [dad472a]
- Updated dependencies [dad472a]
- Updated dependencies [3355988]
- Updated dependencies [dad472a]
  - @talelk/newui-organisms@2.0.0
  - @talelk/newui-atoms@1.0.1
  - @talelk/newui-molecules@2.0.0

## 1.0.0

### Major Changes

- 0d87bbb: Clean break to the atomic public API. The `@talelk/newui-ui`, `@talelk/newui-blocks` and
  `@talelk/newui-layouts` packages are removed; consumers import atoms, molecules,
  organisms and templates from the new package names. No compatibility barrels,
  deprecated shell adapters or legacy route redirects are shipped.
  
  `@talelk/newui-templates` now exposes exactly `AppShell`, `PaneLayout` and
  `AuthLayout`. `AppShell` owns one responsive sidebar with tenant, grouped
  navigation and pinned settings/account controls; split rail/sidebar composition
  is removed. `DataTable`, `ScrollTable` and `VirtualList` move from the logic
  package into the atomic visual packages, leaving `@talelk/newui-data` headless.
- d48ae8c: The template package now has exactly three public compositions: `AppShell`,
  `PaneLayout` and `AuthLayout`. `AppShell` replaces the intermediate `AppLayout`
  API and is the only application frame. Its one responsive sidebar owns app
  identity, tenant selection, grouped navigation, collapse-to-icons, and pinned
  settings/account actions. `PaneLayout` is an in-shell two-pane arrangement;
  `AuthLayout` is the public-access frame. There are no separate desktop/mobile
  shells or rail/sidebar pairing.
- e02769b: The final template API is a clean break from the intermediate
  `DesktopShell`/`MobileShell`/`ResponsiveShell` design. `AppShell` owns one
  responsive sidebar model: it docks and collapses to labelled icons on desktop,
  and the same expanded menu opens as a modal drawer on mobile. The brand, tenant,
  grouped destinations, settings and account actions remain in that single
  navigation surface. No separate rail, mobile-only shell or compatibility
  wrapper is exported.

### Minor Changes

- d5cc3e4: `PaneLayout` — two panes side by side, with a draggable divider.
  
  The shape a workspace reaches for the moment it has a list and a record: mail's
  conversations beside the message, a ticket queue beside the ticket, a file tree
  beside the preview. Mail was hand-rolling it with a grid, a CSS variable and a
  **slider in the toolbar** — plumbing per consumer, and the resize affordance in
  the wrong place.
  
  - **The divider is the control.** `role="separator"`, `aria-orientation`,
    `aria-valuenow/min/max` and `aria-controls`. It drags with a pointer, moves
    with the arrow keys (Shift for a coarse step), jumps to the bounds with
    Home/End, and returns to `startSize` on double-click.
  - **The value is a percentage.** The split survives a resize of the window; a
    pixel width leaves a 320px list looking like a third of a phone.
  - **One pane on a narrow viewport.** Below `compactAt` the grid is a single
    column showing `active`; the other pane leaves the accessibility tree rather
    than sitting offscreen. The app switches `active` when a record opens and
    renders its own back affordance.
  - **Arrangement, not chrome.** No borders, no background, no scroll container:
    a pane's overflow belongs to the pane, and an app's borders belong to the app.
    `--pane-start` is on the frame, so a consumer can drive the split from its own
    control too.
  - `resizable={false}` renders no control at all — nothing in the tab order and
    nothing to drag, which is the honest rendering of a split that does not move.

### Patch Changes

- ba4540f: Stacking and motion become named scales from `@talelk/newui-tokens`: `z-raised`,
  `z-floating`, `z-overlay`, `z-top`, `duration-fast/base/slow` and
  `ease-standard` resolve `@theme` variables instead of components hard-coding
  `z-50`, `z-[100]` and numeric durations. Computed values are unchanged. The
  disclosure chevron keeps its literal 200ms, paired with the
  `disclosure-panel` utility's timing.
- Updated dependencies [6fda044]
- Updated dependencies [436c6ec]
- Updated dependencies [0d87bbb]
- Updated dependencies [436c6ec]
- Updated dependencies [02c12c3]
- Updated dependencies [ffeac69]
- Updated dependencies [04c3629]
- Updated dependencies [6fda044]
- Updated dependencies [4b90ba3]
- Updated dependencies [09d4eda]
- Updated dependencies [436c6ec]
- Updated dependencies [0ef7c79]
- Updated dependencies [1249641]
- Updated dependencies [6fda044]
- Updated dependencies [436c6ec]
- Updated dependencies [6fda044]
- Updated dependencies [e02769b]
- Updated dependencies [04c3629]
- Updated dependencies [ca458aa]
- Updated dependencies [4a5b1fb]
- Updated dependencies [436c6ec]
- Updated dependencies [ba4540f]
- Updated dependencies [de468fe]
- Updated dependencies [7b85ab4]
  - @talelk/newui-atoms@1.0.0
  - @talelk/newui-molecules@1.0.0
  - @talelk/newui-organisms@1.0.0
