# TimeRangePicker

A start and end time as one value — the shift, window or slot picker.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `value` | `[string, string] \| []` | — | controlled `[from, to]` in canonical `HH:mm`, `[]` when empty |
| `defaultValue` | `TimeRangeValue` | `[]` | |
| `onValueChange` | `(value: TimeRangeValue) => void` | — | fires only when the range is complete, or clears to `[]` |
| `interval` | `number` | `15` | minute interval of both pickers' option lists |
| `disabled` | `boolean` | — | |
| `startLabel` / `endLabel` | `JSX.Element` | `Start` / `End` | the two fields' accessible names |
| `label` / `description` / `error` / `required` | shared labelling contract (P5) | — | names the range once, at the group |
| `id` / `'aria-label'` / `class` | | | |

## Behavior and accessibility

Two `TimePicker`s under one field label: the group (P5) names the range once,
each field is individually named for its own popover. Picking the start holds
a half-open range internally — the value reports only when the end exists, or
clears to `[]`. A range that ends before it starts (a night shift) is
reported as-is; reordering is the app's call. Styling hooks:
`data-slot="time-range-picker"` / `time-range-picker-control`,
`data-disabled`, `data-invalid` (P10).
