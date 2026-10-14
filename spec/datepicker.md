# DatePicker

`DatePicker` — a single-date picker. The trigger is a date input plus a calendar
button; the popover renders a Zag day grid with month/year drill-down. Built on
Zag's `date-picker` machine with `@internationalized/date`, so keyboard, ARIA
and focus come from the primitive.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `value` | `string \| null` | `null` | selected date as `YYYY-MM-DD` |
| `defaultValue` | `string \| null` | — | uncontrolled initial value |
| `onValueChange` | `(value: string \| null) => void` | — | fires on pick/clear |
| `min` / `max` | `string` | — | earliest/latest selectable date |
| `locale` | `string` | `"en-US"` | BCP 47, for formatting/parsing |
| `format` | `Intl.DateTimeFormatOptions` | — | display format for the input text (ADR-0008; not a dayjs pattern) |
| `placeholder` | `string` | — | |
| `open` | `boolean` | — | controlled popover visibility |
| `defaultOpen` | `boolean` | `false` | uncontrolled |
| `onOpenChange` | `(open: boolean) => void` | — | |
| `disabled` | `boolean` | `false` | |
| `readonly` | `boolean` | `false` | prevents typing; the calendar still selects |
| `typeable` | `boolean` | `true` | allow typing; the inverse of `readonly` |
| `keepOpen` | `boolean` | `false` | keep the calendar open after a pick |
| `side` | `top \| bottom \| left \| right` | `"bottom"` | popover edge |
| `align` | `start \| center \| end` | `"start"` | alignment along the edge |
| `offset` | `number` | `4` | gap between trigger and popover, in px |
| `clearable` | `boolean` | `false` | shows a clear control when a date is selected |
| `name` | `string` | — | form field name |
| `size` | `xs \| sm \| md \| lg` | `sm` | |
| `variant` | `subtle \| outline \| ghost` | `subtle` | |
| `label` / `description` / `error` / `required` | — | — | shared labelling contract (P5) |
| `aria-label` | `string` | — | accessible name when no visible `label` |
| `class` | `string` | — | merged into the root |

`value`/`defaultValue` take an ISO `YYYY-MM-DD` string (the same shape that
round-trips through the model), not a `Date`.

## Behavior

- The trigger is a text input: type a date (parsed on Enter/blur) or open the
  calendar with the button.
- The day grid navigates by month; the heading drills day → month → year, each
  with its own prev/next.
- Keyboard/ARIA from Zag: the calendar is a `role="grid"` table, the content is
  a named `role="application"`, arrow keys move focus across days.
- `min`/`max` mark out-of-range days disabled; `readonly` blocks typing but not
  picking.
- `format` sets the input's display text via `Intl.DateTimeFormat`; typing still
  parses through Zag's locale parser. `typeable={false}` is the picker-level
  inverse of `readonly`. `keepOpen` suppresses the close-on-select.
- `side`/`align`/`offset` map onto Zag's `positioning` (`placement` + `gutter`).

## Labelling (P5)

Same as the other inputs: with labelling props, `Field` renders them and the
machine's input id points at `Field`'s label. Bare, the input takes its name from
`aria-label`, else the placeholder.

## Styling hooks

`data-slot` (`date-picker`/`-control`/`-input`/`-positioner`/`-content`), plus
Zag's `data-selected`, `data-today`, `data-outside-range`, `data-disabled`,
`data-unavailable`, `data-in-range`, and `data-view` (`day`/`month`/`year`).

## Not yet

`DateRangePicker` and `DateTimePicker` are separate components, not flags on this
one (P8).
