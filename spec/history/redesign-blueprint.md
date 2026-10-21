# Redesign blueprint — site + shells/charts polish

> Archived in `spec/history/` — a historical record, not a contract. Originally
> written in `spec/` because `.gitignore` ignores all of `docs/`; moved out of
> the contract layer once the work it planned had landed. Current architecture
> is specified by `kit.md` and ADR-0013.

> Historical implementation plan. Its package paths, API assumptions and task
> status predate the atomic refactor; current architecture is specified by
> `kit.md` and ADR-0013.

Status: implemented and superseded. This file records the earlier site and
visual-system pass; it is not the current architecture or plan of record.

## Decisions already made (do not re-litigate)

| decision | value |
| --- | --- |
| scope | site chrome + shell blocks + chart shells polish only |
| tokens | stable; no new token values, no palette edits |
| public APIs | stable in Slices 0–4 (recipe/markup only); additive-only in Slice 5 |
| style source | Sidebase (VitePress) shell density; Tremor KPI/filter/chart-card anatomy |
| style rule | pattern borrow in newui semantic tokens; never a pixel clone |
| order | guardrails first (Slice 0), then shell, blocks, charts, site pages |
| excluded | KanbanBoard redesign, token/theme-axis changes, Zag machine changes |

Sidebase has no dashboard/KPI component library; it contributes only the
docs/app shell: top bar (logo, search with `K` hint, few flat links, theme
toggle), grouped dense left sidebar, right "On this page" TOC, one content
column. Every KPI/filter/chart pattern below is Tremor-derived.

## Non-negotiable constraints (every slice)

- Semantic tokens only: `surface-*` / `ink-*` / `outline-*` (+ existing
  `--chart-*` in charts). Never raw palette steps, hex, rgb/hsl literals.
- No class-injection or style-injection public props added anywhere (P10).
  Existing `class?: string` fallthroughs on blocks stay; none are added.
- Shell (`apps/playground/src/shell/*.tsx`) imports no `@talelk/newui-*` statically;
  only `shell/theme.ts` `createColorScheme` singleton and lazy `PageFinder`.
  Enforced by `routes.test.ts` + `.dependency-cruiser.cjs` `site-shell-stays-lean`.
- Every playground route stays lazy via `page()`/`import()` in `routes.tsx`.
- Blocks import only `@talelk/newui-ui`; charts ship no stylesheet (inline
  `CSSProperties` + `var(--…)` stays the mechanism in `@talelk/newui-charts`).
- Never edit `references/`, generated `apps/playground/src/generated/*`,
  or `packages/ui/api.json` by hand (`pnpm site` / `pnpm api` own them).
- Taste: no purple/indigo accents — remove `theme='violet'`
  (`ComponentPage.tsx:204`) and stop defaulting Kanban demos to `violet`
  (`KanbanBoard.tsx:22,34`); no gradients (incl. headline text), no cream
  page bg, no glow/glass, no `hover:scale-105`, no left-border accent cards,
  no nested cards, no identical 3-card grids, no tracked all-caps kickers
  everywhere, no emoji icons, no single radius everywhere.
- Body copy never `text-ink-gray-5/6` alone (contrast); secondary text
  minimum `ink-gray-7`. Real type hierarchy: exactly one H1 measure and one
  body measure per page (see Slice 4). Respect `prefers-reduced-motion`.

## Slice 0 — Guardrails first (no visual change)

Goal: make Slices 1–5 machine-checkable before any markup moves.

1. Pin current budgets as regression evidence: run `pnpm size` +
   `pnpm budget` on the untouched tree; record the numbers in the slice PR
   description. Slices 1–4 must not raise any route budget; any raise
   requires a budget-file edit with justification in the same diff.
