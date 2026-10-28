---
name: newui-charts
description: >
  Use when rendering charts with @talelk/newui-charts — AreaChart, BarChart,
  LineChart, DonutChart, FunnelChart, HeatmapChart, ScatterChart, SankeyChart,
  Dashboard and NumberCard, or tuning series, axes, palettes and empty/loading
  chart states. Use when the user mentions these chart components or asks for
  analytics visuals in newui.
metadata:
  type: core
  domain: ui
  library: '@talelk/newui-charts'
  library_version: '1.0.2'
sources:
  - talelk/newui:packages/charts/src/index.ts
  - talelk/newui:packages/charts/src/ChartContainer.tsx
  - talelk/newui:packages/charts/src/format.ts
  - talelk/newui:spec/charts.md
---

# newui charts

ECharts-backed Solid components with the SVG renderer and the kit's token
palette. Read the `newui` skill for the vocabulary; charts additionally allow
the palette-only `orange`/`yellow`, which no component `theme` accepts.

## Setup

```tsx no-check
import { AreaChart } from '@talelk/newui-charts'

export function Revenue(props: { points: Array<{ label: string; value: number }> }) {
  return (
    <AreaChart
      title="Revenue"
      aria-label="Revenue by month"
      data={props.points}
      xKey="label"
      yKey="value"
      loading={false}
    />
  )
}
```

## Core patterns

**Every chart carries an accessible name.** The SVG canvas is a image-like
region — pass `aria-label` (the a11y sweep runs on chart stories too).

**Loading/empty states are props, not wrappers.** `loading` renders the
shared shimmer; empty data renders the chart's designed empty surface. Do not
wrap charts in `DataState`.

**Curate with the option builders.** The barrel exports pure helpers
(`normalize.ts`, palette tokens, format helpers) — prefer them over raw
ECharts option objects so the theme stays token-driven.

## Common mistakes

**Don't import charts from the core barrels.** `@talelk/newui-atoms` /
molecules / organisms forbid chart payloads in their size budgets; importing
`@talelk/newui-charts` in a page pulls its engine — keep it on the routes
that render charts.

**Don't hand-pick hex series colors.** The palette derives from semantic
tokens in both color schemes; raw hex fails the token-discipline test and
breaks dark mode.

## Completion

`pnpm verify:affected` runs the chart unit suites; `spec/charts.md` is the
contract.
