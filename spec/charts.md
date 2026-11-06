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
- CalendarHeatmapChart takes `date`/`value` row keys and an optional `range`
  (a year or a `[start, end]` span; the data's own span is the default). Days
  without a numeric value stay undrawn rather than reading as zero. A day click
  emits `onPointClick` with the day, its value and the row behind it — what the
  click drives (a `cross`, a drilldown) belongs to the page, not the chart.
- GaugeChart takes `value`, `min`/`max` (0/100 by default) and an optional
  `caption`; the palette is locked to tokens — 1px track, single blue progress
  arc, metric typography centered.
- Sparkline is plain SVG, not echarts: `data` of numbers, `type` (`area`,
  `line`, `bar`), `width`/`height`, and a `tone` that is either `ink` (the
  surrounding text color) or the chart palette vocabulary. The drawing is
  `aria-hidden` and the values ride in a visually-hidden summary. NumberCard
  draws its trend with the same component.
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
  an end dot. The target wraps as a whole unit on narrow cards, the sparkline
  anchors to the card footer, and loading reserves the optional progress and
  sparkline geometry. A delta is never printed without its caption naming the
  baseline.

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

The chart palette vocabulary is chart-only: the categorical ramp and the
single-hue ramps (`blue`, `amber`) are what plots may draw with, and `orange`
and `yellow` exist only here — never as component `theme` values. A calendar
heatmap defaults to the blue ramp and takes `amber` for warning-shaped
metrics; a gauge locks its palette to tokens (no `palette` prop) because it
reads a KPI at a glance.

## Interactions

LineChart, AreaChart and BarChart speak the kit's controlled-signal pattern
for interaction state. The window, the selection and the group are signals
the page owns; the chart never keeps private interaction state that a
rebuild would erase.

- `zoom={{ from, to }}` (controlled) or `defaultZoom` (uncontrolled) opens a
  range slider under the plot; `onZoomChange` reports the window as data
  values — a category label, a date, a number — never an echarts index or
  percent. The option builder re-emits the window on every build, so an
  option rebuild restores it; programmatic changes go through
  `dispatchAction`, not a rebuild. A horizontal `BarChart`'s categories sit
  on the other axis, where the range interactions do not apply.
- `brush` draws a range brush over the x axis; `onBrushChange` reports the
  selected span as data values, or `null` when cleared. `brushSelected`'s
  raw per-series indices are translated at the wrapper boundary — no echarts
  internals in public props.
- Keyboard twins make both pointer gestures operable without a pointer: the
  plot takes focus when it zooms (`+`/`-` zoom in and out, arrows pan), and
  the brush range can be typed into two number inputs in the container's
  toolbar. The fallback table tracks the current window — its rows narrow
  with it and a caption names the window — so a table beside a zoomed plot
  never quietly claims more rows than are shown.
- `onPointDblClick` emits the datum behind a double-click (the x value and
  its row). What it navigates to is the page's business — the `route`
  vocabulary — not a chart API. Sunburst and treemap drilldowns are not
  shipped components; when they ship, `onNodeClick` will follow this rule.
- `group` links hover and axis-pointer highlight across charts, the way
  `echarts.connect` does. `useChartGroup(name)` owns the namespacing — ids
  are `newui.<name>.<id>`, so unrelated widgets cannot link by accident —
  and its `Provider` (or a `ChartCard` carrying the same `group`) links the
  charts inside it without a prop per chart. Cross-filtering is not this
  file's business: it lives in `createDashboardState`'s `cross`, consumed
  and emitted through the callbacks the page wires.

## Helpers

The package guide at `packages/charts/README.md` documents formatting,
normalization, pure option builders, token reading and chart lifecycle helpers.
They remain public for applications that compose custom charts. The generated
source inventory reconciles these helpers and types against the package barrel.
