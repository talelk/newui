# ToggleGroup

`ToggleGroup` — a row of independent on/off cells that read as one control:
text alignment, a view switcher, a density picker. Zag's `toggle-group` machine
owns the grouping semantics and the roving focus, so the row is one tab stop.

Distinct from `TabButtons`, which picks a *view* and slides a pill indicator. A
toggle group is a set of pressed states — and may allow several at once — which
is what `aria-pressed` (Zag's `data-state`) communicates.

## Parts

`ToggleGroup.Root` · `ToggleGroup.Item`.

## Props

### `ToggleGroup.Root`

| prop | type | default | notes |
| --- | --- | --- | --- |
| `variant` | `'subtle' \| 'outline' \| 'ghost'` | `'subtle'` | the track's shape; set once, not per cell |
| `size` | `'sm' \| 'md' \| 'lg'` | `'sm'` | |
| `value` | `string[]` | — | controlled |
| `defaultValue` | `string[]` | — | uncontrolled |
| `onValueChange` | `(value: string[]) => void` | — | |
| `multiple` | `boolean` | `false` | several cells on at once |
| `disabled` | `boolean` | `false` | |
| `aria-label` | `string` | — | the group is a toolbar of related controls, so it needs a name |
| `class` | `string` | — | |

### `ToggleGroup.Item`

| prop | type | default | notes |
| --- | --- | --- | --- |
| `value` | `string` | required | |
| `disabled` | `boolean` | `false` | |
| `icon` | `IconProp` | — | a `lucide-*` string or a component (P11) |
| `aria-label` | `string` | — | required when the cell is icon-only |
| `class` | `string` | — | |

## Behavior

- Zag sets the root's role from `multiple`: `radiogroup` when one value is
  allowed, `group` when several are. A cell is announced as pressed, not
  selected.
- The variant and size come from the root through a context, so a cell cannot
  render in a different shape from its neighbours.

## Styling hooks

`data-slot` (`toggle-group` / `toggle-group-item`) plus Zag's `data-state`
(`on` / `off`) and `data-focus` on the cell. Style the pressed state with
`data-[state=on]:*`, never with a class the caller passes in.
