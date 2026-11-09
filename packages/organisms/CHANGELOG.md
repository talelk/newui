# @talelk/newui-organisms

## 2.3.0

### Minor Changes

- 73f9b95: The config-form engine (issue #30): a schema-driven form that renders itself.
  
  - **`createAppForm` grows a declarative layer** in `@talelk/newui-data/form`.
    A field map (`ui`: `FieldConfig` entries keyed by static field path) and a Standard `schema`
    drive the whole document: the schema validates the *submitted* document, so
    fields hidden by `when` are pruned before validation and issues under hidden
    paths are dropped — a field the user cannot see never blocks the submit.
    `dependsOn` compiles onto a TanStack `onChange` listener that revalidates the
    dependent field with the `dynamic` cause; `pruneHidden` (default `true`) drops
    hidden fields from the document handed to `onSubmit` — including a repeater's
    row fields, whose `when(row, values)` sees the row first. `document(values)`
    exposes that submitted document.
  - **`createAutoSave(source, { save, debounce = 800, filter?, id?, storage? })`**
    is debounced backend persistence that validates before writing. Given the
    `createAppForm` result it saves the same pruned document submit sends. With
    `id` it also keeps a local, unpruned draft under `newui.form-draft`, dropped
    after a successful autosave or submit; `hasDraft` is reactive.
  - **`Repeater`** (molecules) is a dynamic array over a `mode="array"` field —
    add/remove/copy with `maxItems`/`minItems` bounds and an optional collapse per
    row. Rows iterate with `Index`, so a removal never takes the wrong row's
    values, and structural changes revalidate from the changed index onward.
  - **`ConfigForm`** (organisms) is the rendered face: a `<form>` that renders
    every field from its field-map entry — the `FormControl` vocabulary for plain
    fields, `Repeater` for arrays, and `when` predicates for visibility, bound to
    the live form state.
  - **`FormControl`** now forwards `onBlur` on the text-like and `textarea` types,
    so a config field can mark itself touched.
- cd5e324: DataTable column operations (issue #20): the header stops being read-only chrome.
  
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
- dc948bf: Virtualized `DataTable` body per issue #21: `virtual` windows the body rows with `@tanstack/solid-virtual` while the toolbar and search stay sticky outside the scroll region and the header sticky inside it. One item per rendered row — group row, record row or detail panel — so grouping, expansion and detail rows compose without the virtualizer knowing about them; off-window rows are spacer `<tr>`s, keeping table semantics, the sticky header and pinned-column stickiness intact. `pageSize` defaults to the whole result when `virtual` is on (the window bounds the DOM, not the page); server mode keeps its page size. The scroll region is the fixed `24rem` `VirtualList` convention, passed through a new `height` prop on `ScrollTable`, and the surface is inert in card mode below `cardBreakpoint`.
- 1f9dd81: The instrument-panel look (ADR-0016): the kit retuned for people who work
  inside records all day. This is a visible change for every consumer.
  
  - **Tokens.** A hand-authored layer over the Figma export: a cool gray family
    (a Mist frame, white sheets for data, Graphite ink), the `blue` theme retuned
    to Petrol as the single accent, a solid Petrol focus ring, radius by role
    (4px controls, 6px sheets, 8px overlays) and one new semantic token,
    `surface-canvas`.
  - **Type.** IBM Plex Sans replaces Inter (self-hosted, SIL OFL), with 13px
    interface text. Its figures are tabular by default; table headers use its
    semi-condensed width. `font-stretch-*` joins the merge vocabulary.
  - **Density.** `DataTable` defaults to `density="compact"` (about 28px rows;
    `comfortable` is about 36px), and table cell spacing tightens everywhere,
    including the `Table` molecule.
  - **AppShell** paints the Mist frame and folds the page header into one compact
    band: the trail, then the title with its description and the actions.
  - **StatGrid** is one ruled strip instead of a row of cards; deltas are toned
    text.
  - **FilterBar** keeps a lone result count on the control row.
  - **Sidebar** items are 28px; the current destination is a white sheet with a
    Petrol icon; counts are plain figures.
  - **DataTable** marks the row holding keyboard focus with a Petrol edge.
  - **Checked controls are Petrol.** Switch, Checkbox, RadioGroup and Tree
    checkboxes fill with the accent when checked, instead of near-black.
  - **Menus and listboxes** use 26px rows (`listboxRow`).
  - **Charts.** `NumberCard` deltas are toned text, its title is 12px, and a new
    `bare` prop drops its border and radius so several share one ruled KPI strip.
    `ChartCard` and `NumberCard` use the compact card pad; chart titles use the
    section type.
  - **KanbanBoard** columns sit closer (12px gaps, compact board padding).
  - **AuthLayout** paints the Mist canvas.
- 08ff107: Server-mode tables, end to end (issue #18):
  
  - **Store.** `createServerTableState({ initial?, sync? })` in
    `@talelk/newui-data/query` owns the four table slices — `sorting`,
    `columnFilters`, `globalFilter`, `pagination` — as controllable signals.
    Sorting, filtering and searching reset `pageIndex` to 0; changing
    `pageSize` keeps the top row in view. `sync: true` mirrors every slice
    through `createUrlState`, so a sorted, filtered, paged table survives a
    reload and a shared link. `key(base?)` serializes the slices into a query
    key for `createCollection`.
  - **DataTable.** `server={{ total }}` switches the table from owning the
    data to trusting the app: it never sorts, filters or slices rows, hands
    the four slices through `sorting`/`columnFilters`/`globalFilter`/
    `pagination` props with `on*Change` callbacks, and keeps `getRowId` for
    stable identity. `total: -1` means unknown — Next stays enabled and the
    pager drops "of N" and page numbers. `createCollection` gained
    `keepPreviousData?: boolean` so paging does not flash an empty table.
- d1ad3e2: Sidebar and AppShell polish.
  
  - **Rail:** the Expand control heads the footer instead of taking a ruled row
    under the tenant, so the collapsed rail reads as one column of identity and
    destinations above one column of square controls.
  - **Footer:** while expanded, `settings` and `utilities` share one row.
  - **`settings` accepts a render function** (`settings={() => <SidebarItem …/>}`)
    so a `SidebarItem` renders inside the sidebar and follows the collapsed rail;
    a caller-created element kept its expanded padding and sat off-centre.
  - **Mobile drawer:** the brand row is the header, with Close at its end; the
    separate "Navigation" bar is gone and the drawer is 288px wide.
  - **Top bar (below lg):** sits on the Mist frame with a ghost menu button.
- 660a374: Table superpowers (issue #19): header groups, row grouping, aggregation and
  tree/detail rows in `DataTable`.
  
  - **Header groups.** A column definition may carry `columns`, and the header
    stacks into as many rows as the tree is deep. No new prop — the column tree
    is the API. Placeholders keep the grid aligned and are never interactive.
  - **Row grouping.** `grouping` (column ids, in order) is controllable through
    `onGroupingChange`; `groupingMode` decides whether a grouped column keeps its
    own column (`reorder`, the default) or leaves the list (`remove`), and
    `groupable: false` opts a column out. A group row is the recessed surface
    spanning the record columns: expander, the column's name, the shared value,
    the count, and the aggregated values. `renderGroupedCell` overrides it. In
    server mode `grouping` is echoed and rows arrive with `subRows` populated —
    server grouping is real rows, not synthetic ones.
  - **Aggregation.** A column declares `aggregate` as one of the eleven built-ins
    (`sum`, `count`, `min`, `max`, `extent`, `mean`, `median`, `unique`,
    `uniqueCount`, `first`, `last`) or a function over the group's records.
    `summary: 'page' | 'all'` renders the footer row over the visible page or the
    whole filtered result; `aggregates` carries server-computed totals instead.
  - **Tree and detail.** `getSubRows` gives a row children of the same shape,
    `renderDetail` gives any row a panel beneath it, and `onRowExpand` fires the
    moment a row opens — where a server page fetches children it has not sent.
    `filterFromLeafRows` filters a tree from its leaves, so a parent survives on
    a descendant's match.
  - **Interactions.** Grouped and detail rows follow the active `density`; below
    the card breakpoint a group becomes a section header and its records stay
    flat cards (cards never nest). `rowSelectable` gates parents, select-all
    skips what is ineligible, and the bulk action receives record ids even for a
    tree row selected under a parent that is not itself selectable.
- d376d92: New `WidgetGrid` organism: a tiling dashboard with header drag, corner resize,
  12-column snap and push-down reflow. The layout is one JSON document
  (`{ v: 1, widgets: { [id]: { x, y, span, rows, hidden? } } }`) that the grid
  emits through `config`/`onConfigChange` and never stores — persist it with
  `createConfigStore`. Tombstones keep undo-remove, `editable` gates every
  affordance, the resize handle is a keyboard-operable `role="separator"`, and
  below `md` the grid stacks without clobbering desktop geometry.
- 45e2721: New `Wizard` organism (issue #31): a multi-step flow over a form.
  
  - **`Wizard`** composes `Stepper` for progress and `ConfigForm`'s renderer for
    the fields, and adds the three things every multi-step page was writing by
    hand: the gate between steps, the review that closes the flow, and the state
    that survives a closed tab. A step is `{ id, label, description?, validate?, content }`,
    where `content` is the step's own JSX or an array of named `FieldConfig`
    entries — so the same `ui` map feeds `createAppForm` and the steps, and a step
    takes the slice it owns by name.
  - **The gate is per step.** `validate` runs when the user tries to leave a step
    forward, never while they type and never for a step they have not reached. It
    returns messages for the step, or a map from field path to message that lands
    on that field's own `error` — the wizard never runs the form's own validators,
    because running them would mark every field in the document and arrive at an
    unreached step already red. Back is never gated, and the stepper stays
    `linear`, so the only way forward is through the gate.
  - **`review`** appends a generated read-only summary of every declared field,
    grouped by step and skipping anything hidden by `when`.
  - **`resume`** remembers `{ step, values }` in a `createConfigStore` document
    under `newui.wizard`, restoring both on the next visit and deleting the
    document when `onSubmit` lands. This is not autosave: `onSubmit` stays the
    save path.
  - `currentStep` / `onCurrentStepChange` make the step controllable, and
    `spec/stepper.md` now points here for flows that have a form behind the steps.

### Patch Changes

- 0e03e74: `DataTable` loads its per-column filter popover (and the `NumberInput`,
  `Popover` and `Select` it renders) lazily, the first time a filterable header
  renders: tables without filterable columns no longer bundle it.
- 36329f4: Record sheets, settings rows and open fixes.
  
  - **`Dialog.Content position="end"`** — a full-height side sheet on the
    inline-end edge: it scrolls as one region, `Dialog.Footer` pins to its bottom
    edge, and it slides in from that edge (`animate-sheet-in`, mirrored for RTL).
    For reading or editing a record beside the list it came from.
  - **SettingsDialog rows** are a ruled two-column grid with a fixed control
    track that text fields fill; switches keep their size at its end.
  - **WidgetGrid** bodies that overflow become focusable regions, named for their
    widget (axe `scrollable-region-focusable`); short bodies add no tab stop.
  - **Merge:** bare side and corner radii (`rounded-t`, `rounded-ss`, …) now
    override their numbered steps in `cn()`, as `rounded` already did.
  - **DataTable** shows its empty state in the card column below the card
    breakpoint, where the table is hidden — an emptied view on a phone showed
    nothing. Its inline edit, sort, column-menu and expander controls (and the
    Password reveal toggle) use the control radius.
- Updated dependencies [73f9b95]
- Updated dependencies [dc948bf]
- Updated dependencies [1f9dd81]
- Updated dependencies [36329f4]
  - @talelk/newui-molecules@2.4.0
  - @talelk/newui-atoms@1.4.0

## 2.2.0

### Minor Changes

- 80fcde4: Design-system polish sweep: exhaustive, tokenized foundations (motion, radius roles, density, z-layer scale, dark elevation) now consumed consistently across atoms, molecules, organisms, templates, charts and editors via shared `control-styles` recipes instead of per-component one-offs. New props in existing vocabulary: `NumberInput`/`PinInput` gain `size`/`variant`, `Dropdown` gains `disabled`, `IconButton` gains `loading`. `Button` loading no longer sets the native `disabled` attribute. Renames/removals: the `data-color` hook becomes `data-theme`, and `KanbanTone` drops the unused `violet` value. The playground and starter screens adopt the same foundations.

### Patch Changes

- Updated dependencies [80fcde4]
  - @talelk/newui-atoms@1.3.0
  - @talelk/newui-molecules@2.3.0

## 2.1.3

### Patch Changes

- bd8dd18: Polish compact UI geometry: keep KPI labels and targets readable on narrow screens, align metric loading states with their ready content, add a mobile Kanban scroll cue, and keep keyboard shortcut symbols at the caption size floor.
- Updated dependencies [bd8dd18]
  - @talelk/newui-atoms@1.2.1
  - @talelk/newui-molecules@2.2.2

## 2.1.2

### Patch Changes

- Updated dependencies [e0095e2]
  - @talelk/newui-molecules@2.2.1

## 2.1.1

### Patch Changes

- 538d5d2: DataTable's card view shows the bulk-select row only once a selection exists: at zero it was a lone checkbox beside "0 selected".
- Updated dependencies [538d5d2]
- Updated dependencies [538d5d2]
- Updated dependencies [538d5d2]
- Updated dependencies [538d5d2]
- Updated dependencies [538d5d2]
- Updated dependencies [538d5d2]
  - @talelk/newui-molecules@2.2.0
  - @talelk/newui-atoms@1.2.0

## 2.1.0

### Minor Changes

- d2060b8: `DataTable` grows the two powers a business table keeps reaching for. **Column
  pinning**: freeze one column to each edge of the horizontal scroll
  (`pinnedStart` — the identifier that must stay visible; `pinnedEnd` —
  typically the actions) with sticky, opaque, row-tinted cells; pinning state is
  app-owned via `onPinnedColumnsChange`. **Inline editing**: with `editable` and
  `onCellChange`, columns marked `meta.editable` render click-to-edit cells —
  Enter or blur commits the raw field through the app, Escape cancels, and the
  cell shows the app-owned value from the next `rows`.

### Patch Changes

- d2060b8: Every organism now carries a dedicated axe accessibility suite in both of its
  rendered states (twelve new `*.a11y.test.tsx` files, from `AppSidebar` to
  `VirtualList`), and the package's export pin lists the whole public surface
  (`DataState`, `Section`, `SelectionBar` were unpinned). No axe rule beyond the
  two baseline suppressions was disabled anywhere; no violations surfaced.
- Updated dependencies [a332a12]
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
  - @talelk/newui-atoms@1.1.0
  - @talelk/newui-molecules@2.1.0

## 2.0.0

### Major Changes

- dad472a: `DataTable` gains `rowSelectable`, which disables selection for ineligible rows
  and makes select-all skip them, and mobile cards driven by `meta.mobile` on
  column definitions. When any column declares `mobile`, rows render as cards
  below `sm`; the library owns the card, selection and pagination, and the column
  cell renders unchanged. With no mobile metadata the table keeps its existing
  horizontal-scroll behaviour.
  
  `FilterBar`'s `tabs` config now requires `label`, forwarded to the segmented
  radiogroup. This is a breaking prop change for every FilterBar with a view
  switcher.
  
  `StatGrid` gains `compact`, which drops the icon tile, uses 10px card padding
  and a 4px gap for table-led screens, and moves to a two-up grid from 360px.
  `DataTable` gains `caption` for page context beside Search.

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
- dad472a: Add the shared region and state foundation: `Section` (header, toolbar, body,
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

### Patch Changes

- Updated dependencies [8710ce8]
- Updated dependencies [dad472a]
- Updated dependencies [dad472a]
- Updated dependencies [3355988]
- Updated dependencies [dad472a]
  - @talelk/newui-atoms@1.0.1
  - @talelk/newui-molecules@2.0.0

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
- 0d87bbb: Clean break to the atomic public API. The `@talelk/newui-ui`, `@talelk/newui-blocks` and
  `@talelk/newui-layouts` packages are removed; consumers import atoms, molecules,
  organisms and templates from the new package names. No compatibility barrels,
  deprecated shell adapters or legacy route redirects are shipped.
  
  `@talelk/newui-templates` now exposes exactly `AppShell`, `PaneLayout` and
  `AuthLayout`. `AppShell` owns one responsive sidebar with tenant, grouped
  navigation and pinned settings/account controls; split rail/sidebar composition
  is removed. `DataTable`, `ScrollTable` and `VirtualList` move from the logic
  package into the atomic visual packages, leaving `@talelk/newui-data` headless.
- 436c6ec: Remove the dead `PageToolbarTab` type export. It was exported from
  `PageToolbar` but never used by the component (tabs are composed with
  `Tabs`/`TabButtons` from `@talelk/newui-atoms` beside the toolbar, not through a
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
- 02c12c3: `@talelk/newui-organisms` is the composed page-region layer, built on atoms and
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
  `@talelk/newui-atoms` and `@talelk/newui-molecules`; optional chart/editor engines remain in
  their own packages.
- 6fda044: Default control sizing is now sm (28px), including buttons, text entry, selectors,
  date/time triggers, tabs, toggle groups and pagination. Explicit md remains 32px;
  checkboxes, radios and avatars retain their geometry. Consumers that require the
  previous default should pass size="md". Cards default to 12px padding; pass
  padding="md" for the previous 16px. Chart cards, editor toolbar commands and blocks use compact spacing.
  Page, section, metric and hero typography now follow 24/30, 18/24, 28/32 and
  36/40px respectively. Existing semantic colors and dialog padding are retained.
- 4b90ba3: `@talelk/newui-organisms` — the promoted table surface.
  
  ```ts
  import { DataTable, type DataTableColumn } from '@talelk/newui-organisms'
  ```
  
  The collection→table composition six example pages had converged on, moved out
  of the playground: search, sorting, pagination, column visibility, row selection
  with a bulk action and an empty state.
  
  TanStack Table is the engine and the reason the surface lives in `@talelk/newui-data`
  rather than `@talelk/newui-atoms`: a component package carrying a table engine would make
  every `Button` pay for row models. It renders with `@talelk/newui-atoms` — the single
  carve-out from the layer's headless rule, scoped to `packages/data/src/table/**`
  in the dependency rules.
  
  `ScrollTable` (the focusable scroll shell for a table wider than its column) has
  its own entry, `@talelk/newui-organisms/scroll`, so a page that renders a semantic
  table of its own does not pull the TanStack composition in: importing both from
  one entry added 20 kB to the accounting route, because rollup puts them in one
  chunk.
  
  Measured at 37.6 kB gzip on its own entry, budgeted, with a `forbid` list that
  proves it drags no dialog, chart or editor with it. `data-slot` is now
  `data-table` (it was `example-data-table` while it lived in the playground).
- 09d4eda: `@talelk/newui-organisms` — the bounded list.
  
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
  
  With this, all four TanStack adapters are behind `@talelk/newui-data`: Query, Form,
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
- ffeac69: `@talelk/newui-organisms` stops exporting the Kanban board's drag engine.
  
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
- ba4540f: Stacking and motion become named scales from `@talelk/newui-tokens`: `z-raised`,
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
  - @talelk/newui-atoms@1.0.0
  - @talelk/newui-molecules@1.0.0
