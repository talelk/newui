# Widget grid — prototype (rough take, not shipped code)

Reacts to ticket #27. This is the artifact to argue with, not to build on.
Everything below is provisional: props, names, the whole serialization shape.

## What it is

`Dashboard` grows past a static CSS grid: widgets become first-class children
with a persisted *layout config* — the dashboard-config document of ticket
#24. Drag to move, drag the corner to resize, snap to a 12-column track.

## API sketch

```tsx
<WidgetGrid
  config={gridConfig}          // the persisted document, app-owned
  onConfigChange={setConfig}   // controllable — same pattern as PaneLayout
  columns={12}
  rowHeight={64}
  density="compact"
>
  <WidgetGrid.Widget id="kpi-row" span={12} rows={1}>
    <StatGrid items={stats} />
  </WidgetGrid.Widget>
  <WidgetGrid.Widget id="trend" span={8} rows={4}>
    <AreaChart data={trend} />
  </WidgetGrid.Widget>
  <WidgetGrid.Widget id="breakdown" span={4} rows={4}>
    <DonutChart data={breakdown} />
  </WidgetGrid.Widget>
</WidgetGrid>
```

- `id` is the widget's identity across sessions — renaming it is losing its
  position, so it is required and stable.
- `span`/`rows` are the *default* geometry; user edits win and land in
  `config`.
- `config` is the serializable document: `{ v, widgets: { [id]: { x, y, span,
  rows, hidden? } }, order }` — JSON, fits the 64KB cap, survives deploys.

## Layout config document

```json
{
  "v": 1,
  "widgets": {
    "kpi-row":  { "x": 0, "y": 0, "span": 12, "rows": 1 },
    "trend":    { "x": 0, "y": 1, "span": 8,  "rows": 4 },
    "breakdown":{ "x": 8, "y": 1, "span": 4,  "rows": 4 }
  }
}
```

Removed widgets keep a tombstone (`hidden: true`) for one release so "undo
remove" works; purge on migrate.

## Interaction sketch (the parts worth arguing about)

- **Move:** pointer down on the widget *header* (never the body — charts
  own their body gestures), 4px threshold, ghost follows, drop snaps.
- **Resize:** bottom-right handle only; keyboard twin: focus handle,
  arrows = ±1 column, Shift+arrows = ±1 row, Home/End = min/max.
- **Reflow:** widgets below a dropped one push down, they do not overlap —
  the Grafana behavior everyone expects.
- **Edit mode:** `editable?: boolean` — view-only by default, an
  "Edit layout" toggle enters the mode and shows handles + the remove button.
  A dashboard that is always draggable is a dashboard you ruin by accident.
- **Persistence:** debounced `onConfigChange` into the config store
  (ticket #24); "Reset layout" restores defaults from code.
- **Responsive:** below `md`, `span` collapses to 12 and `rows` keeps its
  relative ratio; user edits at small widths do not clobber desktop geometry
  (separate `mobile` block in the document — maybe, this is the weakest part
  of the sketch).
- **Cross-filter:** widgets read `useDashboardState()` (ticket #25) — the
  grid itself knows nothing about time ranges.

## What is deliberately bad here (so the argument is honest)

- No virtualization for >~30 widgets; fine for v1, flag it.
- FLIP animation for reflow is hand-rolled and probably wrong.
- No shared resize across breakpoints; the mobile story is a guess.