2. Add spec↔API tripwire test (new, e.g. `scripts/spec-api.test.ts`):
   invert `scripts/sitegen.ts` `componentOf` + `FAMILIES` + `SPEC_ALIASES`
   (do not use naive `PascalCase(spec)+Props` — measured false-fail 27/82
   specs). Parse spec Props tables outside code fences only. Skip list:
   README, example-tasks, migrations, reference-examples,
   visual-system,
   dialog-imperative, toast. Note 45/82 specs have no `## Props` table —
   those assert only that the spec defers to generated tables.
3. Add token-vocabulary derivation test: derive expected `--color-*`
   names from `@talelk/newui-tokens` exactly as `build-css.ts:42-96` does
   (`--color-${cat}-${name}`, overlay, ramps, `--radius-*`, `--shadow-*`,
   `--text-*`); replace the hard-coded 14-token list in `generated.test.ts`.
   Import tokens via the vitest alias as `contrast.test.ts` does (root
   `import('@talelk/newui-tokens')` fails — workspace package is not linked at root).
4. Add `tv()` tripwire: call a real recipe (`button` from
   `Button/recipe.ts:133`) and assert outputs per axis. `TvFn.__variants`
   is type-only (`tv.ts:46`) — axes cannot be introspected at runtime;
   call the recipe, never fake one.
5. Confirm existing gates cover the redesign surface and name them in the
   PR template for Slices 1–5: `tw-merge.test.ts` (all-pairs + axis
   independence), `tokens.test.ts`, `contrast.test.ts`,
   `keyframes.test.ts`, `exports.test.ts`, `routes.test.ts`, `pnpm arch`,
   `pnpm css:check`, `pnpm api:check`, `pnpm site:check`.

Validate: `pnpm test && pnpm lint && pnpm lint:solid && pnpm typecheck`
then `pnpm verify:checks`. Expect zero visual diff (`pnpm shots` optional).

## Slice 1 — Site shell chrome (Sidebase density, markup/classes only)

All files keep zero static `@talelk/newui-ui` imports. No route/table changes.

| file | change |
| --- | --- |
| `shell/Masthead.tsx` | Keep sticky `min-h-12`, favicon+wordmark, breadcrumb, lazy `PageFinder` (⌘K, `:13`), `ThemeMenu`, inline GitHub SVG. Add: flattened top links (Docs / Components / Blocks / Examples) from `NAV` at `lg+`; search trigger gains visible `K` kbd hint at `sm+`. No new imports. |
| `shell/SiteLayout.tsx` | Keep sticky sidebar `w-56`/`w-12`, ⌘B, localStorage collapse, native `<dialog>` drawer, skip link. Add optional right TOC column slot (`toc?: () => JSX.Element`, `xl:` only, `w-56`, sticky) — rendered only when a page supplies it (Slice 4). Content stays `max-w-[1440px]`; tighten to `px-4 lg:px-6 py-6`. |
| `shell/SidebarNav.tsx` | Dense single-level groups (5–7 links each, `h-8` rows). Group headings: sentence case `text-caption-medium text-ink-gray-7` — remove tracked uppercase. Active row: `bg-surface-gray-2 text-ink-gray-9`; no left border. |
| `shell/ComponentNav.tsx` | Same heading treatment; keep filter input + grouped index. Active row matches SidebarNav. |
| `shell/ReferenceLayout.tsx` | Pass TOC slot through to `Chrome`; no other change. |
| `shell/PageIntro.tsx` | Becomes the one page header: `text-heading` title, `text-base text-ink-gray-7 max-w-2xl` description. All index/docs pages adopt it in Slice 4. |
| `shell/nav.ts` | Data only; add nothing unless a href changes. If any href moves, edit `routes.tsx` ROUTES in the same commit (`routes.test.ts` asserts NAV↔ROUTES bijection). |
| `shell/ThemeMenu.tsx`, `shell/theme.ts`, `shell/PageFinder.tsx`, `shell/modal.ts` | No change. |
| `src/index.css`, `index.html` | Drawer/backdrop + meta/title only. No font import change (font identity is a separate token-level decision; out of scope). |

