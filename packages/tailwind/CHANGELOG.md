# @newui/tailwind

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

### Minor Changes

- 6fda044: Default control sizing is now sm (28px), including buttons, text entry, selectors,
  date/time triggers, tabs, toggle groups and pagination. Explicit md remains 32px;
  checkboxes, radios and avatars retain their geometry. Consumers that require the
  previous default should pass size="md". Cards default to 12px padding; pass
  padding="md" for the previous 16px. Chart cards, editor toolbar commands and blocks use compact spacing.
  Page, section, metric and hero typography now follow 24/30, 18/24, 28/32 and
  36/40px respectively. Existing semantic colors and dialog padding are retained.
- ba4540f: Stacking and motion become named scales from `@newui/tokens`: `z-raised`,
  `z-floating`, `z-overlay`, `z-top`, `duration-fast/base/slow` and
  `ease-standard` resolve `@theme` variables instead of components hard-coding
  `z-50`, `z-[100]` and numeric durations. Computed values are unchanged. The
  disclosure chevron keeps its literal 200ms, paired with the
  `disclosure-panel` utility's timing.

### Patch Changes

- 6fda044: Refresh workspace dependencies to current stable releases. The Vite integration
  now requires Vite ^8.3.4. Consumer runtime dependencies, Solid development
  versions and Tailwind tooling are updated together; application examples migrate
  to TanStack Table 9. Type checking uses TypeScript 7, with Microsoft's TypeScript 6
  compatibility API retained for ESLint. Tests use Vitest 5 and Playwright 1.64.1.
  
  Keep visible labels in accessible names for calendar view controls and example
  actions; treat custom navigation avatars as decorative beside their labels.
  The updated axe checks stay enabled.
- Updated dependencies [6fda044]
- Updated dependencies [6fda044]
- Updated dependencies [ba4540f]
  - @newui/tokens@0.1.0

## 0.0.1

### Patch Changes

- 295ab1d: Fix two styling bugs that made components render wrong without erroring.

  **Chart palette was invisible.** `chartVariables()` pointed `--chart-1…8` at
  one-digit ramp shades (`var(--blue-6)`), but the ramps are keyed by Tailwind's
  `50…950` scale (`--blue-600`). Nothing named `--blue-6` exists, so every
  `--chart-*` was guaranteed-invalid and every consumer — the whole
  `@newui/charts` family, `bg-chart-*` swatches — fell back to `transparent`.
  The pointers now name the real steps, and a token test asserts that every
  `--a: var(--b)` in the generated stylesheet names a declared token.

  **Borderless native inputs drew their own border.** `@tailwindcss/forms`
  resets every text control to a 1px `gray-500` border, a white fill,
  `padding: 0.5rem 0.75rem`, a 16px font and a blue focus ring. Our recipes own
  all of that, so the reset leaked into the one place that deliberately wants
  none of it: the bare `<input>` inside `Combobox`, `MultiSelect`, `DatePicker`,
  `TimePicker`, `DateRangePicker` and `DateTimePicker` rendered as a bordered
  16px box inside the field's own 14px surface. The reset is now neutralised in
  the base layer, once, instead of being restated per recipe; utilities still
  win, and checkboxes/radios/file inputs stay with the plugin.

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

- Updated dependencies [295ab1d]
  - @newui/tokens@0.0.1
