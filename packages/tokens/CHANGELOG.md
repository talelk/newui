# @talelk/newui-tokens

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
