# @newui/charts

Solid wrappers over [echarts](https://echarts.apache.org/), drawn with the
**SVG renderer** and themed with the newui chart tokens. Bar, line, area,
donut, funnel, heatmap, scatter and sankey charts, a number card, and a
dashboard grid, with the pure option builders kept separate from the components
so they can be tested without a DOM. The shell (`ChartContainer`), the legend
and the tooltip wrap any plot — echarts-backed or an app's own.

The plots read the `--chart-1…8` ramp and the `--chart-grid` / `--chart-axis`
hairlines back through `getComputedStyle`, so light/dark flips with the page —
no second option and no reconfiguration.

## Install

```sh
pnpm add @newui/charts echarts solid-js
```

`echarts` is a direct dependency; `solid-js` is a peer.

## Usage

```tsx
import { BarChart, DonutChart, LineChart, NumberCard } from '@newui/charts'

const sales = [
  { month: 'Jan', revenue: 120, costs: 80 },
  { month: 'Feb', revenue: 160, costs: 90 },
  { month: 'Mar', revenue: 140, costs: 85 },
]

function Dashboard() {
  return (
    <div class="grid gap-4">
      <BarChart
        title="Revenue vs costs"
        data={sales}
        x="month"
        y={['revenue', 'costs']}
        height={280}
      />

      <LineChart data={sales} x="month" y="revenue" smooth />

      <DonutChart
        title="Traffic"
        data={[
          { channel: 'Search', visits: 50 },
          { channel: 'Direct', visits: 30 },
          { channel: 'Email', visits: 20 },
        ]}
        category="channel"
        value="visits"
      />

      <NumberCard
        title="Revenue"
        value={1234}
        prefix="$"
        delta={-3.1}
        deltaSuffix="%"
        deltaCaption="vs last month"
        sparkline={{ data: [120, 160, 140] }}
      />
    </div>
  )
}
```

### Axis charts

`BarChart`, `LineChart` and `AreaChart` share one prop shape. `y` takes one
column or a list; `y2` measures against a second value axis. A series can name
its own mark through `seriesConfig`, so a bar chart with one `type: 'line'`
series is a combo chart.

| Prop | Type | Notes |
| --- | --- | --- |
| `data` | `Record<string, unknown>[]` | One row per position on the category axis. |
| `x` | `string` | Column holding the category or time. |
| `y` | `string \| string[]` | Value column(s) on the primary axis. |
| `y2` | `string \| string[]` | Value column(s) on the second axis. |
| `seriesConfig` | `Record<string, SeriesStyle>` | Per-series label, color, mark, format, … |
| `stacked` | `boolean \| 'normalized'` | `'normalized'` is the 100% stack. |
| `horizontal` | `boolean` | `BarChart` only; moves the categories to Y. |
| `xAxis` / `yAxis` / `y2Axis` | options | Titles, `min`/`max`, tick `format`. |
| `hiddenSeries` | `string[]` | Series switched off, by name. |
| `title` / `subtitle` / `height` / `class` / `aria-label` | | Chrome and layout. |
| `echartOptions` | `Record<string, unknown>` | Deep-merged escape hatch. |

### DonutChart

| Prop | Type | Notes |
| --- | --- | --- |
| `data` | `Record<string, unknown>[]` | One row per slice. |
| `category` / `value` | `string` | Slice name and size columns. |
| `maxSlices` | `number` | Defaults to 9; the tail is summed into "Others". |
| `variant` | `'full' \| 'half'` | A semicircle. |
| `showDataLabels` | `boolean` | Names and shares beside the ring. |
| `hiddenSlices` | `string[]` | Slices switched off, by name. |

### NumberCard

`title`, `value`, `prefix`, `suffix`, `target`, `delta`, `deltaPrefix`,
`deltaSuffix`, `deltaCaption`, `negativeIsBetter`, `format`, `deltaFormat`,
`color` and `sparkline` (`{ data, type?, color? }`). No echarts: a page of
these costs nothing but HTML.

### FunnelChart

One band per stage, in the order the rows arrive — the order is the process,
not the magnitude, so the stages are never sorted. `category` names the stage
column and `value` how many reached it. `palette` defaults to `'sequential'`,
reversed so the band deepens as the population narrows. `format` prints every
value. Stages that report no number, or a negative one, are dropped.

### HeatmapChart

One cell per row on a grid of two category axes. `x`, `y` and `value` name the
column, the row and the magnitude. `palette` defaults to `'sequential'`;
`'diverging'` centers the scale on zero. `min` / `max` pin the ends. Two rows
landing on the same cell collapse to one, the later row winning.
`showDataLabels` prints each value, dropping any label with no room.

### ScatterChart

One point per row on a pair of value axes. `x` and `y` are the measures,
`size` maps a magnitude onto the symbol diameter, `splitBy` groups the points
into series, and `label` names the column a point's own name comes from.
`showDataLabels` prints that name beside the point. `hiddenSeries` switches a
group off. A row missing either coordinate draws nothing.

### SankeyChart

One band per row, from a source node to a target node. `source`, `target` and
`value` name the columns; `vertical` runs the flow top to bottom; `nodeAlign`
picks where a node sits (`'left'`, `'right'`, `'justify'`). `palette` defaults
to `'categorical'`. A row that closes a cycle is dropped: a flow has to move in
one direction.

### Dashboard, ChartCard, ChartContainer, ChartLegend and ChartTooltip

`Dashboard` is a grid that tiles charts; each chart draws its own chrome and
fills the box it is given, so the dashboard only sets the grid. `columns` pins
a column count, and without it the tiles wrap to fit the width. `ChartCard` is
the bordered surface a chart sits on (`card={false}` keeps the clipping box
only).

`ChartContainer` is the shell a plot draws inside — the title/subtitle row, the
value-axis titles, the loading/error/empty states, the plot box and the legend
row — with the plot supplied as `children`. The echarts-backed charts render
through it, so a chart an app draws itself (`<ChartContainer>…</ChartContainer>`)
matches them without re-implementing the chrome. It reports its state on
`data-state` (`ready` | `loading` | `error` | `empty`) as well as drawing it, so
an app can style a loading or failed card from CSS. The plot stays mounted
through every state; it is hidden, not unmounted, so an echarts instance is
never disposed and rebuilt on the way back.

| Prop | Type | Notes |
| --- | --- | --- |
| `title` / `subtitle` | `string` | Heads the card; no header row when both are unset. |
| `yAxisTitle` / `y2AxisTitle` | `string` | Drawn over the plot, not along the axis. |
| `axisTitlePlacement` | `'top' \| 'bottom'` | Edge the axis titles head. Defaults to `'top'`. |
| `loading` / `error` / `empty` | `boolean` / `string` | The state, in that precedence: `error` > `loading` > `empty` > `ready`. |
| `height` | `number \| string` | A number is px; a string is used verbatim. Defaults to `100%`. |
| `actions` | `JSX.Element` | Trailing controls in the header row. |
| `loadingContent` / `errorContent` / `emptyContent` | `JSX.Element` | Replace a default state's content. |
| `legend` | `JSX.Element` | The row under the plot, e.g. a `ChartLegend`. |
| `children` | `JSX.Element` | The plot itself. |
| `dir` / `class` | | Layout direction and root class fallthrough. |

`ChartLegend` is the row under a plot that names its series: each entry is a
toggle, with `onToggle` and `onHighlight` callbacks.

`ChartTooltip` is the reading a plot shows over a point. It is told whether it
is open and where it hangs — it owns neither — and teleports to the body so a
card that clips its plot cannot clip the tooltip. It is measured before it is
placed, so it flips at the viewport edge. `items` are built by
`buildTooltipItems` from a plotted row, the series and the colors, or by hand.

| Prop | Type | Notes |
| --- | --- | --- |
| `open` | `boolean` | Draws the tooltip. Nothing renders when closed or with no items. |
| `x` / `y` | `number` | Viewport point the tooltip hangs off. |
| `label` | `string` | Heads the readings, e.g. the category under the pointer. |
| `items` | `ChartTooltipItem[]` | One entry per reading, in order. |
| `rows` | `Record<string, unknown>[]` | The rows behind the reading, for a custom body. |
| `children` | `(slot) => JSX.Element` | Replaces the default body. |
| `dir` / `class` | | Layout direction and root class fallthrough. |

The pure core, `buildTooltipItems`, ranks series rows by magnitude (biggest
first), keeps context rows in the author's order after every series, and prints
a normalized series' share alongside its measured value. `seriesLabel` gives the
label every reading uses.


## Accessibility

An echarts plot is a single SVG element with no per-datapoint nodes, so every
chart renders the plot as `role="img"` with an accessible name and lays the
same data out in a visually-hidden `<table>`. Pass `aria-label` to name a chart
that has no `title`.

## Theming

Colors come from the runtime custom properties only:

- `--chart-1…8` — the categorical series ramp, light and dark;
- `--chart-grid` (falls back to `--outline-gray-1`) — gridlines;
- `--chart-axis` (falls back to `--outline-gray-3`) — axis lines and ticks;
- `--ink-gray-5` — axis labels.

The chrome around a plot reads the shared semantic tokens, so it follows the
light/dark axis too: `--ink-gray-8` / `--ink-gray-5` for the title row,
`--surface-elevation-1` for the loading placeholder, `--ink-red-7` for the
error line, and `--surface-elevation-2` / `--outline-gray-1` / `--shadow-lg`
for the tooltip surface.

Override any of them on the chart or an ancestor to retune it; no component
change is needed.

## Follow-ups

Scatter reference lines (thresholds and quadrant dividers) are not ported yet.
The external `ChartTooltip` and its `buildTooltipItems` core ship, but the
echarts charts still read out through echarts' own axis pointer rather than
driving that tooltip from pointer events — wiring the two together is left for
a follow-up, so an app that wants the shared tooltip drives it itself.

