# WidgetGrid

`WidgetGrid` — a dashboard that tiles widgets, drags them around, and keeps
the whole layout as one JSON document. From `@talelk/newui-organisms`.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `config` | `WidgetGridConfig` | — | controlled document; the grid moves only when the app applies what it reports |
| `defaultConfig` | `WidgetGridConfig` | empty | the document an uncontrolled grid starts from |
| `onConfigChange` | `(config: WidgetGridConfig) => void` | — | the whole document, emitted on every user change |
| `columns` | `number` | `12` | column tracks |
| `rowHeight` | `number` | `64` | one row's height, in px |
| `editable` | `boolean` | `false` | the mode gate: drag, resize and remove, and their handles |
| `resettable` | `boolean` | `false` | render a "Reset layout" control that emits the code defaults |
| `label` | `string` | `'Widgets'` | accessible name for the region |
| `class` | `string` | — | merged into the root |
| `children` | `JSX.Element` | required | `WidgetGrid.Widget` tiles |

### `WidgetGrid.Widget`

| prop | type | default | notes |
| --- | --- | --- | --- |
| `id` | `string` | required | the widget's identity across sessions; renaming it loses its position |
| `span` | `number` | `12` | default columns to span, until the user's layout overrides it |
| `rows` | `number` | `1` | default rows to span |
| `minSpan` | `number` | `1` | narrowest the resize may take it, in columns |
| `minRows` | `number` | `1` | shortest the resize may take it, in rows |
| `title` | `JSX.Element` | — | the header's text, doubling as the widget's accessible name |
| `class` | `string` | — | merged into the tile |
| `children` | `JSX.Element` | required | the body — whatever owns its own gestures inside |

## The document

```json
{
  "v": 1,
  "widgets": {
    "kpi-row": { "x": 0, "y": 0, "span": 12, "rows": 1 },
    "trend":   { "x": 0, "y": 1, "span": 8,  "rows": 4 },
    "breakdown": { "x": 8, "y": 1, "span": 4, "rows": 4, "hidden": true }
  }
}
```

It is plain JSON — it fits the config store's 64 KB cap and survives deploys.
The grid **emits** the document and stores nothing; persisting it is one
`createConfigStore.save` line in the app. Every commit materializes the whole
resolved layout, so feeding a document back in reproduces the grid exactly,
and entries for widgets that are not currently rendered survive untouched.
`normalizeWidgetGridConfig` reads documents back from storage, clamping every
entry into the grid instead of trusting it.

**Removed widgets keep a tombstone.** A removal sets `hidden: true` and leaves
the geometry behind, so "undo remove" is restoring one flag; purge on migrate.
`restoreWidgetGrid` flips a tombstone back.

## Behavior

- **The header is the drag handle, never the body.** A chart owns its body
  gestures; grabbing anywhere else would fight it. A press becomes a drag
  after 4px of travel, a ghost follows the pointer, and the drop snaps to the
  column track. Escape cancels.
- **The corner is the resize handle.** Bottom-right, pointer-driven with the
  same threshold, with a live preview and one commit on release.
- **The handle is the keyboard twin.** It is a `role="separator"` with a
  value: `ArrowLeft` / `ArrowRight` resize by one column, `ArrowUp` /
  `ArrowDown` (or `Shift` with them) by one row, and `Home` / `End` jump to
  the widget's `minSpan` and the grid's right edge.
- **Widgets reflow, they never overlap.** Whatever a drop lands on pushes
  down — the Grafana behavior. The widget you dragged (and everything below
  it) moves; the furniture above it does not.
- **`editable` is a gate, not a style.** Off, there is nothing to drag, no
  handle in the tab order, and no remove button. A dashboard that is always
  draggable is a dashboard you ruin by accident.
- **Below `md` the grid stacks.** Every widget goes full-width and keeps its
  rows, so relative proportions survive; pointer gestures rest there, which
  keeps a thumb from clobbering desktop geometry.
- **Reset restores the code defaults.** `resettable` renders a "Reset layout"
  control that drops every override and keeps every tombstone — a reset
  re-lays-out the dashboard, it does not resurrect widgets the user removed.

## Styling hooks

`data-slot` (`widget-grid`, `widget-grid-toolbar`, `widget-grid-layout`,
`widget-grid-item`, `widget-grid-header`, `widget-grid-body`,
`widget-grid-resize`), `data-state="dragging"` on a lifted widget, and
`data-dragging` / `data-resizing` on the root while a gesture is in flight.
The document itself is the seam between the grid and the app; the geometry is
applied through `grid-column` / `grid-row` on each tile.
