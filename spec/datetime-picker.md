# DateTimePicker

`DateTimePicker` — a date + time picker. The trigger is a text input plus a
calendar button; the popover renders Zag's day grid (month/year drill-down) with
an inline, interval-spaced time list below it. Built on Zag's `date-picker`
machine with `@internationalized/date`, so keyboard, ARIA and focus come from
the primitive; the time list reuses `TimePicker`'s option generator.

A separate component from `DatePicker` (P8: a prop that changes the value type is
a new component), not a flag on it.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `value` | `string \| null` | `null` | ISO `YYYY-MM-DDTHH:mm` (minute precision) |
| `defaultValue` | `string \| null` | — | uncontrolled initial value |
| `onValueChange` | `(value: string \| null) => void` | — | fires on date/time pick/clear |
| `min` / `max` | `string` | — | earliest/latest selectable date-time |
| `locale` | `string` | `"en-US"` | BCP 47, for formatting/parsing |
| `format` | `Intl.DateTimeFormatOptions` | date + time | display format for the input (ADR-0008) |
| `interval` | `number` | `30` | minute interval between time options |
| `placeholder` | `string` | — | |
| `open` | `boolean` | — | controlled popover visibility |
| `defaultOpen` | `boolean` | `false` | uncontrolled |
| `onOpenChange` | `(open: boolean) => void` | — | |
| `disabled` | `boolean` | `false` | |
| `readonly` | `boolean` | `false` | prevents typing; the calendar still selects |
| `typeable` | `boolean` | `true` | allow typing the date; the inverse of `readonly` |
| `keepOpen` | `boolean` | `false` | keep the popover open after a pick |
| `side` | `top \| bottom \| left \| right` | `"bottom"` | popover edge |
| `align` | `start \| center \| end` | `"start"` | alignment along the edge |
| `offset` | `number` | `4` | gap between trigger and popover, in px |
| `clearable` | `boolean` | `false` | shows a clear control when a value is set |
| `name` | `string` | — | form field name |
| `size` | `xs \| sm \| md \| lg` | `sm` | |
| `variant` | `subtle \| outline \| ghost` | `outline` | |
| `label` / `description` / `error` / `required` | — | — | shared labelling contract (P5) |
| `aria-label` | `string` | — | accessible name when no visible `label` |
| `class` | `string` | — | merged into the root |

`value`/`defaultValue` take an ISO `YYYY-MM-DDTHH:mm` string (minute precision).
Input also accepts `YYYY-MM-DD`, `YYYY-MM-DD HH:mm[:ss]` and
`YYYY-MM-DDTHH:mm:ss`; seconds are dropped on the way out.

## Behavior

- The trigger is a text input: type a date (parsed on Enter/blur, through Zag's
  locale parser) or open the calendar with the button.
- The day grid navigates by month; the heading drills day → month → year, each
  with its own prev/next.
- Below the calendar, an inline time list offers interval-spaced times across the
  day (`interval`, default 30 minutes). Picking a time updates the value's time
  and keeps the date; picking a time with no date anchors it to the focused day
  (today by default).
- Picking a date keeps the existing time (`preserveTime` in the machine);
  a fresh pick lands at `00:00`.
- `min`/`max` constrain the calendar. They also bound the time list, but only
  when the selected day is the min/max day — so `min`/`max` keep day-level
  semantics otherwise.
- Keyboard/ARIA from Zag: the calendar is a `role="grid"` table, the content is
  a named `role="application"`, arrow keys move focus across days; the time list
  is a set of buttons with `aria-pressed`.
- `format` sets the input's display text via `Intl.DateTimeFormat`; the default
  shows date and time. `typeable={false}` is the picker-level inverse of
  `readonly`. `keepOpen` suppresses the close-on-select.
- `side`/`align`/`offset` map onto Zag's `positioning` (`placement` + `gutter`).

### Typing and time

Zag's date input validates keystrokes against the locale's digit + separator set
(so, for `en-US`, digits and `/`). That means the **date** is typeable but the
**time** is not; time is picked from the list. This is why the time list is
inline (no nested popover) rather than a second input.

## Labelling (P5)

Same as the other inputs: with labelling props, `Field` renders them and the
machine's input id points at `Field`'s label. Bare, the input takes its name from
`aria-label`, else the placeholder.

## Styling hooks

`data-slot` (`date-time-picker`/`-control`/`-input`/`-positioner`/`-content`/
`-time`/`-time-list`/`-time-option`), plus Zag's `data-selected`, `data-today`,
`data-outside-range`, `data-disabled`, `data-unavailable`, and `data-view`
(`day`/`month`/`year`), and `data-selected` on time options.

## Implementation notes

The day grid is shared with `DateRangePicker` through `CalendarView`
(`components/DatePicker/CalendarView.tsx`).
