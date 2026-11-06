---
'@talelk/newui-charts': minor
---

Chart interactions per issue #28: `zoom`/`defaultZoom` + `onZoomChange` and `brush` + `onBrushChange` on LineChart, AreaChart and BarChart, driven as controlled signals so a `setOption(…, { notMerge: true })` rebuild restores the window and selection instead of erasing them; payloads are translated to data values at the wrapper boundary, never echarts indices or percents. `onPointDblClick` emits the datum behind a double-click (navigation stays app-side — the `route` vocabulary). `useChartGroup(name)` owns namespaced `newui.<name>.<id>` ids for echarts connect-style linked highlighting, with `group` on charts and `ChartCard`; cross-filtering remains `createDashboardState`'s `cross`. Keyboard twins make the pointer gestures operable without a pointer: zoom `+`/`-`/arrows on the focused plot, brush-range entry as two number inputs in the container toolbar, and a fallback table that tracks the current window with a caption.
