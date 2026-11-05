---
"@talelk/newui-organisms": minor
---

New `WidgetGrid` organism: a tiling dashboard with header drag, corner resize,
12-column snap and push-down reflow. The layout is one JSON document
(`{ v: 1, widgets: { [id]: { x, y, span, rows, hidden? } } }`) that the grid
emits through `config`/`onConfigChange` and never stores — persist it with
`createConfigStore`. Tombstones keep undo-remove, `editable` gates every
affordance, the resize handle is a keyboard-operable `role="separator"`, and
below `md` the grid stacks without clobbering desktop geometry.
