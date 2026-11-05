# Research: ECharts dataZoom, brush and linked charts

Resolves [#15](https://github.com/talelk/newui/issues/15). Sources: the installed
`echarts@6.1.0` package source (`node_modules/.pnpm/echarts@6.1.0/node_modules/echarts/lib/…`,
read-only) and the official Apache ECharts docs (links in Sources). Every claim below is
either pinned to a file in the installed package or to an official doc page.

## 1. What's built in (nothing to wrap)

### 1.1 dataZoom — range selection on axes

Two component types, both pure zrender so they work identically under the SVG renderer:

- **`type: 'slider'`** — the visible range slider (data shadow, two handles, a move
  handle, and brush-to-zoom on the track via `brushSelect`, default `true`
  (`SliderZoomModel.js:112`)). Layout options `left/right/top/bottom/width/height`,
  `orient`, `fillerColor`, `handleStyle`, … (`option.dataZoom-slider.md`).
- **`type: 'inside'`** — wheel-zoom / drag-pan inside the plot: `zoomOnMouseWheel`,
  `moveOnMouseMove`, `moveOnMouseWheel`, `preventDefaultMouseMove`, `zoomLock`,
  `disabled` (`InsideZoomModel.js:55-62`).

Shared behaviour (`DataZoomModel.js:408`, `option.dataZoom-slider.md`):

- Window expressed as `start`/`end` (percent 0–100) or `startValue`/`endValue`
  (absolute; `rangeMode` auto-switches between the two — `'percent'` for slider/inside
  interaction, `'value'` for toolbox zoom).
- `filterMode: 'filter' | 'weakFilter' | 'empty' | 'none'` controls whether out-of-window
  data is dropped, NaN'd, or kept — this decides whether the *other* axis auto-fits.
- `minSpan`/`maxSpan`/`minValueSpan`/`maxValueSpan` clamp the window; `zoomLock` allows
  panning only; `throttle` (default 100 ms) rate-limits the `datazoom` event.
- Controls several axes at once via `xAxisIndex`/`yAxisIndex` arrays; works on cartesian,
  polar, single, calendar and matrix coordinates (calendar/matrix since v6).

Events/actions:

- User interaction dispatches `dataZoom` internally, which emits the lowercase
  **`datazoom`** event (`registerAction('dataZoom', …)` lowercases the type,
  `core/echarts.js:2267-2292`; payload `start/end` percents plus `startValue/endValue`
  when triggered from the toolbox — `api.events.md#datazoom`).
- Programmatic: `chart.dispatchAction({ type: 'dataZoom', dataZoomIndex, start, end,
  startValue, endValue })` (`api.action.md#dataZoom.dataZoom`).
- Toolbox `feature.dataZoom` adds a box-zoom button; it activates through
  `dispatchAction({ type: 'takeGlobalCursor', key: 'dataZoomSelect',
  dataZoomSelectActive: true })` (`api.action.md#dataZoom.takeGlobalCursor`,
  `toolbox/feature/DataZoom.js`).

### 1.2 brush — selection boxes with data output

The `brush` component (`component/brush/`, `option.brush.md`) gives pointer-drawn
selection areas (`rect`, `polygon`, `lineX`, `lineY`; multiple areas with
`brushMode: 'multiple'`):

- `seriesIndex` / `xAxisIndex` / `yAxisIndex` / `geoIndex` scope the brush to coordinate
  systems; `brushLink` maps selected `dataIndex`s onto *other* series whose `data` is
  index-aligned (`visualEncoding.js:93-119`).
- Visual feedback is declarative: `inBrush` / `outOfBrush` visual channels (color, opacity,
  symbolSize, …). Out-of-brush defaults to `#ddd`.
- Selection is reported by the **`brushSelected`** event, payload
  `batch[].{brushId, areas, selected: [{seriesIndex, dataIndex[]}]}` — i.e. raw data
  indices per series (`install.js:90-98`, `api.events.md#brushselected`).
- Throttling: `throttleType: 'debounce' | 'fixRate'` + `throttleDelay` (default `fixRate`,
  delay 0 = fires on every move — expensive; use `debounce` for anything that recomputes).
- Programmatic: `dispatchAction({ type: 'brush', areas: [...] })` sets/clears areas
  (`type: 'brush'`, `event: 'brush'`, `install.js:57-66`; `api.action.md#brush.brush`);
  `brushEnd` event since v4.5. Mouse activation without a toolbox button is
  `dispatchAction({ type: 'takeGlobalCursor', key: 'brush', brushOption: {…} })`
  (`api.action.md#brush.takeGlobalCursor`) — this is exactly what the toolbox `brush`
  feature's buttons do (`toolbox/feature/Brush.js`).
- Related but separate: **data selection** (`select`/`unselect`/`toggleSelect` actions,
  `selectchanged` event, `api.events.md#selectchanged`) and visualMap range selection
  (`selectDataRange` → `datarangeselected`).

### 1.3 Cross-chart linkage

Three mechanisms, all built in:

1. **`echarts.connect(group)` / `disconnect(group)`** (`core/echarts.js:2181-2201`;
   `api.echarts.md#connect`). Charts with the same `chart.group` and a connected group id
   mirror *every registered action's event* onto each other: tooltip show/hide, legend
   toggle, `datazoom`, brush areas, roam, timeline, highlight/downplay
   (`connectionEventRevertMap`, `core/echarts.js:2110` + `2318-2321`; the forwarding loop
   is `core/echarts.js:2043-2071`). Loop protection is internal
   (`CONNECT_STATUS_PENDING/UPDATING`), so a connected pair cannot ping-pong.
   `event.escapeConnect` opts a single event out.
2. **Manual relay**: listen on one instance (`chart.on('datazoom', …)`) and
   `dispatchAction` on the other(s), guarding with the `from` field to avoid loops. This
   is what you need when charts live in different Solid components that may mount in any
   order, or when you want to transform/limit what syncs.
3. **`axisPointer.link`** (`option.axisPointer.md#link`) — cursor/axisPointer sync across
   charts in a connected group, without mirroring full actions.

### 1.4 Drilldown-style events

There is no "drilldown" API by that name; what exists is composable parts:

- **Sunburst**: `nodeClick: 'rootToNode'` (default) drills in on click; programmatic
  `sunburstRootToNode`; `root` option sets the initial focus
  (`sunburst/SunburstSeries.js:126-127`, `api.action.md#treemap.treemapRootToNode` family).
- **Treemap**: `treemapZoomToNode` / `treemapRootToNode` actions, `leafDepth`, and the
  built-in breadcrumb bar (`treemap/treemapAction.js:55-64`).
- **Any series**: the `click` mouse event carries `componentType`, `seriesType`,
  `seriesIndex`, `name`, `dataIndex`, `value` (`api.events.md#mouse-events`) — the generic
  drilldown primitive is "listen to click, replace the data".
- **Map/geo**: region `click` gives `name`; drilldown is click + `registerMap` + new
  option. `georoam`/`geoselectchanged` cover roam and region selection.

## 2. What needs wrapping

- **Module registration.** `useChart` registers only `TooltipComponent`, `LabelLayout`,
  `SVGRenderer` (`packages/charts/src/useChart.ts:19`). Any chart that wants dataZoom,
  brush, toolbox or the `select` machinery must `echarts.use([DataZoomComponent,
  DataZoomSliderComponent, DataZoomInsideComponent, BrushComponent, ToolboxComponent, …])`
  first — tree-shakeable exports exist for all of them (`echarts/lib/export/components.js:54-68`).
  This is already the documented escape hatch ("callers register their required engine
  capabilities before passing custom options", `spec/charts.md`), but a shipped
  `interactive`/`zoomable` prop must own the registration and the size budget.
- **Event → props bridge.** Nothing in `@talelk/newui-charts` exposes echarts events today.
  Wrapping means: bind `chart.on('datazoom' | 'brushSelected' | 'click' | …)` in `onInit`
  and surface `onZoomChange` / `onSelectionChange` / `onDrill` callbacks with
  newui-shaped payloads (indices + labels, not echarts internals).
- **Controlled state plumbing.** Range/selection must round-trip through
  `createControllableSignal`-style props (`window={[startValue, endValue]}` +
  `onWindowChange`) so consumers own the state like everything else in this kit.
- **Accessible alternatives.** Pointer-only gestures need an atom-level equivalent
  (see §3.4) — a `RangeSlider`-driven window control and a keyboard-operable
  "select range" (e.g. table-row selection, reusing the fallback table) are wrappers we
  must build; echarts gives us none.
- **Linkage manager.** A small `useChartGroup` (namespaced group id, `connect` after both
  instances exist, `disconnect`/group cleanup on unmount) is worth having because
  `connect`'s group registry is global module state (see §3.3).

## 3. Constraints under our lifecycle and a11y fallback

### 3.1 `notMerge: true` is the boss

`useChart` re-applies the whole option with `setOption(option, { notMerge: true })` on
every reactive change (`useChart.ts:71-75`). Consequences, all verified against the
package's action/model code:

- **Every interaction state is wiped** when any tracked dependency of `option()` changes:
  the dataZoom window (it lives on the dataZoom *model*, restored from the option's
  `start/end` on rebuild), brush areas (`BrushModel.setAreas` is action state), sunburst/
  treemap drill focus, toolbox zoom mode. `notMerge` rebuilds components from the passed
  option, so whatever `start: 0, end: 100` the builder emits wins over the user's zoom.
- **The fix is the same for all of them**: interactive state must be *lifted* — the option
  builder must emit `start/end` (or `startValue/endValue`, or `brush: { areas }`) from the
  same signal the event handler writes, so a rebuild re-applies the user's state instead of
  erasing it. With `startValue/endValue` prefer `rangeMode: ['value','value']`; with percent
  mode the window silently drifts when data grows (the docs' dynamic-data warning).
- **Do not let the round-trip trigger `setOption` at all if you can avoid it.** A
  datazoom→signal→effect→`setOption(notMerge)` loop is technically stable (setOption does
  not re-fire `datazoom`/`brushSelected` — `api.events.md#brushselected`), but rebuilding
  all components *during* a slider drag interrupts the gesture and costs a full re-render.
  Preferred shape: option carries the current window (survives unrelated rebuilds), and
  programmatic changes go through `dispatchAction` instead of a rebuild.
- `untrack(option)` on init (`useChart.ts:54`) means the instance starts from the snapshot;
  the first `onInit` sees the pre-effect option. Fine, but bind listeners knowing the very
  next tick may `notMerge`.

### 3.2 `onInit` is the only instance hook

`ChartBase` exposes the instance only through `onInit` (`ChartBase.tsx:30`, `52`); the
`chart` signal returned by `useChart` is not forwarded. Wrappers must capture the instance
there. Handlers registered with `chart.on` die with `instance.dispose()` in cleanup
(`useChart.ts:66`), so listener leaks are not a concern — but `onInit` runs once per mount,
so anything that must survive a re-mount (group membership, cross-instance maps) needs
Solid-side state, not closure state on the instance.

### 3.3 `connect` groups are global

`connectedGroups` and `instances` are module-level (`core/echarts.js:2110-2123`). Effects:

- A group id links *every current and future* instance carrying it — two unrelated widgets
  that both pick `group: 'sync'` on the same page will silently link. Namespaced ids
  (per app tree / per `useChartGroup` instance) are mandatory.
- `disconnect(id)` flips the flag globally, killing linkage for any other pair using the
  same id. Cleanup should dispose instances and drop local references rather than
  `disconnect` a shared id.
- Linking must happen after *both* instances exist; with lazy-mounted organisms that means
  "connect when both signals are defined" (a `createEffect` over the two `onInit` captures),
  not connect-at-init.
- SSR: `connect` is harmless on the server (no instances) and our charts don't init there
  (`onMount` only), so no new SSR surface.

### 3.4 a11y fallback table

The plot is `role="img"` + `aria-label` with a visually-hidden table (`ChartBase.tsx:66-80`);
the SVG has no per-datapoint nodes, and echarts' own interactive parts (slider handles,
toolbox icons, brush surface) are **not focusable, not keyboard-operable, and carry no
semantics** — they're zrender hit areas inside the labeled `img`. Under our contract
(spec/charts.md: "generated fallback table exposes data to screen readers without requiring
pointer tooltips", "legend buttons support keyboard focus and activation"):

- `datazoom`/`brush`/box-zoom are pointer-only. Anything we ship must have a
  keyboard-accessible twin outside the canvas (range slider atom, preset ranges, or
  table-row selection) whose state feeds the same signal — otherwise the interaction is
  pointer-only by construction and fails our "not colour/pointer alone" rule.
- The fallback table must reflect the *current* window/selection, not the full dataset —
  i.e. the zoom/selection signal also drives the table rows (or adds a caption like
  "showing Jan–Jun of 24 months"). A static table next to a zoomed plot is a lie.
- `brushSelected` gives raw indices; the accessible expression is the table's selected
  state (checkboxes/`aria-selected`), not the brush rectangle.
- Toolbox (if ever exposed) is icon buttons with no ARIA — prefer our own toolbar atoms
  dispatching `takeGlobalCursor`/`dataZoom` actions.
- Reduced motion: `useChart` already forces `animation: false` (`useChart.ts:40-49`);
  zoom jumps stay instant, which is the correct degraded behaviour — no extra work.

### 3.5 Renderer and version notes

- SVG renderer: no known limitation for dataZoom/brush/connect (all zrender-level);
  `getConnectedDataURL` even supports SVG output (`core/echarts.js:2229-2246`).
- Installed **echarts 6.1.0**. v6 changes relevant to us: new default theme and component
  positions (v6 upgrade guide), `tooltip.valueFormatter`'s second argument became
  `rawDataIndex` (v6.1 — matters if a formatter maps indices back to rows through a
  dataZoom-filtered view), axis breaks (`expandAxisBreak` actions, v6.0), and
  `dataZoom-slider` gained `coordinateSystem: 'calendar' | 'matrix'` layout.
- v6.1.0 open-issue note: programmatic `takeGlobalCursor` dataZoom toggling had a
  double-trigger bug (#21661); retest when bumping.

## 4. Recommendation for the chart-interactions ticket

Build interactions as **controlled signals in the option builder**, not as side-channel
state: option always carries the current window/selection/drill-root; `onInit` binds
`datazoom`/`brushSelected`/`click` and writes them back through `onOpenChange`-style
callbacks (with `from`-guarding); programmatic changes use `dispatchAction` to avoid
`notMerge` churn; ship a `useChartGroup` for linkage with namespaced ids; and pair every
pointer gesture with a keyboard-accessible control plus a fallback table that tracks the
current slice.

## Sources

- Installed package (read-only): `echarts@6.1.0` — `lib/core/echarts.js` (connect,
  registerAction, connectionEventRevertMap), `lib/component/dataZoom/*` (models,
  `dataZoomAction.js`, `install.js`), `lib/component/brush/{install.js,BrushModel.js,visualEncoding.js}`,
  `lib/component/toolbox/feature/{Brush,DataZoom,Restore}.js`,
  `lib/chart/{sunburst,treemap}/*`, `lib/export/components.js`.
- Official docs (primary):
  <https://echarts.apache.org/en/llms-documents/api-parts/api.echarts.md> (connect/disconnect),
  <https://echarts.apache.org/en/llms-documents/api-parts/api.events.md> (datazoom, brushselected,
  selectchanged, mouse events), <https://echarts.apache.org/en/llms-documents/api-parts/api.action.md>
  (dataZoom, brush, takeGlobalCursor, treemap actions),
  <https://echarts.apache.org/en/llms-documents/option-parts/option.dataZoom-slider.md>,
  <https://echarts.apache.org/en/llms-documents/option-parts/option.brush.md>.
- <https://echarts.apache.org/handbook/en/basics/release-note/v6-upgrade-guide> and
  <https://echarts.apache.org/en/changelog.html> (v6/v6.1 breaking changes).
- Repo: `spec/charts.md`, `packages/charts/src/{ChartBase.tsx,useChart.ts}`.
