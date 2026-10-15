# Charts

`@newui/charts` renders analytical data with SVG ECharts and semantic tokens.
Install `@newui/charts` and its declared peers, then import only the wrappers you
use. Each chart has an isolated executable example under `/charts` with complete
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
