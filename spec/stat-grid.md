# StatGrid

`StatGrid` — a row of KPI cards.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `stats` | `Stat[]` | required | `{ label, value, hint?, delta?, icon?, onClick? }` |
| `columns` | `2 \| 3 \| 4` | the number of stats, capped | columns at the widest breakpoint |
| `class` | `string` | — | |

`delta` is `{ value, direction: 'up' | 'down' | 'flat', good? }`.

## Behavior

- **A delta is toned by whether it is good, not by its direction.** Churn going
  down is good; revenue going down is not. A grid that paints every minus red
  gets that wrong on half the dashboards it is used on. `good` defaults to the
  intuitive reading and is overridden per stat.
- A stat with `onClick` renders as a `<button>` (keyboard-reachable, announced as
  interactive); without one it is a plain card.
- The column classes are literal (`sm:grid-cols-3`), not built from a template
  string: Tailwind scans for whole class names, so `sm:grid-cols-${n}` would
  compile to nothing.

## Not yet

No sparkline and no trend chart. A stat that needs one wants the `@newui/charts`
`NumberCard`, which is a chart package's job, not a block's.
