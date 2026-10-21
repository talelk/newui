# Design deltas — Inputs

> Historical Frappe comparison from before the analytics redesign. The current
> [visual-system contract](visual-system.md) and component contracts supersede
> the old density, radius and colour targets below. The original comparison is
> retained as reference evidence.
> Package paths below predate the atomic split; see current component contracts.

A visual/design parity audit of the input components in `@newui/ui` against
their frappe-ui originals (`frappe-ui-main/src/components/`). This is an
analysis document only; no component code is changed by it.

- **Ours** = `packages/ui/src/components/<Name>/` (SolidJS).
- **frappe-ui** = `frappe-ui-main/src/components/<Name>/<Name>.vue` (Vue).
- Compared **axis by axis**: size (heights/font), variant/theme colours, state
  (hover/active/disabled/focus), spacing (padding/gap), radius, and structure.

## Classification legend

| value | meaning |
| --- | --- |
| `match` | the class (or the effective geometry/colour) is identical |
| `intentional` | a deliberate difference — see the rules below |
| `unintended` | drift: a class difference not explained by the rules below |

Rules applied (from the audit brief, plus the repo's own contrast contract in
`packages/tailwind/src/contrast.test.ts`):

- **Type scale is identical.** Our `text-xs`=12px, `text-sm`=13px,
  `text-base`=14px, `text-lg`=16px, `text-xl`=17px, `text-p-sm`=13px all match
  frappe's tokens. A delta is only real where the *class* differs (a
  `leading-*`, a size class, a height).
- **Contrast shift is intentional.** Where ours uses a *deeper* ink/surface step
  on the same theme than frappe — e.g. `ink-gray-8` vs `ink-gray-7`,
  `text-ink-base` vs `text-white` on a solid fill, or a darker error/placeholder
  step — it is the documented WCAG AA darkening, not drift. Disabled tones are
  exempt by WCAG and are `intentional`.
- Everything else — different radius, size, height, spacing, leading, font-size
  class, a different token *family* (alpha vs solid), or a colour that is
  *lighter* rather than deeper — is `unintended`.

In the tables, a parenthetical in the **axis** cell names the specific reason a
row is `intentional` or `unintended`; the classification cell itself stays one
of the three bare words.

> Note: the reference repo is a moving target. Quotes below are from the
> checkout under `frappe-ui-main/` at audit time.

---

## Size set & prop surface differences (top)

These components do **not** expose the same size vocabulary and/or prop surface
as frappe-ui. They are structural, not class-level, and are listed here rather
than repeated in every table.

| component | size set (ours → frappe-ui) | prop-surface difference |
| --- | --- | --- |
| TextInput | `xs\|sm\|md\|lg` → same | ours `value`/`onInput`/`onChange` (Solid); frappe adds `debounce`, `modelValue` |
| Textarea | `xs\|sm\|md\|lg` → same | frappe adds `debounce`; ours adds nothing |
| Password | `xs\|sm\|md\|lg` → same | ours `value`/`defaultValue`/`onValueChange`; frappe `modelValue` |
| NumberInput | ours only — **no frappe-ui counterpart** | n/a |
| Checkbox | none → `xs\|sm\|md` (`ToggleSize`) | ours lacks `size`, `padded`; ours adds `description` |
| Switch | none → `xs\|sm\|md` (`ToggleSize`) | ours lacks `size`, `padded`, `controlPosition`, `icon`; ours adds `description` |
| RadioGroup | none → `xs\|sm\|md` (`ToggleSize`) | ours takes `items[]` + `label`; frappe takes `<Radio>` children and adds `padded`, `loop`, `name`, `description`, `error`, `required` |
| Select | none → `xs\|sm\|md\|lg` | ours has `multiple` + `value: string[]`; frappe is single-valued with `variant`, `emptyText`, `side`/`align`/`offset`, option `icon`/`description`/`slot`, and trigger/item/footer slots |
| Combobox | `xs\|sm\|md\|lg` → same | ours lacks `trigger` modes, grouped/custom options, `loading`, `hideSearch`, `filterable`, `side`/`align`/`offset`, `query`, slots |
| MultiSelect | `xs\|sm\|md\|lg` → same | ours lacks grouped options, `loading`, `hideSearch`, `filterable`, `query`, slots; frappe's trigger is a button summary, not inline chips |
| DatePicker | `xs\|sm\|md\|lg` → same | ours is single-date only; frappe also ships `DateRangePicker`/`DateTimePicker`, plus `format`, `typeable`, `keepOpen`, `openOnFocus`/`openOnClick`, `side`/`align`/`offset`; ours adds `min`/`max`/`locale`/`readonly`, and `clearable` defaults to off (frappe: on) |
| TimePicker | `xs\|sm\|md\|lg` → same | ours lacks `format`, `side`/`align`/`offset`; ours adds `defaultOpen` |
| Duration | `xs\|sm\|md\|lg` → same | ours `value`/`defaultValue`/`onValueChange`; frappe `modelValue` |
| FileUploader | n/a | **different component**: ours is a Zag dropzone returning `File`/`File[]` (`accept`/`multiple`/`maxFiles`/`maxFileSize`/`transformFiles`, P5 labelling); frappe is an upload button that POSTs to Frappe (`private`/`folder`/`doctype`/`docname`/`fieldname`/`uploadEndpoint`/`optimize`/`validateFile`/`fileTypes`, `success`/`failure`) |
| Slider | none → `sm\|md` (`RangeSize`) | ours lacks `size`; frappe emits `value-commit` |
| Rating | none → `xs\|sm\|md\|lg` | ours: `count`, `readonly`, `icon(index)`; frappe: `max`, `step` (0.5 half-stars), `size`, `icon(string\|Component)`, `description`/`error` |
| FormControl | shared `size` | frappe forwards *all* attrs and slots and supports `daterange`/`datetime`/`time`; ours is a typed union (`date` only), no slot forwarding, no ref `focus()` |
| FormLabel | n/a | ours adds `labelId`, `disabled`; frappe is `label`/`id`/`required` |
| ErrorMessage | n/a | frappe renders sanitized `v-html`; ours renders text only (P10) |
| Field / InputLabeling | n/a | frappe's `InputLabel` has a `color` axis (`gray-6`/`gray-7`); our `Field` label is fixed `ink-gray-6` |

