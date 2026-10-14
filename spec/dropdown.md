# Dropdown

`Dropdown` — an options-based action menu. A thin composition over the compound
`Menu` (same Zag `menu` machine), matching frappe-ui's options-first `Dropdown`.

## Props

| prop | type | notes |
| --- | --- | --- |
| `options` | `DropdownOption[]` | `{ label, value, disabled?, icon?, danger? }` |
| `children` | `JSX.Element` | the trigger content, rendered inside a button |
| `onSelect` | `(value: string) => void` | fires with the chosen option's value |
| `class` | `string` | merged into the trigger |

Use `Menu` directly when the trigger or rows need to be customised beyond
`label` / `icon` / `danger`.

## Behavior

- The trigger is a button; the content is portalled and positioned by Zag.
- Disabled options are skipped by keyboard navigation and not clickable.
- `danger` renders the label in `text-ink-red-7`.

## Styling hooks

Reuses `Menu`'s `data-slot` hooks (`menu-trigger` / `menu-content` /
`menu-item`) plus Zag's `data-state` / `data-highlighted` / `data-disabled`.
