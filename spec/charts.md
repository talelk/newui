# Charts

`@talelk/newui-charts` renders analytical data with SVG ECharts and semantic tokens.
Install `@talelk/newui-charts` and its declared peers, then import only the wrappers you
use. Each chart has an isolated executable example under `/organisms` with complete
copyable source and generated props.

## Data and composition

- BarChart, LineChart and AreaChart take rows in `data`, category key `x` and
  value keys `y`/`y2`. `seriesConfig` customizes named series. BarChart also
  accepts `horizontal`; stacked can be true or normalized.
- DonutChart takes `category` and `value`; more than maxSlices (default 9)
  aggregate into Others. `variant=half` changes geometry.
- FunnelChart takes ordered stages via `category`/`value`; order is meaningful.
- HeatmapChart takes `x`, `y`, `value` and optional min/max. Missing values do
  not invent zero cells. ScatterChart takes numeric `x`/`y`, optional size,
  splitBy and label columns. SankeyChart takes source/target/value flow rows.
- NumberCard displays title/value, optional target, delta and sparkline.
  negativeIsBetter reverses delta colour for costs.
- Dashboard arranges children, automatically fitting columns unless columns is
  supplied. ChartCard is the bordered surface; ChartContainer adds title,
  loading, error, empty and legend regions.
- ChartBase accepts an option accessor, accessible label and fallback table.
  It owns engine lifecycle and disposal; callers register their required engine
  capabilities before passing custom options.
- ChartLegend receives items and reports onToggle/onHighlight. The caller owns
  hidden series. ChartTooltip is controlled by open/x/y/items; a children
  callback replaces its body.

## Card chrome

Charts ship no stylesheet; the chrome below is inline `var(--…)` custom
properties, so it follows the light/dark axis without a second recipe.

- ChartCard uses the card padding role on `surface-elevation-1` with the 8px card radius;
  `card: false` still leaves only the clipping box.
- ChartContainer heads the plot with a 1rem/600 `ink-gray-9` title, an
  `ink-gray-7` subtitle and a hairline divider under the header row; the
  `actions` slot (a period picker, say) stays on that row. The legend row sits
  0.5rem under the plot.
- State precedence is `error > loading > empty`. Loading draws static skeleton
  bars (no pulse: a reduced-motion-safe animation would need the stylesheet
  this package does not ship). Empty keeps the title and shows a `—`
  placeholder over its caption — never a blank plot. Error prints its message
  and reason at `ink-gray-7` minimum.
- ChartLegend entries are pills: a rounded 14×3px colour dash plus an
  `ink-gray-7` label. While one entry is hovered or focused the others dim to
  40%, but only when an `onToggle`/`onHighlight` handler is wired.
- ChartTooltip is a bordered card: a header row (the label, over a bottom
  hairline), then one row per reading — dash and category on the left, the
  tabular value on the right. Context rows keep their rule and carry no dash.
- NumberCard follows the KPI anatomy: a header row (title + delta pill toned
  by `negativeIsBetter`, at the contrast contract's `ink-*-8` on
  `surface-*-2`), the value, a progress bar toward a numeric `target`
  (`role="progressbar"`; string targets print ` / target` only), the
  `deltaCaption` as the baseline line, and a sparkline whose last point carries
  an end dot. A delta is never printed without its caption naming the baseline.

## State, access and responsive behavior

Charts are projections of caller-owned data. Replace data to update them; they
do not fetch records. loading, error and empty are explicit states. Give plots
a meaningful title or aria-label. The generated fallback table exposes data to
screen readers without requiring pointer tooltips. Legend buttons support
keyboard focus and activation. Do not communicate series identity through colour
alone. Formatting callbacks label axes and values consistently.

Widths follow the container; height accepts CSS length or pixels (ChartBase
default 240). Allow enough space for labels at 320px and at 200% text size.
The palette and typography follow live colour-scheme tokens. RTL follows the
document unless dir is supplied. Reduced motion is respected by the chart
lifecycle.

## Helpers

The package guide at `packages/charts/README.md` documents formatting,
normalization, pure option builders, token reading and chart lifecycle helpers.
They remain public for applications that compose custom charts. The generated
source inventory reconciles these helpers and types against the package barrel.