---

## Cross-cutting deltas

These recur in several components and are quoted per component below.

1. **Overlay shell.** Ours (Select, Combobox, MultiSelect, DatePicker,
   TimePicker content) uses
   `rounded-5 border border-outline-gray-1 bg-surface-elevation-1 shadow-lg`.
   frappe's shared `PopoverPanel` uses
   `rounded-6 bg-surface-elevation-2 shadow-2xl ring-1 ring-black ring-opacity-5`.
   → radius `10px` vs `12px`, elevation-1 vs elevation-2, and a border+`shadow-lg`
   vs a hairline ring+`shadow-2xl`. **unintended** (cross-component).
2. **Option-row highlight.** Ours uses `data-[highlighted]:bg-surface-gray-3`
   (a solid gray). frappe's shared `itemClasses` uses
   `data-[highlighted]:bg-surface-alpha-gray-2` plus
   `data-[state=checked]:bg-surface-gray-3` and
   `data-[highlighted]:data-[state=checked]:bg-surface-gray-4` (alpha family).
   **unintended**.
3. **Placeholder tone.** Ours `placeholder:text-ink-gray-6`; frappe
   `placeholder-ink-gray-4`. Ours is the tested "muted on gray-2" pairing
   (`contrast.test.ts`), i.e. the deeper AA step. **intentional**.
4. **Subtle-input hover border.** Ours `hover:border-outline-gray-3`; frappe
   `hover:border-outline-elevation-2`. Different token family. **unintended**.
