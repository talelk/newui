# @talelk/newui-atoms

This history predates the atomic package split. New atoms are released under
`@talelk/newui-atoms`; molecules and page regions are now separate packages.

## 1.1.0

### Minor Changes

- a332a12: New `AvatarGroup` atom: an overlapping stack of `Avatar` tiles that collapses
  everyone past `max` into a single "+N" count. Data-driven (`avatars`), with
  `Avatar`'s size, shape and theme axes and a surface ring between tiles.
- a332a12: New `IconButton` atom: the square, icon-only command. It shares the Button
  recipe's box, states and focus rings, and makes the accessible name a required
  `label` prop — an icon-only control is unnamed without one.
- a332a12: New `Image` atom: a framed image that holds its box (by `ratio` or
  intrinsically) while the source loads or fails, so layouts never jump. Lazy by
  default, with a `fallback` slot for broken sources.
- a332a12: New `Link` atom: a text link for prose and chrome. `route` stays in the app (a
  plain `href` a router intercepts), `href` opens a new tab and announces it to
  assistive tech, `theme` picks accent vs quiet, and `underline` controls the
  decoration. The external glyph is opt-in.
- a332a12: New `VisuallyHidden` atom: the `sr-only` utility as a component with a stable
  `data-slot`, for content only assistive tech should read.

## 1.0.1

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
- dad472a: Darken the coloured Avatar initials from `ink-{theme}-7` to `ink-{theme}-8`,
  matching the contrast contract's `ink-{theme}-8` on `surface-{theme}-2` pair.
  The blue avatar measured 4.2:1 at 11px.
- dad472a: Fix the dark-mode solid red Button foreground. `dark:text-ink-red-9` put
  `red-50` text on the `red-300` surface at 2.96:1; the shared `ink-base`
  foreground now matches every other solid theme and reaches 4.83:1. The
  contrast contract already asserted `ink-base` on `surface-red-8`, so the
  recipe now matches the pair that was being tested.
- 3355988: Skills: the `newui` non-negotiables now name the stacking and speed scales
  (`z-raised` … `z-top`, `duration-fast|base|slow`), matching the principle that
  a component hard-coding `z-50` or `duration-150` is a bug. The bullet previously
  covered colour tokens only, so an agent following the skill could still emit a
  numeric layer.

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
- 1249641: `TextInput` and `Textarea` extend the native element's attribute set
  (`autocomplete`, `inputmode`, `maxlength`, `pattern`, `min`/`max`, event
  handlers, …) so HTML behavior no longer needs a dedicated prop. Component axes
  (`size`, `variant`) and the `prefix`/`suffix` adornments are unchanged;
  `prefix` keeps its P6 adornment meaning and shadows the HTML attribute.
- 6fda044: Support BottomSheet drag dismissal with scroll handling, cancellation,
  non-dismissible sheets and reduced motion. Load CodeEditor grammars on demand
  while preserving edits and ignoring stale language requests after changes or
  unmounting.
  
  Expose paragraph, link editing and undo/redo in EditorToolbar. Disable formatting
  for readonly editors and history actions when their operation is unavailable.
- 436c6ec: Sidebar family reaches frappe-ui parity. `SidebarItem` gains `route`/`href`
  link rendering (route wins, `onClick` still fires for router interception) and marks the active row with
  `aria-current="page"`. `SidebarItem` gains an `icon` prop (used when
  `prefix` is unset), derives its collapsed tooltip label from string
  children, and renders `suffix` beside the link instead of inside it, so a
  menu button there is valid HTML. `SidebarSection` can be controlled via
  `collapsed`/`onCollapsedChange`. `SidebarCard` actions receive
  `{ dismiss }`. `AppSidebar` items pass `route`/`href` through.
- 7b85ab4: New display atoms: `Heading` maps `level` (1–3) to `h1`–`h3` and the matching
  type role (page title vs section title), and `Text` resolves the paragraph
  scale with the default reading color. Both carry `data-slot` hooks and merge
  caller classes last. See `spec/heading.md` and `spec/text.md`.

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
- 4a5b1fb: New semantic `Table` molecule: `Table`, `TableHead`, `TableBody`, `TableRow`
  (with `selected` ⇒ `data-selected`), `TableColumnHeader` and `TableCell` style
  the native elements for known, directly-rendered data. `ScrollTable` composes
  the same shared header class from `control-styles`, so the two cannot drift.
  `ScrollTable`'s root and head gain `data-slot` hooks.
