# Examples refresh — execution blueprint

Decision-complete plan to refresh every playground example and site page onto
the Slices 0–4 surfaces (Sidebase shell, Tremor KPI/filter/chart polish),
deduplicate playground-local scaffolding, and land Slice 5 (Home, TOC,
AuthCard). No implementation is authorized by this file alone; each slice
below is one reviewable diff.

Status: implemented in the working tree (helpers H1–H16, Slices A–F).
The deferred items have since landed in the limits pass: `PageToolbarTab`
is deleted (§3, major changeset for `@newui/blocks`), Home embeds real
component previews as a scroll-loaded chunk (§4D), Analytics runs on
`DataTable`, reference pages render one Props table (the spec contract
drops its copy at render time only), and the TOC tracks the section being
read. See `spec/redesign-progress.md` for the measured record.

Authority: `AGENTS.md` + `spec/redesign-blueprint.md` +
`spec/redesign-progress.md` (Slice 5 leftovers, progress `:446-450`).
Evidence for every item was opened in-tree; citations are `file:line`
relative to the repo root unless prefixed `apps/playground/src/`
(shortened `pg/` below = `apps/playground/src/`).

## 0. Ground rules (apply to every slice)

- Semantic tokens only (`surface-*` / `ink-*` / `outline-*`, `--chart-*` in
  charts). No raw palette, hex, rgb/hsl. Secondary text minimum
  `text-ink-gray-7` (155 `gray-5/6` hits remain; fixed per-file as touched).
- No new class/style-injection props anywhere (P10). Library APIs stable:
  only the additive optional props listed in §5, each with spec edit +
  demo + changeset + `pnpm api && pnpm site`. Everything else is
  playground-local.
- Shell (`pg/shell/*`) imports no component: plain markup + the
  `createColorScheme` singleton (`pg/shell/theme.ts`) only. Every route
  stays lazy via `page()`/`import()` in `pg/routes.tsx:31-49`. Blocks
  import only `@newui/ui`. Never edit `references/`, `pg/generated/*`,
  `packages/ui/api.json`, or `pnpm-lock.yaml` by hand.
- Taste: no violet/indigo accents or gradients, no gradient headline text,
  no cream page bg, no glow/glass, no `hover:scale-105`, no left-border
  accent cards, no nested cards, no identical 3-card grids, no tracked
  all-caps kickers everywhere, no centered eyebrow+headline+2CTA hero, no
  emoji icons, no single radius everywhere; respect
  `prefers-reduced-motion`. Current sweep: `violet|indigo|gradient|
  hover:scale|backdrop-blur` = 0 hits in pages/examples/patterns — keep it 0.
- Guide and fullscreen variants share one page component body
  (`pg/routes.tsx:230-248,282-306`; `pg/pages/ApplicationPage.tsx:18-22`),
  so no example is edited twice. 13 application examples
  (`pg/lib/examples.ts:2-119`); 68 registry examples
  (`pg/lib/reference-examples.ts:2-83`) via `pg/pages/patterns/`.

## 1. Shared playground helpers to create

All homes are reached only from lazy page/demo chunks, so none of these
can leak into the shell chunk. Create in slice order; each lands with its
first consumer in the same diff (no orphan helpers).

> **Since this was written:** H2–H5 are no longer playground helpers. They are
> the first surfaces of `@newui/data` (`spec/data.md`), importable by any app and
> headless by contract; the example copies are deleted. H1 stayed an example
> composition — it renders, so it is a component, and it belongs in the kit or in
> the app, not in the logic layer.

