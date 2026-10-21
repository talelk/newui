# FilterBar

`FilterBar` — the row of controls above a list: search, one or two selects, and
the view switcher, on one quiet surface.

## Props

| prop | type | notes |
| --- | --- | --- |
| `query` | `{ value?, placeholder?, onInput?, width? }` | rendered as a search input |
| `selects` | `FilterSelect[]` | `{ label, options, value?, onValueChange?, width? }` |
| `tabs` | `{ options, value?, onValueChange? }` | segmented control, pushed to the trailing edge |
| `chips` | `FilterChip[]` | `{ label, onRemove? }` — active filters restated as pills under the bar |
| `onClearAll` | `() => void` | renders "Clear all" while a filter is active; the caller resets its own state |
| `resultCount` | `number` | stated under the bar as `N result(s)`, announced politely |
| `children` | `JSX.Element` | extra trailing controls |
| `class` | `string` | |

## Behavior

- The controls sit on one surface (`border border-outline-gray-1
  bg-surface-elevation-1 rounded-card`, `data-slot="filter-bar"`) so they read as a
  single toolbar rather than loose fields above the data. This boxed form is
  the one bar shape; a full-bleed page puts the bar inside its own container.
- Search leads and is the widest target; selects are fixed-width so their labels
  do not jump as values change; the view switcher is pushed to the far end
  because it changes how the data below is *drawn*, not what is in it. On narrow
  widths search takes the full row, the selects form a two-column grid, and the
  trailing controls align after them.
- A filled select takes the filled (`subtle`) `Select` surface, so what is
  filtering the list is visible without opening anything.
- `Select` here is a value control, not a labelled form field: each one gets an
  `aria-label` from its `label` and uses that label as its placeholder, rather
  than rendering a form label above a toolbar.
- The search box carries a `/` hint and honours it: pressing `/` outside
  another editing surface (input, textarea, select, content-editable) focuses
  the box. The listener exists only while a bar with `query` is mounted.
- Chips restate the active set (`Status: Open`) under the bar next to the
  result count. A chip with `onRemove` carries a remove button named
  `Remove filter: <label>`; without one it is a plain pill.
- "Clear all" appears only while a filter is active — a chip, a filled select,
  or a non-empty query. The bar never clears anything itself: it reports the
  request through `onClearAll` and the caller resets its state and chips.

## Not yet

No date range or multi-select shortcut: pass a `Select`-shaped filter for those,
or compose the bar yourself — the layout is three flex rows.
