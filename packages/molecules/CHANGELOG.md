# @newui/molecules

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
- Updated dependencies [1249641]
- Updated dependencies [6fda044]
- Updated dependencies [6fda044]
- Updated dependencies [04c3629]
- Updated dependencies [4a5b1fb]
- Updated dependencies [436c6ec]
- Updated dependencies [ba4540f]
- Updated dependencies [7b85ab4]
  - @newui/atoms@1.0.0
