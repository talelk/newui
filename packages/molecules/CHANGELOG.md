# @talelk/newui-molecules

## 2.2.1

### Patch Changes

- e0095e2: Toast: the close button works, stacked toasts lift instead of overlapping, and in-place updates (promise loading → success) re-render in the same node. Root causes: the region keyed items by record reference (the store re-syncs fresh objects constantly, remounting each item's machine mid-click), placement depended on group heights without a tracked read, and the placement transform consuming Zag's `--y`/`--x` variables was never written.

## 2.2.0

### Minor Changes

- 538d5d2: New `FileCard` molecule: one file as a tile — type icon, name, meta line, optional badge, selection state and app-owned `suffix` actions. Keep the open action and the actions apart: a button card must not carry `suffix`.
- 538d5d2: New `MessageListItem` molecule: one conversation row — sender, subject, one-line preview, time, avatar, unread and selected states. Unread is carried by text weight and a dot, never colour alone.
- 538d5d2: New `NotificationItem` molecule: one notification row — event icon, title, description, time, unread and selected states, with app-owned `suffix` controls.
- 538d5d2: New `ThreadRow` molecule: one discussion thread row — title, preview, reply/participant meta, time, avatar, unread and selected states.
- 538d5d2: `ToastRegion` publishes its `ToastRegionProps`, so the Toaster family appears in the API tables, the site registry and ⌘K. No runtime behavior change.

### Patch Changes

- Updated dependencies [538d5d2]
  - @talelk/newui-atoms@1.2.0

## 2.1.0

### Minor Changes

- d2060b8: New `Calendar` molecule: the pickers' date grid exported as a standalone,
  always-open component — the booking-panel and filter-rail surface that needs a
  date but no input. Values are `YYYY-MM-DD` strings (ADR-0008), `min`/`max`
  bound the selectable window, `dualPane` shows two months, and the Zag machine
  keeps the grid's full keyboard model.
- d2060b8: New `Carousel` molecule, promoted from the `/kit/recipes` carousel example
  through the kit's recipes-to-API gate. A scroll-snap strip: native scrolling
  stays the interaction (touch, trackpad, arrow keys, RTL), the index follows
  where the scroll settles, and `Carousel.Viewport`/`Slide`/`Previous`/`Next`/
  `Status` compose the controls. Autoplay is opt-in, pauses under the pointer
  or focus, and never runs under `prefers-reduced-motion`. The recipe remains
  in the gallery as the themed composition.
- d2060b8: New `ColorPicker` molecule: the platform color picker under a styled swatch
  with an optional hex field (`#rgb` and `#rrggbb`, normalized, invalid drafts
  flagged without committing). Deliberately no custom hue surface — the native
  control carries the keyboard and screen-reader behavior on every platform,
  which a custom one would have to reimplement.
- d2060b8: The `List` family forwards rest props: `ListRow`, `ListCell` and
  `ListHeaderCellSort` now accept (and type) the full set of div attributes, so
  the caller's table contract can reach them — `role="table"` on the wrapper,
  `role="row"`/`role="cell"` on rows and cells, and `role="columnheader"` on a
  sortable header, which is also what makes its `aria-sort` legal. Previously
  that composition was impossible from outside and axe flagged the bare
  `aria-sort` div as an `aria-allowed-attr` violation.
- d2060b8: New `PinInput` molecule: a fixed-length verification code on the Zag pin-input
  machine. One focus walks every cell — typing advances, paste splits, arrows
  and backspace move between cells. `length` sets the shape, `otp` advertises
  `autocomplete="one-time-code"` autofill, `mask` turns the cells into password
  boxes, and the shared labelling contract (`label`/`description`/`error`/
  `required`) names every cell. `onValueComplete` fires when the code is whole.
- d2060b8: New `TimeRangePicker` molecule: two `TimePicker`s under one field label,
  reporting a single `[from, to]` value (or `[]` while empty). Picking the start
  holds a half-open range like the `DateRangePicker`'s draft, and a range that
  ends before it starts — a night shift — is reported as-is rather than
  reordered.
- d2060b8: New `TransferList` molecule: a dual-list picker for assigning, segmenting and
  permission screens. Check rows on either side and move them with the chevron
  buttons between the panels; double chevrons move everything. Rows are
  checkboxes (natively keyboard-accessible), legends carry live counts, and the
  optional `search` filters both lists with one query.

### Patch Changes

- d2060b8: Twenty-one molecules gained dedicated axe accessibility suites (every molecule
  now has one), and the export pin lists the whole public surface — the `Toast`
  family's runtime names (`Toaster`, `ToastRegion`, `toast`, `toaster`,
  `createToaster`) plus `Stepper` and `TagInput` were unpinned.
