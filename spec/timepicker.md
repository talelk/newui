# TimePicker

`TimePicker` — a time input that opens a popover list of selectable times. The
value is a canonical `HH:mm` string; options are generated at a configurable
`interval`, or supplied by the caller. The popover reuses Zag's `popover`
machine (positioning, dismiss, focus) and `Portal`; keyboard/ARIA follow the
combobox + listbox pattern.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `value` | `string \| null` | `null` | controlled value, canonical `HH:mm` (or `HH:mm:ss`) |
| `defaultValue` | `string \| null` | — | uncontrolled initial value |
| `onValueChange` | `(value: string \| null) => void` | — | fires on select/commit; `null` when cleared |
| `interval` | `number` | `15` | minute interval between generated options |
| `options` | `TimePickerOption[]` | — | `{ value, label? }`; bypasses the generated grid |
| `min` / `max` | `string` | — | earliest/latest selectable time, `HH:mm[:ss]` |
| `placeholder` | `string` | — | |
| `typeable` | `boolean` | `true` | `false` makes the input readonly; picking still works |
| `keepOpen` | `boolean` | `false` | keeps the popover open after a select |
| `disabled` | `boolean` | `false` | |
| `open` | `boolean` | — | controlled popover visibility |
| `defaultOpen` | `boolean` | `false` | uncontrolled |
| `onOpenChange` | `(open: boolean) => void` | — | |
| `openOnFocus` | `boolean` | `false` | opens the popover on focus |
| `openOnClick` | `boolean` | `true` | opens the popover on click |
| `name` | `string` | — | form field name |
| `id` | `string` | — | `id` of the rendered input |
| `size` | `xs \| sm \| md \| lg` | `sm` | |
| `variant` | `subtle \| outline \| ghost` | `outline` | |
| `label` / `description` / `error` / `required` | — | — | shared labelling contract (P5) |
| `aria-label` | `string` | — | accessible name when no visible `label` |
| `class` | `string` | — | merged into the root |

`value`/`defaultValue` are 24-hour strings. Typed input accepts flexible forms
(`3p`, `3pm`, `3.30pm`, `15:00`, `1500`, `15`, `9:30:15 am`) and normalizes to
`HH:mm` (`HH:mm:ss` when seconds were typed).

## Behavior

- The trigger is a text input. Clicking it (or the chevron) opens the option
  list; typing filters nothing, it is parsed on Enter/blur.
- The list is generated from `interval` across the day, bounded by `min`/`max`.
  A typed time that does not parse, or falls out of range, reverts to the last
  committed value.
- Selecting commits the value and closes the list; `keepOpen` keeps it open.
- Keyboard/ARIA follow the combobox pattern: `role="combobox"` on the input,
  `aria-expanded`, `aria-controls`, `role="listbox"`/`role="option"` in the
  popover, arrow keys move with `aria-activedescendant`, Enter selects, Escape
  and outside-click dismiss.

## Labelling (P5)

Same as the other inputs: with any of `label`/`description`/`error`/`required`,
`Field` renders them and the input id points at `Field`'s label. Bare, the input
and the listbox take their name from `aria-label`, else the placeholder.

## Styling hooks

`data-slot` (`time-picker`/`time-picker-anchor`/`time-picker-input`/
`time-picker-positioner`/`time-picker-listbox`/`time-picker-option`), plus
`data-state` (`open`/`closed`) on the anchor, `data-selected`/`data-highlighted`
on options, and `data-disabled` on the anchor.

## Not yet

`DateTimePicker` is a separate component, not a flag on this one (P8).
