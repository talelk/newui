# FilterBar

`FilterBar` — the row of controls above a list: search, one or two selects, and
the view switcher.

## Props

| prop | type | notes |
| --- | --- | --- |
| `query` | `{ value?, placeholder?, onInput?, width? }` | rendered as a search input |
| `selects` | `FilterSelect[]` | `{ label, options, value?, onValueChange?, width? }` |
| `tabs` | `{ options, value?, onValueChange? }` | segmented control, pushed to the trailing edge |
| `children` | `JSX.Element` | extra trailing controls |
| `class` | `string` | |

## Behavior

- Search leads and is the widest target; selects are fixed-width so their labels
  do not jump as values change; the view switcher is pushed to the far end
  because it changes how the data below is *drawn*, not what is in it.
- `Select` here is a value control, not a labelled form field: each one gets an
  `aria-label` from its `label` and uses that label as its placeholder, rather
  than rendering a form label above a toolbar.

## Not yet

No date range or multi-select shortcut: pass a `Select`-shaped filter for those,
or compose the bar yourself — the layout is three flex rows.