- Updated dependencies [a332a12]
- Updated dependencies [a332a12]
- Updated dependencies [a332a12]
- Updated dependencies [a332a12]
- Updated dependencies [a332a12]
  - @talelk/newui-atoms@1.1.0

## 2.0.0

### Major Changes

- dad472a: `TabButtons` is now a radiogroup. The root is `role="radiogroup"` with a
  required `label`, each option is `role="radio"` with `aria-checked`, and the
  old `role="tablist"` / `role="tab"` / `aria-selected` semantics are gone. The
  `value` / `onValueChange` / `options` API is unchanged; code that queried tab
  roles or styled `[role="tab"]` must move to radio roles. `Tabs` remains the
  component for choices that own panels.
  
  `TabButtons` also gains `wrap`, which lays options onto multiple rows and
  replaces the sliding indicator with a variant-aware active surface.
  
  `ScrollTable` gains `stickyHeader` for long scroll regions.

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
- Updated dependencies [8710ce8]
- Updated dependencies [dad472a]
- Updated dependencies [dad472a]
- Updated dependencies [3355988]
  - @talelk/newui-atoms@1.0.1

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
- ca458aa: `Select` single mode (the default) takes `value: string | null` and reports
  `onValueChange` with a scalar, matching `Combobox`; `multiple` keeps the
  `string[]` contract. `FormControl`'s `type="select"` follows the same split.
  `FilterBar` selects pass scalars instead of wrapping values in arrays. See
  `spec/migrations.md`.

### Minor Changes

- 04c3629: `CommandPalette`, and a sidebar that folds.
  
  **`CommandPalette`** — ⌘K, a query, and a list of things you can do: pages,
  components, actions, with a shortcut hint per row. Items self-register, so
  groups and items are plain JSX at any nesting while the keyboard walks one flat,
  filtered list across all of them. The dialog is Zag's machine (focus trap,
  Escape, backdrop, scroll lock); the list is *not* a listbox machine — a listbox
  collection is built once from a static set of items and a palette is rebuilt on
  every keystroke, so the highlight is ours, expressed with
  `aria-activedescendant`, which is what keeps focus in the field while the arrows
  move. The first usable item is highlighted (open and press Enter), disabled items
  are visible but stepped over, matching covers hidden keywords and ranks a prefix
  above a substring, and group headings drop away while you search.
  
  **`Sidebar`** grows three parts:
  
  - **`SidebarSearch`** — the filter above the groups. It hides itself while the
    sidebar is a rail: there is nowhere to type into 3rem.
  - **`SidebarTrigger`** — the compact fold control, with ⌘B / Ctrl+B bound by the
    sidebar itself (`shortcut={false}` opts out).
  - **`SidebarItem`** now shows a real tooltip while collapsed instead of a `title`
    attribute. A rail of bare icons is unusable without one, and `title` takes a
    second to appear and cannot be styled.
  
  The site adopts all of it: the sidebar folds to a rail (remembered, and by ⌘B)
  with section icons, and ⌘K opens the palette over every page, component and
  action. The sidebar itself stays markup — the shell renders on every route, so
  the parts it uses are paid for by the home page (`routes.test.ts` pins that),
  which is why the two share a design rather than an implementation.
- 6fda044: Default control sizing is now sm (28px), including buttons, text entry, selectors,
  date/time triggers, tabs, toggle groups and pagination. Explicit md remains 32px;
  checkboxes, radios and avatars retain their geometry. Consumers that require the
  previous default should pass size="md". Cards default to 12px padding; pass
  padding="md" for the previous 16px. Chart cards, editor toolbar commands and blocks use compact spacing.
  Page, section, metric and hero typography now follow 24/30, 18/24, 28/32 and
  36/40px respectively. Existing semantic colors and dialog padding are retained.