| # | Path | Exports / props | Consumers (evidence) |
| --- | --- | --- | --- |
| H1 | `pg/examples/Notice.tsx` | `<Notice text tone?='blue'\|'green'\|'red' onUndo? onDismiss?>`, `role="status"` | 11 notice signals: Deals:52,286-306 · Files:34,260-267 · Mail:56-57,265-286 · Tickets:46,224-231 · Accounting:60,306-313 · Tasks:188,457-464 · Compose:38,150-157 · Analytics:66-67,552-570 · Settings:41,149-152 · DiscussionSettings:92,211 · patterns/Navigation:10,144 |
| H2 | `pg/examples/undo.ts` | `createUndo<T>()` → `{snapshot, capture, undo, clear}` | Deals:53,78,292-304 · Mail:57,84,271-284 · Analytics:67,103,564-568 |
| H3 | `pg/examples/format.ts` | `usd, usdK, count, bytes, isEmail` (zero deps) | USD `Intl` ×4: deals-data:35-40 · accounting-data:86-91 · analytics/data:119-124 · demos/kanban-board:14-19; axis `$k` Analytics:423, Accounting:394; `bytes` files-data; email regex Mail:130,684 · Cards:~40 · Settings |
| H4 | `pg/examples/download.ts` | `downloadText(name,text,mime)`, `downloadCsv(name,rows)` (owns CSV quoting) | Blob+anchor ×4: accounting-data:92-106 · Analytics:129-138 · Compose:95-103 · Files:137-147; quoting dup analytics/data:99-118. Delete 3 hand copies |
| H5 | `pg/examples/select.ts` | `optionsOf(values)`, `first(value, fallback)` | Residual (non-FilterBar) selects after §2; pattern at 25+ sites (Deals:259-274 · Files:278-291 · Tickets:243-278 · Tasks:349-453 · Mail:212-216 · Accounting:260-266) |
| H6 | `pg/examples/Panel.tsx` | `<Panel title? actions?>` over `Card`/`CardHeader` | `rounded-5 border-outline-gray-1 bg-surface-elevation-1 p-3` ×20+ (Deals:248,317 · Files:364 · Compose:160,242 · Analytics:490,524,575 · Accounting:346,528 · DataTable:87 · ActivityList:25). Playground-only: not shell, not a library class-prop API |
| H7 | `pg/examples/ScrollTable.tsx` | `<ScrollTable caption?>` light scroll shell (`overflow-x-auto`, `tabIndex=0`, shared thead classes) | Shell ×4: DataTable:138-144 · Accounting ledger:440-443 · Analytics:617-621 (until H9 migration) · ComponentPage ApiTable:48-55 keeps its own (static, §3) |
| H8 | `pg/lib/LoadingNote.tsx` | `<LoadingNote/>` Suspense fallback | `<p>Loading…</p>` ×7: Play:40 · ComponentPage:115,148,292 · RegistryExamplePage:64 · ResponsivePreview:76 · PackageGuides:25 |
| H9 | `pg/lib/PageSection.tsx` | `<PageSection id title description?>` (`scroll-mt-16`, `text-section` h2) | Local defs Docs:13-20 · Foundations:6-12 · Settings:12-27; ComponentPage sections :267,315,321,326. Also the anchor source for TOC (§4). Patterns keep inline h2 (demo surface) — adopt opportunistically only |
| H10 | `pg/lib/CatalogList.tsx` | `<CatalogList sections>` (A + CatalogIcon only) | Same ~35-line block ComponentsIndex:74-111 · BlocksIndex:54-92 |
| H11 | `pg/lib/catalog.ts` | `groupEntries(entries, query)` pure fn | ComponentNav:31-39,44-68 · ComponentsIndex:25-50 · BlocksIndex:18-24 (all lazy; ComponentNav loads via lazy ReferenceLayout, routes.tsx:40-49) |
| H12 | `pg/shell/nav-ui.tsx` | `NAV_ROW` class const + `<FilterInput>` plain markup (lucide span, **no `@newui/*` import** — shell rule) | Nav-row class ×5: SidebarNav:122,179 · ComponentNav:110,142 · Masthead:159; search inputs SidebarNav:64-80 · ComponentNav:86-99; `Nothing matches` SidebarNav:90 · ComponentNav:123. ComponentsIndex keeps its own page-level input or drops to the same span markup |
| H13 | `pg/demos/chart-demo-state.tsx` | `<ChartDemoControls>` + `MONTHLY_ACTIVITY`; chart passed as **children**; imports `Button` only — must NOT import `@newui/charts` components or every per-file demo chunk drags all charts | 8 near-identical demos (area/bar/line/donut/funnel/heatmap/sankey/scatter-chart.tsx:1-39; diff area↔bar = 2 lines); variant chart-container:4-35 |
| H14 | `pg/demos/demo-frame.tsx` | `<DemoFrame tall?>` (`rounded-6 border-outline-gray-2` wrapper) | Block demos ×3 + variant: app-sidebar · page-toolbar · auth-card · kanban-board (`h-[26rem]`) |
| H15 | `pg/lib/TableOfContents.tsx` | `<TableOfContents entries={[{id,label}]} />` plain anchors, `aria-label="On this page"`; scrollspy optional, decided: **no scrollspy in this pass** | TOC suppliers §4. Lives in `lib/` (lazy page chunks), never imported by `shell/` eagerly — pages pass it through the existing `toc` slot |
| H16 (P2, optional) | `pg/examples/CreateDialog.tsx` | Dialog shell only (`open/attempted/error` scaffold); fields stay local | Scaffold ×7: Deals:347-443 · Files:490 · Tickets:479 · AccountingDialogs:31,121 · Mail:661 · discussions:134. Only if H1–H15 land cleanly |

