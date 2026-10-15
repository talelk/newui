# Combobox

`Combobox` — a searchable single select. The trigger is a text input the user
types into; the option list filters client-side by substring. Built on Zag's
`combobox` machine (keyboard, ARIA and focus come from the primitive).

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `options` | `ComboboxOption[]` | required | `{ label, value, disabled? }` |
| `value` | `string \| null` | `null` | controlled committed value |
| `onValueChange` | `(value: string \| null) => void` | — | fires on select |
| `open` | `boolean` | — | controlled popover visibility |
| `defaultOpen` | `boolean` | `false` | uncontrolled |
| `onOpenChange` | `(open: boolean) => void` | — | |
| `placeholder` | `string` | — | |
| `emptyText` | `string` | `"No results"` | shown when the filter matches nothing |
| `disabled` | `boolean` | `false` | |
| `name` | `string` | — | form field name |
| `size` | `xs \| sm \| md \| lg` | `sm` | |
| `variant` | `subtle \| outline \| ghost` | `outline` | |
| `label` / `description` / `error` / `required` | — | — | shared labelling contract (P5) |
| `aria-label` | `string` | — | accessible name when no visible `label` |
| `class` | `string` | — | merged into the root |

## Behavior

- Opening: clicking the input or the chevron opens the list; typing opens it and
  filters. A filter that matches nothing reveals `emptyText`.
- Filtering: case-insensitive substring on the option **label**. Only runs once
  the user types — a committed label is not treated as a query, so reopening
  shows the full list.
- Committing: click an option, or move with the arrow keys and press Enter.
  Selecting closes the list; the input shows the option's label. Disabled
  options are skipped and not clickable.
- Keyboard/ARIA come from Zag: `role="combobox"` on the input, `role="listbox"`
  on the content, `aria-expanded`, `aria-activedescendant`, arrow-key
  navigation.

## Labelling (P5)

With any of `label`/`description`/`error`/`required`, `Field` renders them and
the machine's ids point at `Field`'s label, so both the input (`for`) and the
listbox (`aria-labelledby`) are named. Bare, a visually-hidden label (from
`aria-label`, else the placeholder) names the listbox.

## Styling hooks

`data-slot` (`combobox`/`combobox-control`/`combobox-input`/`combobox-trigger`/
`combobox-positioner`/`combobox-content`/`combobox-item`), plus Zag's
`data-state` (`open`/`closed`), `data-highlighted`, `data-disabled` and
`data-invalid`.

`MultiSelect` (multi-valued) and the pickers are separate components, not flags
on this one (P8).
