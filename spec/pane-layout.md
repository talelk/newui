# PaneLayout

`PaneLayout` — two panes side by side, with a draggable divider.

## Why a layout

A workspace reaches for this the moment it has a list and a record: mail's
conversations beside the message, a ticket queue beside the ticket, a file tree
beside the preview. Mail was hand-rolling it with a grid, a CSS variable and a
slider in the *toolbar* — plumbing per consumer, and the resize affordance in
the wrong place.

## Props

| prop | type | notes |
| --- | --- | --- |
| `start` | `JSX.Element` | the first pane: a list, a tree, a queue |
| `end` | `JSX.Element` | the second pane: the record the first selects |
| `size` | `number` | percent of the frame the start pane takes, controlled |
| `defaultSize` | `number` | percent the uncontrolled layout starts at. Default `36` |
| `startSize` | `number` | deprecated alias of `defaultSize` |
| `onSizeChange` | `(size: number) => void` | the requested percent on every user change |
| `minStartSize` | `number` | narrowest the split may go. Default `20` |
| `maxStartSize` | `number` | widest the split may go. Default `70` |
| `compactAt` | `'sm' \| 'md' \| 'lg'` | below this breakpoint one pane shows. Default `lg` |
| `active` | `'start' \| 'end'` | which pane a compact viewport shows. Default `start` |
| `resizable` | `boolean` | allow dragging the divider. Default `true` |
| `resizeLabel` | `string` | accessible name of the control. Default `Resize panes` |
| `collapsible` | `'start' \| 'end' \| 'both'` | which panes may fold away |
| `collapsed` | `'none' \| 'start' \| 'end' \| 'both'` | which panes are folded, controlled |
| `defaultCollapsed` | `'none' \| 'start' \| 'end' \| 'both'` | fold state when uncontrolled. Default `none` |
| `onCollapseChange` | `(collapsed) => void` | the whole fold state on every user change |
| `class` | `string` | merged into the frame |

## Behavior

- **The divider is the control.** It is a `role="separator"` with
  `aria-orientation="vertical"` and a value: dragging with a pointer, `ArrowLeft`
  / `ArrowRight` (Shift for a coarse step), `Home` / `End` for the bounds, and a
  double-click back to `defaultSize`. Its value is the start pane's width **as a
  percentage**, so the split survives a resize of the window — a pixel width
  would leave a 320px list looking like a third of a phone.
- **`aria-controls` points at the start pane**, which is what the value
  describes; the pane carries the `id`.
- **Nothing is stored here.** `size`/`onSizeChange` and
  `collapsed`/`onCollapseChange` are plain controllable signals (the shared
  `createControllableSignal` pattern) with `defaultSize` / `defaultCollapsed`
  for the uncontrolled case. "Remember this split" is one config-store line in
  the app — the layout never touches storage, which keeps SSR and tests clean.
- **Folding is the divider's, too.** With `collapsible` set, `Enter` / `Space`
  on the divider folds the pane it is nearer — the narrower one — and unfolds
  the pane it folded; with one collapsible side that side is simply the target.
  A folded pane leaves the accessibility tree (`display: none`) and the divider
  moves to the edge (`aria-valuenow` `0` or `100`, bounds widened to match), so
  it stays operable: arrows, `Home`/`End` or `Enter` unfold it, and the split
  returns to the remembered size. Dragging at a folded edge unfolds the moment
  the pointer crosses back over the divider.
- **A collapsed detail pane *is* the mobile state.** Below `compactAt` the grid
  is a single column; a collapsed pane there just shows the other one, so the
  same persisted fold state reads correctly on a phone and on a desktop.
- **One pane on a narrow viewport.** Below `compactAt` the grid is a single
  column showing `active`; the other pane is `display: none`, so it leaves the
  accessibility tree rather than sitting offscreen. The app switches `active`
  when a record opens and renders its own back affordance — the layout never
  hides content the reader cannot get back to.
- **A fixed split says so.** `resizable={false}` renders no divider control at
  all: nothing in the tab order and nothing to drag, which is the honest
  rendering of "this split does not move".
- **Three panes are two layouts.** A `PaneLayout` inside either pane gives a
  three-panel workspace with independent separators — nesting is legal because
  panes accept any children, and it is the composition, not a template. Give the
  inner layout `class="h-full"` so it fills its pane.

## Styling hooks

`data-slot` (`pane-layout`, `pane-start`, `pane-resizer`, `pane-end`),
`data-collapsed` (`start`, `end`, `both`) on the frame, `data-state="collapsed"`
on a folded pane, and `data-resizing` on the frame while a drag is in flight.
The split itself is the `--pane-start` custom property on the frame, so a
consumer can drive it from its own control as well as from the built-in one.
