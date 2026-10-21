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

- **KPI anatomy is label-first, one layout only:** a header row (optional icon
  in a tinted `size-8 rounded-4 bg-surface-gray-2` square, the label, and the
  delta pill) → the value (`text-metric`, tabular) → the `hint` as a baseline
  caption. Cards use the card padding role (`p-card-pad`, 16px) and `rounded-card` (8px).
- **The delta is a tinted pill** (`rounded-full px-1.5`, tabular), coloured by
  `good`: `bg-surface-green-2 text-ink-green-8` / `bg-surface-red-2
  text-ink-red-8`, gray when flat. The `ink-*-8` step is deliberate: it is the
  pairing the contrast contract asserts at WCAG AA on `surface-*-2`.
- **A delta never stands alone.** Every delta pairs with an explicit baseline
  in `hint` ("from $209.5K last month"), never a bare `%` the reader must
  anchor themselves.
- **A delta is toned by whether it is good, not by its direction.** Churn going
  down is good; revenue going down is not. A grid that paints every minus red
  gets that wrong on half the dashboards it is used on. `good` defaults to the
  intuitive reading and is overridden per stat.
- A stat with `onClick` renders as a `<button>` (keyboard-reachable, announced as
  interactive); without one it is a plain card. Hover changes border and
  `shadow-sm` only — never a scale — and drops its transition under
  `prefers-reduced-motion`.
- The column classes are literal (`sm:grid-cols-3`), not built from a template
  string: Tailwind scans for whole class names, so `sm:grid-cols-${n}` would
  compile to nothing.

## Not yet

No sparkline and no trend chart. A stat that needs one wants the `@newui/charts`
`NumberCard`, which is a chart package's job, not a block's.
