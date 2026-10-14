# MultiSelect

`MultiSelect` — a searchable multi-valued select. The same popover as
`Combobox`, but the committed value is a `string[]` and the trigger renders
each selection as a removable chip. It is its own component, not a `multiple`
flag on `Combobox` (P8).

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `options` | `MultiSelectOption[]` | required | `{ label, value, disabled? }` |
| `value` | `string[]` | `[]` | controlled selection, in selection order |
| `onValueChange` | `(value: string[]) => void` | — | fires on select, chip remove, select-all, clear-all |
| `open` | `boolean` | — | controlled popover visibility |
| `defaultOpen` | `boolean` | `false` | uncontrolled |
| `onOpenChange` | `(open: boolean) => void` | — | |
| `placeholder` | `string` | — | |
| `emptyText` | `string` | `"No results"` | shown when the filter matches nothing |
| `disabled` | `boolean` | `false` | |
| `name` | `string` | — | form field name |
| `size` | `xs \| sm \| md \| lg` | `sm` | |
| `variant` | `subtle \| outline \| ghost` | `subtle` | |
| `label` / `description` / `error` / `required` | — | — | shared labelling contract (P5) |
| `aria-label` | `string` | — | accessible name when no visible `label` |
| `class` | `string` | — | merged into the root |

Controlled vs uncontrolled: pass `value` to control; otherwise the machine owns
the selection and accumulates picks. `onValueChange` fires either way.

## Behavior

- Trigger: each selected value renders as a chip with a remove button; the input
  filters. Selecting keeps the popover **open** (`multiple` disables
  close-on-select, and the search clears between picks).
- Filtering: case-insensitive substring on the option label, only once the user
  types.
- Footer: `Select all` (every enabled option) and `Clear all` (disabled when the
  selection is empty).
- Chip remove, select-all and clear-all all report through `onValueChange`.
- Keyboard/ARIA from Zag's `combobox`: `role="combobox"` input, `role="listbox"`
  content, arrow-key navigation.

## Labelling (P5)

Same as `Combobox`: with labelling props, `Field` renders them and the machine's
ids point at `Field`'s label; bare, an `sr-only` label names the input and the
listbox.

## Styling hooks

`data-slot` (`multiselect`/`-control`/`-input`/`-trigger`/`-chip`/`-positioner`/
`-content`/`-item`/`-footer`), plus Zag's `data-state`, `data-highlighted`,
`data-disabled` and `data-invalid`.