5. **Inline field error tone.** Ours `text-ink-red-7`; frappe `InputError`
   `text-ink-red-5` (frappe's *standalone* `ErrorMessage` is also `red-7`).
   Ours is the deeper AA step. **intentional**.
6. **Standalone `ErrorMessage` type.** Ours `text-p-sm` (13px / 1.5 / 0.015em);
   frappe `text-sm` (13px / 1.35 / 0.02em). Same size, different leading and
   tracking class. **unintended**.

---

## TextInput

`packages/ui/src/components/TextInput/TextInput.tsx` vs
`frappe-ui-main/src/components/TextInput/TextInput.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| size heights | `xs h-6`, `sm h-7`, `md h-8`, `lg h-10` | identical | match |
| size font | `xs text-xs`, `sm text-base`, `md text-base`, `lg text-lg` | identical | match |
| radius | `xs rounded-3`, `sm rounded-4`, `md rounded-4`, `lg rounded-5` | identical | match |
| horizontal padding | `ps-2 pe-2` (sm), prefix `ps-8`, suffix `pe-8` | identical | match |
| vertical padding (fixed-height input) | none | `py-1.5` (sm/md/lg), `py-1` (xs) | intentional |
| subtle surface | `border-surface-gray-2 bg-surface-gray-2` | `border-[--surface-gray-2] bg-surface-gray-2` | match |
| subtle hover border (token family) | `hover:border-outline-gray-3` | `hover:border-outline-elevation-2` | unintended |
| placeholder (deeper AA step) | `placeholder:text-ink-gray-6` | `placeholder-ink-gray-4` | intentional |
| focus | `focus:border-outline-gray-4 focus:bg-surface-base focus:shadow-sm` | identical | match |
| text colour | `text-ink-gray-8` | `text-ink-gray-8` | match |
| disabled text (disabled tone) | `text-ink-gray-6` | `text-ink-gray-5` | intentional |
| disabled surface | `bg-surface-gray-1 placeholder:text-ink-gray-3` | identical | match |
| disabled border | keeps the variant border (`border-surface-gray-2`) | forces `border-transparent` (subtle/ghost) | unintended |
| leading / transition | `leading-tighter transition-colors` | identical | match |

## Textarea

`packages/ui/src/components/Textarea/Textarea.tsx` vs
`frappe-ui-main/src/components/Textarea/Textarea.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| size font | `xs text-xs`, `sm text-base`, `md text-base`, `lg text-lg` | `text-p-sm` at **every** size (flat 13px) | unintended |
| min height | none (relies on `rows=3`) | `xs min-h-8`, `sm min-h-9`, `md min-h-10`, `lg min-h-11` | unintended |
| radius | `xs rounded-3`, `sm/md rounded-4`, `lg rounded-5` | identical | match |
| padding | `xs py-1 px-1.5`, `sm py-1.5 px-2`, `md py-1.5 px-2.5`, `lg py-1.5 px-3` | identical | match |
| subtle hover | `hover:bg-surface-gray-3` (no border change) | `hover:border-outline-elevation-2 hover:bg-surface-gray-3` | unintended |
| outline hover | `hover:border-outline-gray-3` | identical | match |
| placeholder (deeper AA step) | `placeholder:text-ink-gray-6` | `placeholder-ink-gray-4` | intentional |
| display / resize | `w-full resize-y` (no `block`) | `w-full block` (default resize) | unintended |
| disabled text (disabled tone) | `text-ink-gray-6` | `text-ink-gray-5` | intentional |

## Password

`packages/ui/src/components/Password/Password.tsx` vs
`frappe-ui-main/src/components/Password/Password.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| field geometry | inherits `TextInput` (see above) | inherits `TextInput` | match |
| toggle button size | `size-6` (24px) | `size-5` (20px) | unintended |
| toggle radius | `rounded-3` | `rounded-3` | match |
| toggle colour | `text-ink-gray-5 hover:text-ink-gray-7` | identical | match |
| toggle hover bg | `hover:bg-surface-gray-3` | `hover:bg-surface-gray-3` | match |
| toggle disabled (disabled tone) | `disabled:pointer-events-none disabled:text-ink-gray-4` | `disabled:pointer-events-none` (no colour) | intentional |
| icon size | `size-3.5` | `size-3.5` | match |
| tooltip shortcut (component vocabulary) | text `⌘I` inline | `KeyboardShortcut combo="Mod+I"` component | intentional |
| masked value (Show vs v-show) | `Show` unmounts the toggle | `v-show` keeps it in the DOM | intentional |

## NumberInput (ours only)

`packages/ui/src/components/NumberInput/NumberInput.tsx`. frappe-ui has no
`NumberInput`; there is nothing to diff against.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| control surface (ours only) | `rounded-4 border border-outline-gray-2 bg-surface-base` | — | intentional |
| input (ours only) | `px-2 py-1.5 text-base text-ink-gray-8 placeholder:text-ink-gray-6` | — | intentional |
| steppers (ours only) | `w-6` column, `divide-y divide-outline-gray-2 border-l`, `text-ink-gray-6 hover:bg-surface-gray-2` | — | intentional |
| focus (ours only) | `focus-within:focus-ring` | — | intentional |

## Checkbox

`packages/ui/src/components/Checkbox/Checkbox.tsx` vs
`frappe-ui-main/src/components/Checkbox/Checkbox.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| size (at `sm`; size axis missing) | `size-3.5` fixed | `sm w-3.5 h-3.5` (also `xs`, `md`) | match |
| radius | `rounded-1` | `rounded-1` | match |
| unchecked border (ours is lighter) | `border-outline-gray-3` | `border-outline-gray-4` | unintended |
| checked fill (deeper AA step) | `text-ink-gray-9` (drives `currentColor`) | `text-[color:var(--surface-gray-10)]` | intentional |
| hover | `hover:border-outline-gray-4` | `hover:border-outline-gray-5` | unintended |
| active (missing state) | none | `active:border-outline-gray-6`, `active:text-…surface-gray-8` | unintended |
| label size | `text-base` (14px) | `text-sm` (13px, via `InputLabel`) | unintended |
| label colour (deeper AA step) | `text-ink-gray-8` / disabled `text-ink-gray-4` | `gray-7` / disabled `gray-4` | intentional |
| label leading | `leading-tighter` | `leading-tighter` (InputLabel base) | match |
| description | `ps-[1.35rem] text-p-sm text-ink-gray-6` | `ps-[1.35rem] mt-1` + `text-p-sm text-ink-gray-6` | match |
| disabled surface (disabled tone) | `disabled:border-outline-gray-3 disabled:bg-surface-base` | `bg-surface-base border-outline-gray-3` + `text-[color:var(--surface-gray-5)]` | intentional |

## Switch

`packages/ui/src/components/Switch/Switch.tsx` vs
`frappe-ui-main/src/components/Switch/Switch.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| track size (at `sm`; size axis missing) | `h-4 w-[26px]` | `sm h-4 w-[26px]` (also `xs`, `md`) | match |
| track radius / border | `rounded-full border-2 border-transparent` | `rounded-full border-transparent` + `border-2` (sm) | match |
| off track | `bg-surface-gray-4`, hover `bg-surface-gray-5` | `bg-surface-gray-4`, hover `bg-surface-gray-5` | match |
| on track | `bg-surface-gray-10`, hover `bg-surface-gray-9` | `bg-surface-gray-10`, hover `bg-surface-gray-9` | match |
| active / group-hover (missing states) | none | `active:bg-surface-gray-6` (off) / `active:bg-surface-gray-8` (on), `group-hover:enabled:bg-surface-gray-9/5` | unintended |
| thumb | `size-3 rounded-full bg-surface-base shadow` | `h-3 w-3 rounded-full bg-surface-base shadow ring-0` | match |
| thumb travel | `data-[state=checked]:translate-x-2.5` | `translate-x-2.5` (checked) | match |
| layout order (opposite sides) | control **first**, then label (`inline-flex … gap-3`) | label **first**, control trailing (`justify-between gap-x-3`) | unintended |
| label size | `text-base` (14px) | `text-sm` (13px, via `InputLabel`) | unintended |
| label colour (deeper AA step) | `text-ink-gray-8` | `gray-7` | intentional |
| label leading | `leading-tighter` | `leading-tight` | unintended |
| description | `text-p-sm text-ink-gray-6` | `text-p-sm text-ink-gray-6` | match |

## RadioGroup / Radio

`packages/ui/src/components/RadioGroup/RadioGroup.tsx` vs
`frappe-ui-main/src/components/Radio/RadioGroup.vue` + `Radio.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| group layout (gap) | `flex flex-col gap-2`; horizontal `flex-row flex-wrap gap-4` | vertical `gap-y-1.5`, horizontal `gap-x-4`, `mt-1.5` under label | unintended |
| group label size | `text-base font-medium` | `InputLabel` → `text-sm` | unintended |
| group label colour (deeper AA step) | `text-ink-gray-8` | `gray-7` | intentional |
| item row (alignment model) | `inline-flex items-center gap-2 rounded-4` | `flex items-start gap-2 rounded-4` + first-line offset | unintended |
| circle size (at `sm`; size axis missing) | `size-3.5` | `sm size-3.5` | match |
| unchecked ring (ours is lighter) | `border-outline-gray-3` | `border-outline-gray-4` | unintended |
| checked ring | `border-4 border-surface-gray-10` | `group-data-[state=checked]:border-4 border-[color:var(--surface-gray-10)]` | match |
| hover / active (missing states) | none | `group-hover:border-outline-gray-5`, `group-active:border-outline-gray-6` (and surface-9/8 when checked) | unintended |
| option label colour (deeper AA step) | `text-ink-gray-8` | `text-ink-gray-7` | intentional |
| option label leading | `leading-tighter` | `leading-normal` | unintended |
| disabled (disabled tone) | `opacity-60` on the row | `cursor-not-allowed` + `gray-4` label + `surface-5` checked ring | intentional |
| description / error (prop surface) | none | per-option `description` (`text-sm leading-normal`) and group `error` | intentional |

## Select

`packages/ui/src/components/Select/Select.tsx` vs
`frappe-ui-main/src/components/Select/Select.vue` (+ `Select/utils.ts`,
`shared/selection/utils.ts`).

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| default surface (different default variant) | `border-outline-gray-2 bg-surface-base` (outline look) | `subtle` default: `border-[--surface-gray-2] bg-surface-gray-2` | unintended |
| trigger height | `px-2 py-1.5 text-base` (≈31px) | `sm min-h-7 rounded-4 px-2` (28px) | unintended |
| trigger radius | `rounded-4` | `rounded-4` | match |
| trigger text (deeper AA step) | `text-base text-ink-gray-8` | `text-base text-ink-gray-7` | intentional |
| chevron (size + colour) | custom `<svg class="size-3">` | `lucide-chevron-down size-4 text-ink-gray-4` | unintended |
| focus (implementation) | `focus-within:focus-ring` | `data-[state=open]:focus-ring` on the trigger | intentional |
| content shell (cross-cutting #1) | `rounded-5 border border-outline-gray-1 bg-surface-elevation-1 shadow-lg` | `rounded-6 bg-surface-elevation-2 shadow-2xl ring-1 ring-black ring-opacity-5` | unintended |
| item radius / height | `rounded-3 px-2 py-1.5 text-base` | `rounded-4` + `min-h-7 px-2 py-1.5 text-base` | unintended |
| item highlight (cross-cutting #2) | `data-[highlighted]:bg-surface-gray-3` | `data-[highlighted]:bg-surface-alpha-gray-2` | unintended |
| item selected | `data-[state=checked]:text-ink-blue-6` | `data-[state=checked]:bg-surface-gray-3` (+ alpha on hover) | unintended |
| item indicator | custom `<svg class="size-3"> text-ink-blue-6` | `lucide-check size-4 text-ink-gray-6` | unintended |
| item disabled | `data-[disabled]:text-ink-gray-4` | `data-[disabled]:text-ink-gray-4` | match |
| positioning (machine difference) | always popper `bottom-start`, `gutter: 4` | default **item-aligned** over the trigger | intentional |

## Combobox

`packages/ui/src/components/Combobox/Combobox.tsx` vs
`frappe-ui-main/src/components/Combobox/Combobox.vue` (+ `Combobox/utils.ts`).

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| size | `xs h-6`, `sm h-7`, `md h-8`, `lg h-10` | `triggerSizeClasses`: `min-h-6/7/8/10` | match |
| radius / font | `rounded-3/4/4/5`, `text-xs/base/base/lg` | identical | match |
| subtle surface | `border-surface-gray-2 bg-surface-gray-2 hover:bg-surface-gray-3` | `border-[--surface-gray-2] bg-surface-gray-2 hover:bg-surface-gray-3` | match |
| subtle hover border (cross-cutting #4) | `hover:border-outline-gray-3` | `hover:border-outline-elevation-2` | unintended |
| input padding | `px-2` on the input | `p-0`; padding lives on the anchor (`px-2`) | match |
| placeholder (deeper AA step) | `placeholder:text-ink-gray-6` | `placeholder:text-ink-gray-4` | intentional |
| input text | `text-inherit` (from trigger `text-ink-gray-8`) | `text-ink-gray-8` | match |
| chevron | `lucide-chevron-down size-4` in a `size-6` button | `lucide-chevron-down size-4 text-ink-gray-6` in a shrink-0 trigger | match |
| content shell (cross-cutting #1) | `max-h-60 rounded-5 border border-outline-gray-1 bg-surface-elevation-1 shadow-lg` | `rounded-6 bg-surface-elevation-2 shadow-2xl ring-1 ring-black ring-opacity-5` | unintended |
| item row (as Select) | `rounded-3`, `bg-surface-gray-3` highlight, `text-ink-blue-6` checked | `rounded-4`, `bg-surface-alpha-gray-2` highlight, `bg-surface-gray-3` checked | unintended |
| empty state (type class) | `text-sm text-ink-gray-5` | `text-base text-ink-gray-5` | unintended |

## MultiSelect

`packages/ui/src/components/MultiSelect/MultiSelect.tsx` vs
`frappe-ui-main/src/components/MultiSelect/MultiSelect.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| trigger form (structural redesign) | inline chips inside a bordered field | a single button showing `triggerSummary` (`"N selected"`) | intentional |
| size | `min-h-6/7/8/10` + `rounded-3/4/4/5` + `text-xs/base/base/lg` | `triggerSizeClasses` + `inputFontSizeClasses` | match |
| subtle surface | `border-surface-gray-2 bg-surface-gray-2 hover:bg-surface-gray-3` | identical | match |
| chip (no counterpart) | `rounded-3 bg-surface-gray-3 px-1.5 py-0.5 text-xs text-ink-gray-8` | — | intentional |
| chevron | `lucide-chevron-down size-4` | `lucide-chevron-down size-4 text-ink-gray-4` | match |
| content shell (cross-cutting #1) | `rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-1 shadow-lg` | `rounded-6 bg-surface-elevation-2 shadow-2xl ring-1 ring-black ring-opacity-5` | unintended |
| item row (as Select) | `rounded-3`, `bg-surface-gray-3` highlight, `text-ink-blue-6` checked | `rounded-4`, `bg-surface-alpha-gray-2` highlight, `bg-surface-gray-3` checked | unintended |
| footer (different control + type class) | text buttons `text-xs text-ink-gray-6` ("Select all"/"Clear all") | `Button variant="ghost" size="sm"` | unintended |

## DatePicker

`packages/ui/src/components/DatePicker/DatePicker.tsx` vs
`frappe-ui-main/src/components/DatePicker/DatePicker.vue` +
`DateCalendar.vue` + `CalendarPanel.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| trigger (structural: icon button vs chevron) | `SIZE`/`VARIANT` + calendar button | `PickerShell` → `TextInput` + chevron-down | intentional |
| trigger size/variant | `xs\|sm\|md\|lg`, `subtle`/`outline`/`ghost` | identical | match |
| content shell (shell + padding `p-3` vs `p-2`) | `w-fit rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-3` | `PopoverPanel` (`rounded-6 elevation-2 shadow-2xl ring`) + `CalendarPanel p-2` | unintended |
| header label size | `text-base-medium` | `text-sm-medium` | unintended |
| header label colour (deeper AA step) | `text-ink-gray-9` | `text-ink-gray-7` | intentional |
| nav buttons (structural) | custom `grid size-7 place-items-center rounded-4 text-ink-gray-6` | `Button variant="ghost"` | intentional |
| weekday row (size, weight, uppercase, colour) | `size-8 text-xs font-normal text-ink-gray-5` | `size-7 text-xs-medium uppercase text-ink-gray-4` | unintended |
| day cell size / radius / font | `size-8 rounded-3 text-base` | `size-7 rounded-4 text-sm` | unintended |
| selected cell (different surface step) | `data-[selected]:bg-surface-gray-10 data-[selected]:text-ink-base` | `bg-surface-gray-9 text-ink-base hover:bg-surface-gray-9` | unintended |
| today | `data-[today]:font-medium` | `font-semibold` | unintended |
| unavailable | `text-ink-gray-3 line-through` | `opacity-30 cursor-not-allowed` | unintended |
| out-of-month | `data-[outside-range]:text-ink-gray-4` | `text-ink-gray-3` | unintended |
| "Today" action (prop surface) | none | `Button` with `today-label` | intentional |
| views (machine difference) | day → month → year drill-down (Zag) | date grid + month/year split list | intentional |

## TimePicker

`packages/ui/src/components/TimePicker/TimePicker.tsx` vs
`frappe-ui-main/src/components/TimePicker/TimePicker.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| trigger font (frappe forces `text-sm`) | own anchor with `SIZE`/`VARIANT` | `TextInput` with `class="… text-sm"` | unintended |
| size/variant | `xs\|sm\|md\|lg` × `subtle`/`outline`/`ghost` | identical | match |
| placeholder (deeper AA step) | `placeholder:text-ink-gray-6` | `placeholder:text-ink-gray-4` (via TextInput) | intentional |
| chevron | `lucide-chevron-down size-4` in a `size-6` button, `text-ink-gray-6` | `lucide-chevron-down size-4` (colour inherited) | match |
| panel shell (elevation/shadow/border) | `max-h-48 w-44 rounded-6 border border-outline-gray-1 bg-surface-elevation-1 p-1 text-ink-gray-9 shadow-lg` | `max-h-48 w-44 rounded-6 bg-surface-elevation-2 p-1 text-base shadow-2xl ring-1 ring-black ring-opacity-5` | unintended |
| option row | `h-7 rounded-4 px-2 leading-tighter tabular-nums`, `text-ink-gray-6 hover:bg-surface-gray-2 hover:text-ink-gray-8`, `data-[highlighted]:bg-surface-gray-3 data-[highlighted]:text-ink-gray-8` | identical | match |
| selected option | `data-[selected]:bg-surface-gray-3 data-[selected]:text-ink-gray-8` | `bg-surface-gray-3 text-ink-gray-8` | match |

## Duration

`packages/ui/src/components/Duration/Duration.tsx` vs
`frappe-ui-main/src/components/Duration/Duration.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| implementation | re-declares the input's `SIZE`/`PAD`/`VARIANT` maps | wraps `TextInput` | intentional |
| size / radius / font | `h-6/7/8/10`, `rounded-3/4/4/5`, `text-xs/base/base/lg` | identical (via TextInput) | match |
| padding (fixed-height input) | `ps/pe` only | TextInput's `py-1.5` + `ps/pe` | intentional |
| subtle hover border (inherits TextInput drift) | `hover:border-outline-gray-3` | `hover:border-outline-elevation-2` | unintended |
| placeholder (deeper AA step) | `placeholder:text-ink-gray-6` | `placeholder-ink-gray-4` | intentional |
| default placeholder | `1h 30m 45s` | `1h 30m 45s` | match |
| display format | `format` default `short` | `format` default `short` | match |

## FileUploader

`packages/ui/src/components/FileUploader/FileUploader.tsx` vs
`frappe-ui-main/src/components/FileUploader/FileUploader.vue`.

Different components (dropzone vs upload button); class comparison is N/A. The
rows record the structural deltas.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| trigger (structural redesign) | dashed dropzone: `rounded-5 border border-dashed border-outline-gray-2 bg-surface-gray-1 px-4 py-6` | a `Button` labelled "Upload File" | intentional |
| dropzone hover (no counterpart) | `hover:border-outline-gray-3 hover:bg-surface-gray-2` | — | intentional |
| dragging (no counterpart) | `data-[dragging]:border-outline-blue-4 data-[dragging]:bg-surface-blue-2` | — | intentional |
| invalid (no counterpart) | `data-[invalid]:border-outline-red-2` | `ErrorMessage` below the button | intentional |
| accepted item (no counterpart) | `rounded-4 border border-outline-gray-2 bg-surface-base px-2 py-1.5 text-base text-ink-gray-8` | — | intentional |
| rejected item | `border-outline-red-2 bg-surface-red-2 text-ink-red-7` | `ErrorMessage` (`text-ink-red-7`) | match |
| labelling (our contract) | P5 `label`/`description`/`error`/`required` | none (slot + `ErrorMessage`) | intentional |

## Slider

`packages/ui/src/components/Slider/Slider.tsx` vs
`frappe-ui-main/src/components/Slider/Slider.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| root height (at `sm`; size axis missing) | `h-4` fixed | `sm h-4` (also `md h-5`) | match |
| track | `h-1 rounded-4 bg-surface-gray-3`, disabled `bg-surface-gray-2` | identical | match |
| range | `rounded-4 bg-surface-gray-10`, disabled `bg-surface-gray-4` | identical | match |
| thumb size (at `sm`; size axis missing) | `size-4` | `sm size-4` (also `md size-5`) | match |
| thumb surface (dark-mode contrast) | `bg-surface-base shadow-md` | `bg-surface-base shadow-md dark:bg-surface-gray-10` | unintended |
| thumb ring (raw palette vs token) | `hover:ring-[6px] hover:ring-outline-gray-3/40` | `hover:ring-[6px] ring-gray-600/20 dark:ring-gray-100/20` | unintended |
| focus | `focus-visible:focus-ring` | global `:focus-visible` | match |
| bidirectional fill (negative ranges) | relies on Zag's range (fills from `min`) | computes fill from zero when `min < 0` | unintended |

## Rating

`packages/ui/src/components/Rating/Rating.tsx` vs
`frappe-ui-main/src/components/Rating/Rating.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| star size (at `sm`; size axis missing) | `size-4` fixed | `sm size-4` (also `xs/md/lg`) | match |
| empty star | `text-ink-gray-3` | `text-gray-300 dark:text-gray-600` | match |
| filled star (amber-6 vs yellow-500) | `data-[highlighted]:text-ink-amber-6` | `text-yellow-500` | unintended |
| preview / removing (missing states) | not distinguished (single `highlighted`) | `text-yellow-200` / `text-yellow-300` | unintended |
| half stars (prop surface) | not supported (no `step`) | `step: 0.5` with clipped halves | intentional |
| label size + weight | `text-base font-medium` | `InputLabel` → `text-sm` | unintended |
| label colour (deeper AA step) | `text-ink-gray-8` | `gray-6` | intentional |
| description / error (prop surface) | none | `InputDescription` + `InputError` | intentional |

## FormControl

`packages/ui/src/components/FormControl/FormControl.tsx` vs
`frappe-ui-main/src/components/FormControl/FormControl.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| dispatch (prop surface) | typed union (`text`…`date`, `combobox`, `multiselect`, `select`, `checkbox`, `textarea`) | dynamic `<component :is>`; adds `daterange`, `datetime`, `time` | intentional |
| attrs (Solid typing) | per-type explicit props | forwards every attr + all slots by name | intentional |
| full width | select-like types fill via their own roots | forces `w-full` for select/combobox/multiselect/date/time | match |
| checkbox size clamp (prop surface) | n/a (no size axis on `Checkbox`) | clamps `lg` → `md` for `type="checkbox"` | intentional |
| ref (prop surface) | none | `defineExpose({ focus })` | intentional |
| styling | delegates entirely to the child control | delegates entirely to the child control | match |

## FormLabel

`packages/ui/src/components/FormLabel/FormLabel.tsx` vs
`frappe-ui-main/src/components/FormLabel/FormLabel.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| base type | `block text-sm leading-tighter` | `block text-sm leading-tighter` | match |
| colour (disabled is an added prop) | `text-ink-gray-6` (disabled `text-ink-gray-4`) | `text-ink-gray-6` | match |
| required mark | `text-ink-red-5` + `sr-only (required)` | `RequiredIndicator` `text-ink-red-5` + `sr-only (required)` | match |
| required spacing | literal `' *'` (leading space inside the span) | `*` (no leading space) | unintended |

## ErrorMessage

`packages/ui/src/components/ErrorMessage/ErrorMessage.tsx` vs
`frappe-ui-main/src/components/ErrorMessage/ErrorMessage.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| type (`text-p-sm` vs `text-sm`: 1.5 vs 1.35 leading, 0.015 vs 0.02em) | `whitespace-pre-line text-p-sm text-ink-red-7` | `whitespace-pre-line text-sm text-ink-red-7` | unintended |
| colour | `text-ink-red-7` | `text-ink-red-7` | match |
| role | `role="alert"` | `role="alert"` | match |
| content (P10, no HTML injection) | text only | sanitized `v-html` | intentional |

## Field / InputLabeling

`packages/ui/src/lib/field.tsx` vs
`frappe-ui-main/src/components/InputLabeling/*` (InputLabel,
InputDescription, InputError, RequiredIndicator, LabelingWrapper).

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| wrapper | `space-y-1.5` | `space-y-1.5` | match |
| label type | `block text-sm leading-tighter` | `block text-sm leading-tighter` | match |
| label colour | `text-ink-gray-6` (disabled `text-ink-gray-4`) | `gray-6` (disabled `gray-4`); optional `gray-7` | match |
| description | `text-p-sm`, `gray-6` / disabled `gray-4` | `text-p-sm`, `gray-6` / disabled `gray-4` | match |
| error type | `whitespace-pre-line text-p-sm` | `text-p-sm whitespace-pre-line` | match |
| error colour (deeper AA step; matches frappe's standalone ErrorMessage) | `text-ink-red-7` | `text-ink-red-5` | intentional |
| required mark | `text-ink-red-5` + `sr-only` | `RequiredIndicator` `text-ink-red-5` + `sr-only` | match |

---

## Unintended deltas to fix

Grouped, most impactful first.

1. **Overlay shell (cross-cutting).** Select, Combobox, MultiSelect, DatePicker
   and TimePicker panels use `rounded-5 border border-outline-gray-1
   bg-surface-elevation-1 shadow-lg` instead of frappe's
   `rounded-6 bg-surface-elevation-2 shadow-2xl ring-1 ring-black
   ring-opacity-5`.
2. **Option-row highlight (cross-cutting).** `data-[highlighted]:bg-surface-gray-3`
   vs frappe's `data-[highlighted]:bg-surface-alpha-gray-2` (+ `data-[state=checked]`
   backgrounds). Affects Select / Combobox / MultiSelect.
3. **Subtle-input hover border (cross-cutting).** `hover:border-outline-gray-3`
   vs `hover:border-outline-elevation-2` in TextInput, Textarea, Duration,
   Combobox, Select, MultiSelect.
4. **Select default surface.** Ours renders the `outline` look
   (`bg-surface-base border-outline-gray-2`) where frappe's default is `subtle`
   (`bg-surface-gray-2`).
5. **Select trigger height.** `px-2 py-1.5 text-base` (≈31px) vs `min-h-7` (28px).
6. **Textarea type + height.** Ours scales the font (`text-xs`/`text-base`/
   `text-lg`); frappe is a flat `text-p-sm` (13px) at every size and uses
   `min-h-8/9/10/11`. Ours also lacks frappe's subtle `hover:border-…` and
   `block`.
7. **Switch control position.** Ours puts the control *before* the label; frappe
   puts the label first and the switch trailing (`justify-between`). Ours also
   has no `size`/`padded`/`controlPosition`/`icon`.
8. **Toggle label typography.** Checkbox/Switch labels are `text-base` (14px)
   where frappe's `InputLabel` renders `text-sm` (13px); Radio label leading is
   `leading-tighter` vs frappe's `leading-normal`; Switch label leading
   `leading-tighter` vs `leading-tight`.
9. **Toggle borders and states.** Checkbox/Radio unchecked border is
   `outline-gray-3` (lighter) vs frappe's `outline-gray-4`; hover/active border
   states and Switch `active`/`group-hover` states are missing.
10. **DatePicker calendar geometry.** Cells `size-8 rounded-3 text-base` vs
    `size-7 rounded-4 text-sm`; weekdays `size-8 text-xs font-normal
    text-ink-gray-5` vs `size-7 text-xs-medium uppercase text-ink-gray-4`;
    content padding `p-3` vs `p-2`; selected cell `bg-surface-gray-10` vs
    `bg-surface-gray-9`; today `font-medium` vs `font-semibold`; unavailable
    `line-through` vs `opacity-30`.
11. **Select/Combobox item row.** `rounded-3` vs `rounded-4`; selected
    `text-ink-blue-6` vs `bg-surface-gray-3`; custom `size-3` check vs
    `lucide-check size-4 text-ink-gray-6`; empty state `text-sm` vs `text-base`.
12. **MultiSelect footer.** Text buttons (`text-xs text-ink-gray-6`) instead of
    `Button variant="ghost" size="sm"`.
13. **Slider dark-mode thumb.** `bg-surface-base` (dark ≈ `0.205`) on a
    `surface-gray-3` (`0.341`) track; frappe adds `dark:bg-surface-gray-10`.
    Bidirectional fill also differs (Zag fills from `min`, frappe fills from 0).
14. **Rating filled star.** `data-[highlighted]:text-ink-amber-6` vs frappe's
    `text-yellow-500`, and no preview/removing distinction (no half-star
    `step`).
15. **`ErrorMessage` type class.** `text-p-sm` vs `text-sm` (leading/tracking).
16. **Password toggle size.** `size-6` vs `size-5`.
17. **Disabled subtle inputs keep their border.** Ours leaves
    `border-surface-gray-2`; frappe forces `border-transparent`.
18. **`FormLabel` required spacing.** Literal `' *'` (leading space) vs `*`.
19. **TimePicker trigger font.** frappe forces `text-sm` on the trigger while
    ours follows the size class (`text-base` at `sm`) — verify which is
    intended before changing ours.
