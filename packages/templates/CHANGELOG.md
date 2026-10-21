# @newui/templates

## 1.0.0

### Major Changes

- 0d87bbb: Clean break to the atomic public API. The `@newui/ui`, `@newui/blocks` and
  `@newui/layouts` packages are removed; consumers import atoms, molecules,
  organisms and templates from the new package names. No compatibility barrels,
  deprecated shell adapters or legacy route redirects are shipped.
  
  `@newui/templates` now exposes exactly `AppShell`, `PaneLayout` and
  `AuthLayout`. `AppShell` owns one responsive sidebar with tenant, grouped
  navigation and pinned settings/account controls; split rail/sidebar composition
  is removed. `DataTable`, `ScrollTable` and `VirtualList` move from the logic
  package into the atomic visual packages, leaving `@newui/data` headless.
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

- ba4540f: Stacking and motion become named scales from `@newui/tokens`: `z-raised`,
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
  - @newui/atoms@1.0.0
  - @newui/molecules@1.0.0
  - @newui/organisms@1.0.0