Validate: `pnpm vitest run apps/playground/src/routes.test.ts`,
`pnpm arch`, `pnpm build:playground && pnpm css:check && pnpm budget`.
Shell bundle must not grow: every route pays for shell weight.

## Slice 2 — AppSidebar + shell blocks polish (recipe/markup only)

No prop changes. Blocks keep importing only `@talelk/newui-ui`.

| file | change |
| --- | --- |
| `packages/blocks/src/AppSidebar/AppSidebar.tsx` | Header hierarchy: title `text-interface-semibold`, subtitle `text-caption text-ink-gray-7`. Count becomes a quiet pill (`rounded-full bg-surface-gray-2 text-caption` tabular-nums) instead of faint suffix text. Group label sentence case. Keep header outside `ScrollArea` (`:67`); keep 14rem default width (`:59`). |
| `packages/blocks/src/PageToolbar/PageToolbar.tsx` | Title to `text-heading` scale; keep single primary action. Delete dead exported `PageToolbarTab` only in Slice 5 (API change, needs changeset). |
| `packages/blocks/src/DetailHeader/DetailHeader.tsx` | Status keeps `theme` mapping; actions keep last=solid/rest=outline. Spacing/type hierarchy only. |
| `packages/blocks/src/AuthCard/AuthCard.tsx` | Give it the card its name promises: inner `bg-surface-elevation-1 border border-outline-gray-1 rounded-6 shadow-sm p-6` (currently plain centered column, `:41`). Page stays `bg-surface-base`. Visual only. |
| `packages/blocks/src/KanbanBoard/*` | No change except demos stop using `violet` tone. Kanban is the most complete block (FLIP + reduced-motion already). |
| demos in `apps/playground/src/demos/*.tsx` | Update affected demos only; keep one lazy file per component. |

Validate: `pnpm vitest run packages/blocks`, `pnpm typecheck`,
`pnpm api:check` (must pass unchanged — proves no API drift),
`pnpm size` (Blocks barrel within budget, still cannot reach
slider/toast/date-picker).

## Slice 3 — FilterBar sophistication + StatGrid → KPI-card polish

### 3a FilterBar (`packages/blocks/src/FilterBar/FilterBar.tsx`, `spec/filter-bar.md`)

Recipe/markup first (no API break): bar gets a surface
(`border border-outline-gray-1 bg-surface-elevation-1 rounded-5 px-2 py-2`
or border-b variant when full-bleed — pick one in the diff and record it),
filled selects get emphasis (`bg-surface-gray-2`), search gains a `/` kbd
hint. Layout decision stays: search leads widest, fixed-width selects,
view switcher trailing (`FilterBar.tsx:45-56`, `spec/filter-bar.md:18`).

Tremor filter-bar anatomy adopted in Slice 5 (additive props): period
segmented control (Today|7D|30D|3M|6M) via existing `tabs`, explicit
date-range text (never icon-only), `View (n)` active-filter count,
trailing primary action via `children`. Do not invent a second bar API.
Spec "Not yet" (`filter-bar.md:25`: no date-range/multi-select shortcut)
stays true until Slice 5 updates it in the same diff as the props.

Validate: `pnpm vitest run packages/blocks/src/FilterBar`, `pnpm api:check`
(3a must not change api.json), axe on the filter-bar demo.

### 3b StatGrid KPI cards (`packages/blocks/src/StatGrid/StatGrid.tsx:42`)

Adopt Tremor KPI anatomy, one layout only — label-first:
header row (label + delta pill) → big value → baseline caption → optional
footer/sparkline in Slice 5. Rules:

- Delta is a tinted pill, coloured by `good`, never by direction
  (`Stat{delta{value,direction,good}}` already encodes this; keep it):
  `bg-surface-green-2 text-ink-green-7` / `bg-surface-red-2 text-ink-red-7`,
  `rounded-full px-1.5`, tabular-nums.
- Every delta pairs with an explicit baseline caption ("from 400",
  "vs previous month") in `hint` — never a bare `%`. Update demos to show
  this; spec gains the rule.