Already deduped — do not redo: `PageIntro` (`pg/shell/PageIntro.tsx:10-32`,
11 uses), `ExampleFrame` (8 pages), `WorkspaceNav`
(`pg/examples/WorkspaceNav.tsx:25-89`), `DataTable` (5 pages), lazy
`pg/demos.ts` registry, single nav tree `pg/shell/nav.ts`.

Non-drop-ins (verified against block APIs; use local restyle, not the
block): `PageToolbar` (`packages/blocks/…/PageToolbar.tsx:16-25`: span
title, one action, no description) and `DetailHeader` (`:15-31,49-58`:
label/onClick actions only) cannot replace `ExampleFrame`'s
h1+description+multi/loading actions; `AppSidebar`
(`packages/blocks/…/AppSidebar.tsx:13-20`, onClick-only items, no
group-action slot) cannot host anchor nav or nest inside
`ExampleFrame:45`'s Sidebar wrapper; `StatGrid` has no per-card action
slot. Decisions per surface are in §2.

## 2. Per-example refresh checklist

Order = leverage. "Shared fix" = land once in `ExampleFrame` /
`WorkspaceNav`, all consumers inherit.

### Slice A — shared frame restyle (one diff, 8 pages)

- [ ] `pg/examples/ExampleFrame.tsx`: replace tracked-uppercase
  `WORKSPACE/{name}` kicker (`:111-120`) with a sentence-case
  `Breadcrumbs` trail; avatar span (`:79-85`) → `Avatar`; `gray-6`
  description/footer (`:117,122`) → `ink-gray-7`. Do **not** swap in
  PageToolbar/DetailHeader (see §1 non-drop-ins).
- [ ] `pg/examples/WorkspaceNav.tsx`: restyle to AppSidebar anatomy —
  sentence-case group label (drop tracked uppercase `:49`), count pill
  (cf. `AppSidebar.tsx:88`), `gray-5/6 → gray-7` (`:49,62,67`). Direct
  AppSidebar adoption rejected: would nest Sidebar in `ExampleFrame:45`
  (rationale already at WorkspaceNav:13-15).
- Consumers refreshed for free: Accounting, Cards, Compose, Deals,
  Files, Mail, Tasks, Tickets.

### Slice B — FilterBar adoption (one page per diff, in this order)

Canonical wiring to copy: `pg/pages/Analytics.tsx:257-298` and
`pg/demos/filter-bar.tsx:42-99` (`query/selects/tabs/chips/resultCount/
onClearAll`, API at `packages/blocks/…/FilterBar.tsx:32-59`). No
FilterBar API change. Residual selects use H5.

- [ ] **Tasks** (biggest win): merge two filter rows (`:337-365`,
  `:398-456`) into one FilterBar — `query`=search,
  `selects`=[Assignment, Status, Priority] (map `''↔'all'` sentinel,
  drop `All-*` options), `tabs`=Table/Activity, chips for
  status/priority/owner/scope/query, `resultCount=filtered().length`,
  `onClearAll` resets all 5 signals (`:225-237`); Group toggle + mobile
  sort stay in `children`. Sidebar hand buttons (`:289-312`) →
  WorkspaceNav with project counts from `all()`. StatGrid (`:367-396`)
  already done; no delta baseline data exists — do not fabricate.
  Adopt H1 Notice (green tone) + EmptyState for loading/error cards
  (`:465-495`).
