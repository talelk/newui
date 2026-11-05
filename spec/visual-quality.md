# Visual quality rubric

The normative answer to "what does best-looking mean?" — the acceptance
checklist the analytics/admin surface spec is judged against. `DESIGN.md` is
the voice; this file is the test. Every line declares its verification tier:

- **[T]** — checked by deterministic tests/gates (coherence sweep, box
  metrics, contrast, `pnpm budget`). Green means checked, not designed.
- **[R]** — checked by the advisory loop: `pnpm shots` + `pnpm review`
  (deterministic sweep + VLM crops), nightly `--require`. Needs a human or
  model to read the crop.
- **[H]** — human judgment only; no checker exists, and inventing one would
  cost more than the drift it catches.

Surfaces are the unit of check, not pages: a page is a composition of
surfaces, and page-level checks live in the Composition section. The four
acceptance pages (Analytics, Accounting, Tasks, Settings) additionally get a
composition spot-check each.

## Normative dimensions

1. **Spacing rhythm [T/R]** — every gap lands on the 4px rhythm; card padding,
   section gaps and page gutters use the DESIGN.md spacing roles, never
   one-off values.
2. **Density as default [R]** — 28px controls, 14/20 interface text, 12/16
   captions; compact is the normal setting. A surface that needs more air
   than DESIGN.md's roles is mis-scaled, not polished.
3. **Alignment [R/H]** — charts, tables, KPI cards and toolbars on a page
   share edges and column rhythm; numbers align right with `tnum`; nothing
   floats by a few pixels from its neighbours.
4. **States [T/R]** — empty, loading and error render on every surface that
   can exist in them, via `DataState`/skeletons, with no layout jump between
   them.
5. **Motion as state, not entrance [R/H]** — transitions mark changes of
   state only; no entrance animations, no staggered reveals; reduced motion
   is respected.
6. **Visibility without colour [T]** — error carries a message, selection
   carries `aria-current`/`data-state`, focus carries an outline; contrast
   pairs are AA-gated by `contrast.test.ts`.
7. **Type discipline [T/R]** — headings tighten as they grow, metrics are
   tabular, one typeface; hierarchy from size/weight/tracking only.

## Surface checklists

### Table

- Rows keep height and horizontal padding under every density [T].
- Sort/filter/pagination chrome never reflows the header row [R].
- Empty/loading/error replace the body without moving the toolbar [T].
- Selection, focus and sort state are legible without colour [T].
- Column alignment: numbers right, text left, headers match their column [R].
- No truncated cell text without a tooltip/ellipsis escape hatch [T].

### Chart

- Every chart renders its `ChartContainer` states (title, loading, error,
  empty) [T].
- Legends, axes and gridlines use token colours in both themes [T].
- Series palettes follow the chart-only vocabulary (incl. orange/yellow)
  and stay distinguishable for common colour-vision types [R].
- Interactions (tooltip, highlight, zoom) have keyboard-accessible twins
  and an a11y fallback table [T].
- Chart height is fixed per surface type; charts never resize on hover [R].

### KPI / stat

- Metric values are `tnum`, right-aligned within a stat group [T].
- Delta tone signals goodness, not direction, and reads without colour [T].
- Sparklines (where present) align to the same baseline across a row [R].
- Loading skeleton matches the final value width closely [R].

### Form

- Every field uses the P5 labelling contract; errors bind to the field [T].
- Field heights and gaps match the 28px/12px rhythm, in any layout [T].
- Multi-section forms keep section headers at a constant rhythm [R].
- Validation messages appear without layout shift [R].
- Disabled/read-only states are distinguishable without colour [T].

### List / feed

- Row heights are constant within a list instance [T].
- Long text truncates with ellipsis + accessible full-text escape [T].
- Group/divider rhythm follows the 4px scale [R].
- Selection/hover/focus states are visible without colour [T].

### Dialog / overlay

- Panels portal-mount and hit-test above siblings; Escape closes [T].
- Overlay radius/padding follow DESIGN.md's overlay role (12px / 16px) [T].
- Focus lands in the panel and returns to the trigger [T].
- Content fits 375px without sideways scroll [T].
- Scroll behaviour: one scroll container, no phantom scrollbars [T].

### Toolbar / header

- Actions follow the one-working-accent rule: at most one blue-filled
  control per surface [R].
- Overflow collapses into a menu rather than wrapping or clipping [T].
- Title, breadcrumb and actions keep their baseline grid across pages [R].

## Page composition (acceptance spot-checks)

- **Analytics** — KPI row, charts and table share column rhythm; the
  time-range/filter chrome is one control cluster, not three; every surface
  shows its states.
- **Accounting** — period bar, ranking and ledger align; numeric columns
  align across the page; reports degrade gracefully on narrow viewports.
- **Tasks** — board/table views keep identical row metrics; bulk-action
  state appears without reflow.
- **Settings** — config forms follow the form checklist end to end; tabs/
  sections keep constant rhythm; unsaved-state visibility without colour.

## What the rubric does not cover

Contrast math, box metrics, route budgets, disposal and memory are already
gated by tests — the rubric references them but never restates them as
taste. A rubric line whose check is fully mechanized belongs in the sweep,
not here.