- Icon in a tinted square (`size-8 rounded-4 bg-surface-gray-2`), not a
  bare glyph (`StatGrid.tsx:69` today). Padding `p-3 → p-4`; value keeps
  `text-metric` tabular; hover = border/shadow-sm change only, no scale.
- Cards must not be identical-by-construction: width follows content via
  the existing `columns 2|3|4` grid; no new radius (keep `rounded-5`).

Converge, don't duplicate: `@talelk/newui-charts` `NumberCard` keeps sparklines
(blocks cannot import charts). StatGrid never grows a chart; a stat that
needs a sparkline links out to a NumberCard example. Document this in
`spec/stat-grid.md` (it already points sparkline → NumberCard).

Validate: `pnpm vitest run packages/blocks/src/StatGrid`,
contrast check on both delta pill pairs (`pnpm test` runs
`contrast.test.ts`), `pnpm shots` for the stat-grid demo (light+dark).

## Slice 4 — Chart-card chrome (`@talelk/newui-charts`, inline styles only)

Charts ship no stylesheet; all values stay `var(--surface/ink/outline-*)`
+ `--chart-*`. No Tailwind classes, no `tv()` in this package.

| file | change |
| --- | --- |
| `packages/charts/src/ChartCard.tsx:12` | `SURFACE` padding `12px → 16px`; keep radius 10px, `card:false` clipping-box behaviour. |
| `packages/charts/src/ChartContainer.tsx:94` | Title `0.875rem → 1rem/600 var(--ink-gray-9)`; subtitle to `var(--ink-gray-7)` (from gray-6); hairline divider under header; header keeps `actions` slot (period tabs live there — no new prop). Legend row spacing `0.5rem`. Loading = skeleton pulse disabled under reduced motion (`useChart.ts` already sets `animation:false`). |
| `packages/charts/src/ChartLegend.tsx` | Tremor pill: colour dash (rounded, ~14×3px) + `text-xs` label, click-to-isolate dims others to 40% — only when a toggle handler exists, mirroring existing `onToggle`/`onHighlight` (`spec/charts.md:27`). |
| `packages/charts/src/ChartTooltip.tsx` | Card: header row (label, bottom hairline) + rows (dash + category left, tabular value right). No other chrome. |
| `packages/charts/src/NumberCard.tsx` | Target progress bar derived from existing `value`/`target` (today text-only ` / target`); delta pill matching §3b tones; sparkline end-dot; `▲▼` glyphs kept (aria-hidden, value also in text). |
| wrappers (`Bar/Line/Area/Donut…Chart.tsx`) | No API change in this slice. Demos wire `ChartLegend`/`ChartTooltip` explicitly (today unwired by default) so polish is visible; auto-wiring is Slice 5. |
| empty/error states | Tremor rule: never a blank plot — keep card title + `0`/`--` placeholders + reason caption + at most one CTA. `ChartContainer` state precedence (`error > loading > empty`, `:45`) unchanged. |
| `Dashboard.tsx` | No change (span support is Slice 5). |

Validate: `pnpm vitest run packages/charts`, `pnpm test:ssr`,
`pnpm test:browser` (real CSS), axe on chart demos, `pnpm size`.

## Slice 5 — Site pages, docs content, additive API (last, separate diffs)

Site pages (components allowed; stay behind `page()` lazy chunks):