- [ ] **Tickets**: merge split filters (`:232-262`, `:263-280`) —
  `query`, `selects`=[Priority, Agent, Queue], `tabs`=Open/All/Closed,
  chip per non-All value, `resultCount=rows().length` (`:55-70`),
  `onClearAll` resets 4 signals. StatGrid (`:189-222`) gains
  icons+hints. Hardcoded count `'24'` (`:150`) → `tickets().length`.
  Bare-`<p>` empty state (`:340-342`) → EmptyState. H1 Notice.
- [ ] **Deals**: filter div (`:248-285`) → FilterBar `query`,
  `selects`=[Owner], `tabs`=Board/List, chips owner/query,
  `resultCount=rows().length`, `onClearAll`; Sort stays in `children`
  (not a filter). StatGrid (`:213-246`) gains icons+hints
  ("Excluding won", …). Two WorkspaceNav instances (`:186,200`) → one
  nav with two groups. KanbanBoard (`:311-341`) done. H1+H2+H3.
- [ ] **Files** (currently no blocks): filter (`:268-302`) → FilterBar
  `query`, `selects`=[Type], `tabs`=Grid/List, `children`=Sort, chips
  type/query, `resultCount`, `onClearAll`. Hand breadcrumb nav
  (`:303-333`) → `Breadcrumbs` (`@newui/ui` index:7). Storage
  Progress+caption (`:468-489`) → `NumberCard target=10485760
  format=bytes` (H3; progress anatomy per
  `packages/charts/src/NumberCard.tsx:188`). Dashed empty state
  (`:354-361`) → EmptyState. WorkspaceNav (`:183`) gains per-section
  counts. File-grid `<li>` (`:364`) stays (content, not KPI). H1+H4.
- [ ] **Accounting**: page Buttons-as-tabs (`:233-253`) →
  TabButtons/FilterBar `tabs`; period row (`:254-305`) → FilterBar
  `selects`=[Aggregate], `children`=DateRangePicker + preset
  TabButtons, chips=[range, grain], `resultCount=ledger().length`,
  `onClearAll` resets range+grain; delete the preset Select whose
  `value=[]` never displays (`:268`). Cash-account hand cards
  (`:346-381`) → StatGrid stats; the per-card "View cashflow" Button
  (`:368`) has no Stat slot — move it below the grid. Hand tables
  (`:437-485` ledger → H7 ScrollTable; `:527-598` P&L stays hand-rolled,
  static) vs existing DataTable (`:488,518`). StatGrid icons/hints
  (`:314-341`) and ChartCard/ChartLegend toggle (`:385-427`) done.
  H1+H3+H4 (delete `downloadCSV` copy, accounting-data:92-106).
- [ ] **Mail**: `MailboxItems` hand buttons (`:172-191`, in nav `:291` +
  BottomSheet `:303`) → restyled WorkspaceNav with a local folder→icon
  map (counts already computed `:180-185`). Pane filters (`:316-360`) →
  FilterBar `query`, `selects`=[Category], `tabs`=All/Unread,
  `resultCount`, chips, `onClearAll` (absorbs empty-state Clear
  `:373-382`); drop the pane `border-b` wrapper to avoid a nested
  surface inside the card (`:288`). Native `<input type=range>`
  (`:247-263`) → `Slider`. Reading toolbar (`:474-524`) stays —
  DetailHeader actions cannot do icon-only. No KPI/chart. H1+H2+H3.
- [ ] **DiscussionsDesktop**: hand-composed sidebar
  (SidebarHeader:247 + ScrollArea:275 + SidebarLabel:291 +
  SidebarItems:301-322, unread plain span :312-314) → `AppSidebar`
  (`title`=community, `subtitle`, `headerActions`=existing Dropdown
  `:255`, groups=[Home/Search, Spaces with `count`=unread]); the
  Sort-spaces button (`:292`) has no group slot — move to
  `headerActions`. Keep `SidebarRail` (`:182`). `PageHeader`
  (`:329-371`) + `SpaceActionsMenu` (`:85-111`) are exactly
  `PageToolbar` (title, menu, "Add new" action) → replace, delete the
  menu component. Search (`:374-383`) + tabs/count (`:389-401`) →
  FilterBar `query/tabs/resultCount/chips`; rail focus-by-id (`:220`)
  is replaced by FilterBar's `/` shortcut — delete the id hack.
  **DiscussionsMobile**: MobileShell/MobileNav done; search tab
  (`:223-233`) stays, add result-count text. `Discussions.tsx:5-20`
  lazy split is exemplary — untouched.
