# @newui/tailwind

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
