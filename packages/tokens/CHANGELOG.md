# @newui/tokens

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
