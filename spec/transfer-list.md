# TransferList

A dual-list picker: the left list is available, the right list is picked, and
the buttons between them move the checked rows.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `options` | `TransferOption[]` | — | `{ value, label }` per row |
| `value` | `string[]` | — | controlled picked values, in pick order |
| `defaultValue` | `string[]` | `[]` | |
| `onValueChange` | `(value: string[]) => void` | — | |
| `search` | `boolean` | — | filter boxes above both lists (one shared query) |
| `availableLabel` | `string` | `Available` | accessible name and legend of the left panel |
| `pickedLabel` | `string` | `Selected` | accessible name and legend of the right panel |
| `disabled` | `boolean` | — | |
| `class` | `string` | — | merged into the root |

## Behavior and accessibility

Rows are checkboxes, not a listbox: every row is natively focusable and
toggles without custom keyboard machinery. The chevron buttons move the
*checked* rows; the double chevrons move everything. Legends show live
counts — "Available (3) / Selected (1)". Panel labels name each fieldset for
assistive tech; the move buttons are labelled IconButtons that disable when
they have nothing to do. The shared `search` query filters both panels by
label. Styling hooks: `data-slot="transfer-list"` / `transfer-list-panel` /
`transfer-list-actions` / `transfer-list-empty`, `data-side`, `data-disabled`
(P10).
