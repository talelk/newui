# @talelk/newui-tokens

## 0.2.0

### Minor Changes

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

## 0.1.1

### Patch Changes

- 80fcde4: Design-system polish sweep: exhaustive, tokenized foundations (motion, radius roles, density, z-layer scale, dark elevation) now consumed consistently across atoms, molecules, organisms, templates, charts and editors via shared `control-styles` recipes instead of per-component one-offs. New props in existing vocabulary: `NumberInput`/`PinInput` gain `size`/`variant`, `Dropdown` gains `disabled`, `IconButton` gains `loading`. `Button` loading no longer sets the native `disabled` attribute. Renames/removals: the `data-color` hook becomes `data-theme`, and `KanbanTone` drops the unused `violet` value. The playground and starter screens adopt the same foundations.

## 0.1.0

### Minor Changes

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
- 6fda044: Default control sizing is now sm (28px), including buttons, text entry, selectors,
  date/time triggers, tabs, toggle groups and pagination. Explicit md remains 32px;
  checkboxes, radios and avatars retain their geometry. Consumers that require the
  previous default should pass size="md". Cards default to 12px padding; pass
  padding="md" for the previous 16px. Chart cards, editor toolbar commands and blocks use compact spacing.
  Page, section, metric and hero typography now follow 24/30, 18/24, 28/32 and
  36/40px respectively. Existing semantic colors and dialog padding are retained.
- ba4540f: Stacking and motion become named scales from `@talelk/newui-tokens`: `z-raised`,
  `z-floating`, `z-overlay`, `z-top`, `duration-fast/base/slow` and
  `ease-standard` resolve `@theme` variables instead of components hard-coding
  `z-50`, `z-[100]` and numeric durations. Computed values are unchanged. The
  disclosure chevron keeps its literal 200ms, paired with the
  `disclosure-panel` utility's timing.

## 0.0.1

### Patch Changes

- 295ab1d: Fix two styling bugs that made components render wrong without erroring.

  **Chart palette was invisible.** `chartVariables()` pointed `--chart-1…8` at
  one-digit ramp shades (`var(--blue-6)`), but the ramps are keyed by Tailwind's
  `50…950` scale (`--blue-600`). Nothing named `--blue-6` exists, so every
  `--chart-*` was guaranteed-invalid and every consumer — the whole
  `@talelk/newui-charts` family, `bg-chart-*` swatches — fell back to `transparent`.
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
