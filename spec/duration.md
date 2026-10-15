# Duration

`Duration` — a duration value control. A text input that displays a duration in
seconds as human-readable text and parses what the user types back to seconds on
Enter or blur. It reuses the shared labelling contract (P5), so `label` /
`description` / `error` / `required` wire themselves.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `value` | `number \| null` | `null` | controlled value in seconds |
| `defaultValue` | `number \| null` | `null` | uncontrolled initial value |
| `onValueChange` | `(value: number \| null) => void` | — | fires on commit (`null` when cleared) |
| `placeholder` | `string` | `"1h 30m 45s"` | shown when empty |
| `format` | `short \| long \| colon \| string` | `"short"` | how the saved value renders while unfocused |
| `size` | `xs \| sm \| md \| lg` | `sm` | |
| `variant` | `subtle \| outline \| ghost` | `outline` | |
| `disabled` | `boolean` | `false` | |
| `name` | `string` | — | form field name |
| `id` | `string` | auto | |
| `label` / `description` / `error` / `required` | — | — | shared labelling contract (P5) |
| `aria-label` | `string` | — | accessible name when no visible `label` |
| `class` | `string` | — | merged into the input |

`value` / `defaultValue` are durations in **seconds** (a number), not strings
(P3). Controlled with `value` + `onValueChange`, or uncontrolled with
`defaultValue` (P2).

## Formats

`format` is either a named preset or a token template:

| format | `5445` renders as |
| --- | --- |
| `short` (default) | `1h 30m 45s` — smart zero-omission |
| `long` | `1 hour 30 minutes 45 seconds` — pluralized |
| `colon` | `1:30:45` |
| `h'h' m'm' s's'` | `1h 30m 45s` — template, every part |
| `hh:mm:ss` | `01:30:45` — template, zero-padded |

Templates render runs of `h` / `m` / `s` as unit tokens; a run of two or more
zero-pads to two digits. Single-quoted text is emitted literally (`''` is a
literal apostrophe); any other character passes through unchanged.

## Parsing

Editing always uses the canonical `short` notation, so typed text round-trips
regardless of the display `format`. Accepted input (case-insensitive, spaces
optional, any unit order):

- `1h 30m 45s`, `1h30m45s`, `4sec 3hour 4min`
- `1:30:45`, `1:30`, `:45` — out-of-range parts overflow by design (`1:75` ⇒ `135`)
- `90`, `90s` — a bare integer is seconds

An unparseable value leaves the saved value untouched, shows an inline error
(`role="alert"`) and keeps the rejected text visible until the field is focused
again. Duplicate units are rejected.

## Behavior

- Focus shows the canonical editable value and selects it.
- Enter commits and blurs; Escape cancels the edit and leaves the value as-is.
- Blur commits. Emptying the field commits `null`.
- Invalid text is reported, not committed; re-focusing restarts from the saved
  value.

## Labelling (P5)

Same as the other inputs: with labelling props, `Field` renders them and the
input's id points at `Field`'s label. Bare, the input takes its name from
`aria-label`, else the placeholder.

## Styling hooks

`data-slot="duration"` on the input, plus the `Field` slots (`label` /
`description` / `error`) when labelling is present. The input keeps the
`TextInput` look for its `size` and `variant`.