- [ ] **Analytics** (reference-done for FilterBar/NumberCard/ChartCard:
  `:257-298,322-398,404-484`): move into `ExampleFrame` — delete own
  masthead (`:150-184`), aside nav (`:187-231`, uppercase `:192`,
  avatar span `:176`) and duplicate title block (`:236-255`) ≈ −90
  lines; its in-page anchor nav becomes WorkspaceNav with anchor
  items handled locally (AppSidebar is onClick-only). Table search
  TextInput (`:588-598`) → FilterBar `query` prop with query/days
  chips, and `onClearAll` (`:294`) must also reset the query (rows at
  `:71-79`). Preview-state Select (`:299-317`) → FilterBar `children`.
  Goal hand-card (`:490-523`) duplicates NumberCard target (`:325`) →
  NumberCard or delete. Insight callout (`:524-550`, uppercase `:526`)
  → sentence-case `Alert`. Two-series AreaChart (`:405-430`) hand
  caption → `ChartLegend` (legend prop, charts types:450). Hand-rolled
  sortable table (`:620ff`, own sort `:124-140`) → `DataTable`
  (TanStack; lazy page — **gate on `pnpm budget`** before merging; if
  over budget, keep H7 shell only). KPI grid (`:318-399`): page-local
  kpi array + `<For>` over NumberCard (keeps sparkline/target
  StatGrid lacks). H1+H2+H3+H4.

### Slice C — remaining examples (small, batchable per page)

- [ ] **Compose**: Editor/EditorToolbar (`:196-211`) done; no
  filter/KPI. Hand surfaces — editor section (`:159-162`), Publication
  aside (`:241-247`) → H6 Panel / Card+CardHeader; blue tip
  (`:281-289`) → `Alert`; `gray-6` meta (`:214,305`) → `gray-7`.
  H1 (green + red-alert tones) + H4. Rest rides on Slice A.
- [ ] **Cards**: `Card` ×8 (`:26-472`) exemplary; no filter/KPI. Fake
  bar-chart spans (`:407-413`) → NumberCard sparkline bars (inline
  SVG, no echarts — `NumberCard.tsx:18-19`) **only if `pnpm budget`
  stays green**, else keep decorative. Nested card (`:300` inside a
  Card) → remove the wrapper (taste: no nested cards). The 3-column
  grid (`:486`) is the example's purpose — keep. H3 `isEmail`.
- [ ] **Authentication**: page re-rolls what AuthCard already offers —
  hand divider (`:229-233`) + GitHub Button (`:234-242`) + caption
  (`:243`) → pass `providers`/`footer` props
  (`packages/blocks/…/AuthCard.tsx:17-19`, renders its own labelled
  Divider) and delete the hand copies. Aside uppercase kicker (`:48`)
  → sentence case. The block surface itself is §4 (library slice).
- [ ] **Settings**: SettingsDialog compound (`:73-184`) + PageIntro
  (`:61`) exemplary; no polished-surface gap. Local `Section`
  (`:12-28`) → H9 PageSection; `gray-6` (`:22`) → `gray-7`. H1.
  Fullscreen variant is the same thin body by design — no change.
- [ ] **Patterns index** (`pg/pages/Patterns.tsx:35-50`): identical
  card grid + `gray-6` (`:46`) → divided list like
  `pg/pages/Examples.tsx:14-38`. **patterns/AnalyticsWidgets**: hand
  delta Badges with bare % (`:19-25`, violates the baseline-caption
  rule, redesign-blueprint:159-161) + hand delta-bar card (`:35-68`,
  `text-ink-red-6:42`) → NumberCard `delta`+`deltaCaption` /
  StatGrid delta pill; inline-width bar list (`:72-99`) → ChartCard +
  horizontal BarChart **or** keep (click-select behaviour) — decided:
  keep if selection is load-bearing, else chart; callout (`:102-125`)
  → `Alert`. **patterns/Carousel** metric (`:225-233`) → NumberCard
  (optional). Command/Layout/Navigation/Verification: primitives
  only, no gap (Navigation adopts H1).