| file | change |
| --- | --- |
| `pages/Home.tsx` | Biggest rewrite. Remove eyebrow+centered-hero+2CTA shape, hand-drawn fake dashboard, nested metric cards (`:110-171` today), identical PILLARS grid. Keep zero `@talelk/newui-ui` imports (cheapest route, `:7`). New shape: left-aligned H1 + install command + three hand-offs (Components/Blocks/Examples) as a divided list, not cards. Real hierarchy: `text-hero` H1, body `text-ink-gray-7` minimum. |
| `pages/Docs.tsx`, `pages/Foundations.tsx` | Adopt `PageIntro`; add per-page TOC via Slice-1 slot (anchors generated from headings, scrollspy optional). |
| `pages/ComponentsIndex.tsx`, `pages/BlocksIndex.tsx`, `pages/Examples.tsx` | Keep divided lists (not card grids); drop tracked uppercase group labels; keep "N parts / Has a contract" metadata. |
| `pages/ComponentPage.tsx` | `theme='violet' → 'gray'` (`:204`); Preview/Code tabs per demo (reuse `ResponsivePreview` SourcePanel copy); TOC for Contract/Props sections. Usage import line stays. |
| `lib/markdown.tsx` | Heading ids, code copy button — required by TOC. No syntax-highlight dependency without a budget decision. |
| `pages/Analytics.tsx`, `pages/Tasks.tsx`, `pages/Accounting.tsx` | Apply Slices 3–4 outputs (KPI pills, filter bar, chart headers). These are the visual acceptance pages for `pnpm shots`. |

Docs/content, in the same diff as the code each item describes:

- `spec/filter-bar.md`, `spec/stat-grid.md`, `spec/charts.md`,
  `spec/app-sidebar.md`, `spec/auth-card.md`: record every behaviour or
  additive prop change; spec edits without code (or vice versa) are drift.
- Additive props (only here, each optional, each with a changeset +
  `pnpm api && pnpm site` regeneration): `Stat.sparkline?` is rejected
  (see §3b) — instead `Stat.footer?`; `NumberCard icon?/href?`;
  chart wrappers `showLegend?` auto-wiring + default tooltip;
  `FilterBar chips?/onClearAll?/resultCount?`; `AppSidebar footer?/search?`;
  `Dashboard` span via child wrapper. Delete dead `PageToolbarTab`.
- `AGENTS.md`: refresh measured sizes only after `pnpm size`/`pnpm budget`
  re-measure; never hand-copied numbers.

Validate: full gate — `pnpm verify` (all 20 steps in
`scripts/ci-steps.ts:17`), plus `pnpm shots` review (light/dark ×
320/768/1280) and `pnpm lighthouse`.

## What NOT to change

- Tokens & theme generation (`@talelk/newui-tokens`, `build-css.ts`, `theme.css`):
  no values, no new families. Any exception restarts this blueprint.
- Public APIs in Slices 0–4: `pnpm api:check` and `exports.test.ts` must
  pass byte-identical. No renamed/removed props ever; Slice 5 additive only.
- Routing structure: `routes.tsx` groups, `ROUTES` table, lazy `page()`
  pattern, `/spec` + `/play` harness routes, `BareLayout` fullscreen routes.
- Budgets: no silent raises in `scripts/size.ts` / `scripts/budget.ts`.
- Zag wiring (`lib/zag.ts`), `tv()`/`cn()` internals + `tw-merge.config.ts`,
  Field labelling contract (P5), `createColorScheme` singleton.
- `variant`+`theme` as the only colour axes (P4); `colorScheme` never
  spelled `theme`.
- Blocks→charts/editor imports; shell→component imports; `data-slot`
  attributes (styling hooks stay attribute-based, P10).

## Validation matrix

| slice | minimum gate before merge |
| --- | --- |
| 0 guardrails | `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm verify:checks` |
| 1 shell | `routes.test.ts`, `pnpm arch`, `pnpm build:playground`, `pnpm css:check`, `pnpm budget` |
| 2 blocks shell | `vitest packages/blocks`, `pnpm api:check`, `pnpm size`, `pnpm typecheck` |
| 3 filter/KPI | block tests + `contrast.test.ts` + `pnpm shots` (filter-bar, stat-grid) |
| 4 charts | `vitest packages/charts`, `pnpm test:ssr`, `pnpm test:browser`, `pnpm size` |
| 5 pages/API | `pnpm api && pnpm site` committed, `pnpm verify`, `pnpm shots`, `pnpm lighthouse` |

Every slice also: `git status` clean of collateral generated files except
the intended `api.json`/`generated/*` in Slice 5.
