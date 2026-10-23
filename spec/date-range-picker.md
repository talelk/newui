# DateRangePicker

`DateRangePicker` — a range picker. The trigger is a pair of date inputs
(start/end) plus a calendar button; the popover renders Zag's `range` day grid,
optionally as two months (`dualPane`), with month/year drill-down. Built on
Zag's `date-picker` machine with `@internationalized/date`, so keyboard, ARIA,
focus and the hover-range preview come from the primitive.

A separate component from `DatePicker` (P8: a prop that changes the value type
is a new component), not a flag on it.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `value` | `DateRangeValue \| null` | `null` | `[from, to]` in `YYYY-MM-DD`, or `[]` |
| `defaultValue` | `DateRangeValue \| null` | — | uncontrolled initial value |
| `onValueChange` | `(value: DateRangeValue) => void` | — | fires when the range completes or clears |
| `min` / `max` | `string` | — | earliest/latest selectable date (`YYYY-MM-DD`) |
| `locale` | `string` | `"en-US"` | BCP 47, for formatting/parsing |
| `format` | `Intl.DateTimeFormatOptions` | — | display format for the inputs (ADR-0008) |
| `dualPane` | `boolean` | `false` | render two months side by side |
| `placeholder` | `string` | — | |
| `open` | `boolean` | — | controlled popover visibility |
| `defaultOpen` | `boolean` | `false` | uncontrolled |
| `onOpenChange` | `(open: boolean) => void` | — | |
| `disabled` | `boolean` | `false` | |
| `readonly` | `boolean` | `false` | prevents typing; the calendar still selects |
| `typeable` | `boolean` | `true` | allow typing; the inverse of `readonly` |
| `keepOpen` | `boolean` | `false` | keep the calendar open after a range is picked |
| `side` | `top \| bottom \| left \| right` | `"bottom"` | popover edge |
| `align` | `start \| center \| end` | `"start"` | alignment along the edge |
| `offset` | `number` | `4` | gap between trigger and popover, in px |
| `clearable` | `boolean` | `false` | shows a clear control when a range is set |
| `name` | `string` | — | form field name |
| `size` | `xs \| sm \| md \| lg` | `sm` | |
| `variant` | `subtle \| outline \| ghost` | `outline` | |
| `label` / `description` / `error` / `required` | — | — | shared labelling contract (P5) |
| `aria-label` | `string` | — | accessible name when no visible `label` |
| `class` | `string` | — | merged into the root |

```ts
/** A range value: a `[from, to]` tuple in `YYYY-MM-DD`, or `[]` when empty. */
type DateRangeValue = [string, string] | []
```

`value`/`defaultValue` are ISO `YYYY-MM-DD` strings (the same shape that
round-trips through the model), not `Date`s.

## Behavior

- A controlled range keeps the first click as a local draft until the end date
  lands. The calendar visibly holds the start date; the parent only receives a
  complete `[from, to]` or `[]`. Closing the popover discards the draft.


- The trigger is a pair of text inputs: type the start and end (parsed on
  Enter/blur) or open the calendar with the button.
- The day grid is Zag's `range` mode. The first click sets the start and the
  second sets the end; between them the days under the cursor preview as
  in-range. `dualPane` shows the current and next month.
- The heading drills day → month → year, each with its own prev/next. With
  `dualPane` the drill-down falls back to a single panel.
- Keyboard/ARIA from Zag: the calendar is a `role="grid"` table, the content is
  a named `role="application"`, arrow keys move focus across days.
- `min`/`max` mark out-of-range days disabled; `readonly` blocks typing but not
  picking.
- **Half-open is internal.** Only a complete `[from, to]` (or `[]`) is reported.
  The machine keeps the half-open range for the hover preview; `onValueChange`
  does not fire for it. This keeps the model a strict
  two-tuple-or-empty.
- `format` sets each input's display text via `Intl.DateTimeFormat`; typing
  still parses through Zag's locale parser. `typeable={false}` is the
  picker-level inverse of `readonly`. `keepOpen` suppresses the close-on-complete.
- `side`/`align`/`offset` map onto Zag's `positioning` (`placement` + `gutter`).

## Labelling (P5)

Same as the other inputs: with labelling props, `Field` renders them and the
machine's **start** input id points at `Field`'s label. The end input takes its
name from `aria-label` (a shared visible label cannot label two controls). Bare,
the inputs take their names from `aria-label`, else the placeholder.

## Styling hooks

`data-slot` (`date-range-picker`/`-control`/`-input`/`-input-end`/
`-positioner`/`-content`), plus Zag's `data-selected`, `data-today`,
`data-in-range`, `data-range-start`, `data-range-end`, `data-in-hover-range`,
`data-outside-range`, `data-disabled`, `data-unavailable`, and `data-view`
(`day`/`month`/`year`).

## Implementation notes

The day grid is shared with `DateTimePicker` through `CalendarView`
(`components/DatePicker/CalendarView.tsx`). It renders with Solid's `Index`, not
`For`: the range machine re-renders on every pointer move (the hover preview),
and `For` keys by identity — the `DateValue`s are fresh each render, so `For`
would recreate the day buttons mid-gesture and swallow the click.