- ba4540f: Stacking and motion become named scales from `@talelk/newui-tokens`: `z-raised`,
  `z-floating`, `z-overlay`, `z-top`, `duration-fast/base/slow` and
  `ease-standard` resolve `@theme` variables instead of components hard-coding
  `z-50`, `z-[100]` and numeric durations. Computed values are unchanged. The
  disclosure chevron keeps its literal 200ms, paired with the
  `disclosure-panel` utility's timing.

## 0.1.0

### Minor Changes

- 5e84078: Seven components, and two more merge-config gaps found on the way.

  **New** — each from Zag's machine where one exists, keeping one primitive
  layer and one definition of focus and keyboard:

  - `Accordion` / `Collapsible` — `@zag-js/accordion`, `@zag-js/collapsible`.
    `Item` owns the value and the disabled flag and hands both to its parts, so a
    trigger and its panel cannot disagree about which item they belong to.
  - `ToggleGroup` — `@zag-js/toggle-group`. Distinct from `TabButtons`: a set of
    pressed states (`radiogroup` when one value is allowed, `group` when several),
    railed by the machine's roving focus.
  - `Pagination` — `@zag-js/pagination`, plus a `Range` part that owns the
    off-by-one (Zag's `pageRange.start` is the rows _before_ the page).
  - `ProgressCircle` — `@zag-js/progress`. The viewBox is fixed and the box
    scales, so each size converts its intended on-screen stroke width into
    viewBox units; passing a width straight through draws a 3px ring at `sm` and a
    6.75px one at `xl`.
  - `EmptyState` — plain markup: icon, one line of what is missing, one action.
  - `Timeline` — plain markup; the rail is two half-lines per row, so the first
    and last markers have no dangling stub.

  A shared `disclosure-panel` utility carries the disclosure animation: the panel
  clips, `grid-template-rows: 0fr → 1fr` gives it a height without measuring the
  content, and a delayed `visibility` keeps a collapsed panel out of the tab order
  and the accessibility tree. Zag's own `hidden` is dropped for this reason — it
  would win over all of it and snap.

  **Merge config** — the all-pairs sweep caught two more gaps the moment the new
  recipes used the classes, both of which let a same-property pair survive and be
  decided by the cascade instead of by `cn()`:

  - named `tracking-*` (`wide`, `tight`, …) were not recognised at all;
  - `inset-x` did not conflict with the logical `start`/`end`.

  Agreement with the extended default now covers 402,590 ordered pairs.

### Patch Changes

- 4cadb5f: Two more classes the merge config mis-classified, both found by the all-pairs
  sweep rather than by a bug report:

  - `border-collapse` / `border-separate` matched the `border-<anything>` colour
    validator, so `cn('border-outline-gray-2', 'border-collapse')` dropped the
    colour and left the table utility standing alone. They are now declared as the
    table-layout pair they are.
  - Named `tracking-*` steps (`wide`, `tight`, …) were not recognised at all, so a
    consumer's `tracking-wide` and a recipe's `tracking-[0.02em]` both survived and
    the cascade decided.

  `pnpm css:check` also stopped throwing on the second one: its utility resolver
  read only the function form of a validator, while the stock configuration (which
  this config mirrors) also uses bare strings.

- 06f2b7c: Recognise Tailwind's named `tracking-*` steps in the merge config.

  `cn()` resolved `tracking-<length>` (our recipes' vocabulary) but not
  `tracking-wide`, `tracking-tight` and the other named steps Tailwind ships.
  A class the config does not recognise is kept unconditionally, so a consumer
  writing `className="tracking-wide"` alongside a recipe's `tracking-[0.02em]`
  got **both** declarations and the cascade decided — the recipe's value silently
  lost.

  The all-pairs equivalence sweep caught it the moment the site used
  `tracking-wide`; it now agrees with the extended default across 382,542 cases.