- 0ef7c79: FormControl routes `type="time"` to `TimePicker` and `type="datetime-local"` to
  `DateTimePicker` instead of native inputs. `datetime-local` leaves the
  `FormControlTextType` union, so its props move from the native `value`/`onInput`
  contract to the picker's `value: string | null` + `onValueChange`. Add the two
  new rows to the form spec's routed-types table.
- 6fda044: Support BottomSheet drag dismissal with scroll handling, cancellation,
  non-dismissible sheets and reduced motion. Load CodeEditor grammars on demand
  while preserving edits and ignoring stale language requests after changes or
  unmounting.
  
  Expose paragraph, link editing and undo/redo in EditorToolbar. Disable formatting
  for readonly editors and history actions when their operation is unavailable.
- 4a5b1fb: New semantic `Table` molecule: `Table`, `TableHead`, `TableBody`, `TableRow`
  (with `selected` ⇒ `data-selected`), `TableColumnHeader` and `TableCell` style
  the native elements for known, directly-rendered data. `ScrollTable` composes
  the same shared header class from `control-styles`, so the two cannot drift.
  `ScrollTable`'s root and head gain `data-slot` hooks.
- 436c6ec: Sidebar family reaches frappe-ui parity. `SidebarItem` gains `route`/`href`
  link rendering (route wins, `onClick` still fires for router interception) and marks the active row with
  `aria-current="page"`. `SidebarItem` gains an `icon` prop (used when
  `prefix` is unset), derives its collapsed tooltip label from string
  children, and renders `suffix` beside the link instead of inside it, so a
  menu button there is valid HTML. `SidebarSection` can be controlled via
  `collapsed`/`onCollapsedChange`. `SidebarCard` actions receive
  `{ dismiss }`. `AppSidebar` items pass `route`/`href` through.
- de468fe: New `Stepper` molecule: an ordered wizard-progress list in a named navigation
  landmark. Markers read done/current/upcoming; `linear` (the default) keeps
  future steps unreachable, `linear={false}` turns it into a free progress
  overview. Clicking a reachable step reports its `value`. See
  `spec/stepper.md`.

### Patch Changes

- 6fda044: Refresh workspace dependencies to current stable releases. The Vite integration
  now requires Vite ^8.3.4. Consumer runtime dependencies, Solid development
  versions and Tailwind tooling are updated together; application examples migrate
  to TanStack Table 9. Type checking uses TypeScript 7, with Microsoft's TypeScript 6
  compatibility API retained for ESLint. Tests use Vitest 5 and Playwright 1.64.1.
  
  Keep visible labels in accessible names for calendar view controls and example
  actions; treat custom navigation avatars as decorative beside their labels.
  The updated axe checks stay enabled.
- 04c3629: `ScrollArea`'s scrollbar is an overlay, and it knows when to leave.
  
  It used to paint a permanent 8px `bg-surface-gray-2` gutter — a gray strip down
  the side of a sidebar, and one between every pair of board columns, on surfaces
  with nothing to scroll. Three things were wrong with it:
  
  - **It showed when there was nothing to scroll.** The machine already reports the
    axis (`data-overflow-x` / `data-overflow-y`); the bar now hides itself when it
    is `false`.
  - **It reserved space.** The track is transparent and the same width it always
    was, so content reaches the edge instead of stopping short of a gutter.
  - **It took clicks.** The track was interactive across its whole 10px, and an
    invisible thumb parked over the top corner. The track is now
    `pointer-events-none`, and only a *visible* thumb accepts a drag.
  
  The thumb fades in on pointer hover, while scrolling, and while dragging, with a
  150ms transition either way.
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
- Updated dependencies [1249641]
- Updated dependencies [6fda044]
- Updated dependencies [6fda044]
- Updated dependencies [04c3629]
- Updated dependencies [4a5b1fb]
- Updated dependencies [436c6ec]
- Updated dependencies [ba4540f]
- Updated dependencies [7b85ab4]
  - @talelk/newui-atoms@1.0.0