- [ ] **Chart demos**: adopt H13 in all 8 state demos, and wire the
  Slice-4 chrome into the wrapper demos — `area/bar/donut/
  line-chart.tsx` currently render a bare chart (0 ChartCard/
  ChartLegend hits; `area-chart.tsx:19-35`) → wrap in `ChartCard`
  with `ChartLegend`/`ChartTooltip` where the series count warrants.
  One lazy file per demo stays.
- [ ] **Wrappers**: `ApplicationPage.tsx:17` `gray-6 → gray-7`;
  `RegistryExamplePage:80` surface `bg-surface-gray-1` vs
  `Patterns:73` `bg-surface-elevation-1` — align on elevation-1;
  `Examples.tsx:21` CatalogIcon ignores `EXAMPLES.icon`
  (`pg/lib/examples.ts`) — wire it or delete the field (decided: wire
  it, the data already exists).

## 3. Site-structure dedup

Decision: **no routes are removed in this refresh.** The nav tree is
already single-sourced (`pg/shell/nav.ts:1-14` — masthead, sidebar and
prev/next all read it; `pg/routes.test.ts` fails on drift in either
direction), so dedup here means shared scaffolding, not fewer pages.
That keeps every `routes.test.ts` expectation valid without edits.

- **Single nav source** — already true; protect it: H11/H12 must read
  `NAV` / generated registry, never introduce a second list. If any
  future slice *does* remove or rename a route, the same diff must
  update `pg/shell/nav.ts`, `pg/routes.tsx` and `pg/routes.test.ts`
  expectations, and add a redirect (router-level `<Navigate>` in the
  old route's place) — never orphan a path.
- **Shared page scaffolding**: H9 PageSection (Docs, Foundations,
  Settings, ComponentPage), H10 CatalogList (ComponentsIndex,
  BlocksIndex), H11 `groupEntries` (ComponentNav, both indexes),
  H12 nav-ui (SidebarNav, ComponentNav, Masthead row), H8 LoadingNote
  (all Suspense fallbacks). `PageIntro` and `ExampleFrame` are **not**
  merged: shell plain-markup vs page ResponsiveShell are different
  layers (Analytics joins ExampleFrame instead, §2).
- **Dead/duplicate removal** (code, not routes): 3 download copies
  (H4), 4 USD formatters (H3), 8 chart-demo bodies (H13), Analytics'
  private masthead/sidebar/title (§2), DiscussionsDesktop's
  `SpaceActionsMenu` (§2), Authentication's hand divider (§2),
  Accounting's never-displaying preset Select (§2), and the dead
  exported `PageToolbarTab` (`packages/blocks/…/PageToolbar.tsx:4`,
  zero other uses) — the last is a public-API removal: changeset
  (major for `@newui/blocks` per changeset rules) + `pnpm api &&
  pnpm site` in the same diff, or defer it; never delete silently.
- **Kept hand-rolled on purpose**: ComponentPage `ApiTable`
  (`:42-101`) and Accounting P&L table (static content; TanStack
  would bloat the reference chunk), patterns' inline section
  headings, Mail's reading toolbar, Files' file grid.

## 4. Style pass incl. Slice 5

Slices D–F. Source: redesign-blueprint "Slice 5" (`:196-222`) minus
what already landed (progress `:446-450`: FilterBar chips done early;
Docs/Foundations already adopt PageIntro — `Docs.tsx:34`,
`Foundations.tsx:30`; ComponentPage violet already gray).

### Slice D — Home rewrite (`pg/pages/Home.tsx`, 228 lines)

Still open (progress:446-450). Keep zero `@newui/ui` imports (cheapest
route, `:7-10`) and the left-aligned H1. Remove: the hand-drawn fake
dashboard with nested metric cards and inline SVG chart (`:110-171`),
and the identical 2×2 PILLARS card grid (`:14-45,186-208`). New
shape, plain markup + semantic tokens only:

1. Left-aligned `text-hero` H1 + one supporting paragraph
   (`text-ink-gray-7` minimum) + install command in a code block.
2. Three hand-offs (Components / Blocks / Examples) as a **divided
   list**, not cards — title, one line, arrow; reuse the Examples
   index row anatomy (`Examples.tsx:14-38`).
3. Keep the RULES definition list (`:47-64,210-222`) and the
   "why it is small" section — both already on-taste.
No hero eyebrow+2CTA pattern, no fake product screenshot. If a visual
is wanted later, it must be a real component render behind the lazy
chunk — decided: none in this pass.

### Slice E — TOC suppliers (slot exists, unused)

The slot is plumbed end-to-end and supplied by nobody:
`pg/shell/SiteLayout.tsx:27,119-125,213-215` (xl-only "On this page"
column) and `pg/shell/ReferenceLayout.tsx:58` forwards `props.toc`;
grep shows zero page suppliers. Work:

1. `pg/lib/markdown.tsx`: emit heading `id`s — slugify heading text
   (`:61-70` parses headings, `:188` renders them without ids) and
   export the heading list so a page can build entries. Add a code
   copy button in the same diff. No syntax-highlight dependency
   without a separate budget decision.
2. **Component/block pages**: `ComponentPage.tsx` supplies
   `toc={() => <TableOfContents entries={…}/>}` (H15) through
   ReferenceLayout for its four anchored sections — `preview`
   (`:267`), `usage` (`:315`), `props` (`:321`), `contract` (`:326`),
   all already `scroll-mt-16` — plus contract-spec headings from (1)
   when present.
3. **Docs + Foundations**: supply TOC entries from their H9
   PageSection ids via `SiteLayout`'s `toc` prop. If the current
   route wrappers don't forward `toc`, add the forwarding in
   `pg/routes.tsx`'s section component — shell files gain no
   component imports (the TOC element is constructed in the lazy
   page, passed as a thunk).
4. A11y: nav landmark labelled "On this page", anchors are real
   `<a href="#id">`, focus-visible ring, hidden below `xl` (slot
   already does this). Reduced-motion: no smooth-scroll override.

### Slice F — AuthCard surface (the one library diff)

Block still renders a plain centred column
(`packages/blocks/src/AuthCard/AuthCard.tsx:41-43`); blueprint
(`:119`) and progress (`:446-447`) both flag it open. Change, visual
only (no prop changes): inner column gains
`bg-surface-elevation-1 border border-outline-gray-1 rounded-6
shadow-sm p-6`; page stays `bg-surface-base`; description/footer
`text-ink-gray-6 → gray-7` (`:48,74`). Same diff: `spec/auth-card.md`
behaviour note (spec currently promises only measure/h1/divider),
`pg/demos/auth-card.tsx` review (H14 frame), Authentication page
adoption (§2). Changeset: patch for `@newui/blocks` (visual change,
no API delta); `pnpm api:check` must pass unchanged — that is the
proof no API drifted. Do not run `pnpm api`/`pnpm site` unless the
check says otherwise.

### Taste sweep riding along (no separate diff)

- Uppercase kickers removed where touched: ExampleFrame:114,
  WorkspaceNav:49, Analytics:192,239,526, Authentication:48,
  ComponentsIndex/BlocksIndex/Examples group labels (§3/H10).
- `text-ink-gray-5/6` → `gray-7` in every file a slice already edits;
  a repo-wide mechanical pass is **not** authorized (contrast test
  owns legibility; captions inside demos may be intentional muted
  states — judge per file).
- Cards page nested card (§2), Home nested metric cards (§4D) are
  the only nested-card instances found.

## 5. NOT-change list

- **Library public APIs**: no prop removals, renames or type changes.
  The only permitted API deltas, each optional + spec + demo +
  changeset + `pnpm api && pnpm site`, and only if §2 proves a
  consumer needs one (default: none ship): `Stat.footer?`,
  `NumberCard icon?/href?`, chart-wrapper `showLegend?` auto-wiring,
  `AppSidebar footer?/search?`, `Dashboard` span
  (`packages/charts/src/Dashboard.tsx:11` is columns-only today).
  `Stat.sparkline?` stays rejected (redesign-blueprint §3b).
  `PageToolbarTab` deletion is the sole removal candidate (§3).
- **Lazy routes**: every page stays behind `page()`/`import()` in
  `pg/routes.tsx`; no static page/component import enters routes or
  shell. `routes.test.ts` + depcruise `site-shell-stays-lean` are
  the enforcers — do not weaken them.
- **Shell rule**: `pg/shell/*` gains no `@newui/*` import; H12 is
  plain markup + string constants; the `createColorScheme` singleton
  (`pg/shell/theme.ts`) remains the only runtime import.
- **Budgets**: `pnpm size` entry budgets and `pnpm budget` route
  budgets are not raised to make a slice fit. The two gated
  adoptions (Analytics→DataTable, Cards sparkline) are abandoned,
  not budgeted around, if they overflow.
- **Blocks boundary**: blocks keep importing only `@newui/ui`;
  TanStack Table/Virtual/Query/Form stay at the playground page
  layer; charts/editors are composed in pages, never in blocks.
- **Tokens/theme generation, Zag machines, KanbanBoard internals**:
  untouched (redesign-blueprint "What NOT to change"). Kanban demos
  only stop defaulting to `violet` if any still do.
- **`references/`** checkouts, **`pnpm-lock.yaml`**, generated
  `pg/generated/*` and `packages/ui/api.json` (regenerate via
  scripts only): untouched by hand.
- **Prior uncommitted delivery** (guardrails + Slices 0–4 in-tree):
  kept; this refresh builds on it, never reverts it.

## 6. Validation per slice

Scripts verified in root `package.json:6-41`. Every slice ends with
lint/types at zero for touched files; a slice is not done while any
gate it names is red.

| Slice | Commands (in order) |
| --- | --- |
| A frame restyle | `pnpm typecheck` · `pnpm lint` · `pnpm lint:solid` · `pnpm test` (playground + a11y) · `pnpm build:playground && pnpm css:check` · `pnpm shots` eyeball the 8 frame pages |
| B each FilterBar page | A-set, plus `pnpm budget` for that route (mandatory for Analytics/DataTable, Files/NumberCard) and the page's existing `*-data.test.ts` via `pnpm test` |
| C small pages + demos | A-set; `pnpm api:check && pnpm site:check` must pass **unchanged** (proves playground-only); `pnpm size` after demo changes |
| D Home | A-set + `pnpm budget` (`/` must stay the cheapest route) + `pnpm lighthouse` |
| E TOC | A-set + `pnpm test:e2e` (anchor/focus behaviour, axe with real CSS) + `pnpm arch` (shell-stays-lean after any routes/shell forwarding edit) |
| F AuthCard (library) | `pnpm vitest run packages/blocks` · `pnpm typecheck` · `pnpm api:check` (unchanged = no API drift) · `pnpm specs:check` · `pnpm size` (blocks barrel; still cannot reach slider/toast/date-picker) · changeset present · A-set for the demo/page side |
| Any §5 additive prop or `PageToolbarTab` deletion | F-set, but `pnpm api && pnpm site` regeneration committed in-diff and `pnpm api:check && pnpm site:check` green **after** regen; `pnpm packages:check`; exports test updated if the public surface moved |
| Final (after last slice) | `pnpm verify` (all CI steps, `scripts/ci-steps.ts`) · `pnpm shots` full review light/dark × 320/768/1280 · `pnpm lighthouse` · update `spec/redesign-progress.md` and AGENTS.md measured sizes **only** from fresh `pnpm size`/`pnpm budget` output |

## Sequencing summary

A (frame) → B (Tasks → Tickets → Deals → Files → Accounting → Mail →
Discussions → Analytics) → C (Compose/Cards/Authentication-page/
Settings/Patterns/chart demos/wrappers, H13/H14 ride here) → D Home →
E TOC → F AuthCard. H1–H12 land inside the first slice that consumes
each. Estimated net effect: every application example renders
FilterBar/StatGrid-or-NumberCard/ChartCard chrome where the surface
exists, ~11 notice copies, 8 chart-demo bodies, 4 formatters and 4
download copies collapse into single playground-local modules, and
Home/TOC/AuthCard close the Slice-5 ledger in
`spec/redesign-progress.md`.

