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
| `startSize` | `number` | percent of the frame the start pane takes. Default `36` |
| `minStartSize` | `number` | narrowest the split may go. Default `20` |
| `maxStartSize` | `number` | widest the split may go. Default `70` |
| `compactAt` | `'sm' \| 'md' \| 'lg'` | below this breakpoint one pane shows. Default `lg` |
| `active` | `'start' \| 'end'` | which pane a compact viewport shows. Default `start` |
| `resizable` | `boolean` | allow dragging the divider. Default `true` |
| `resizeLabel` | `string` | accessible name of the control. Default `Resize panes` |
| `class` | `string` | merged into the frame |

## Behavior

- **The divider is the control.** It is a `role="separator"` with
  `aria-orientation="vertical"` and a value: dragging with a pointer, `ArrowLeft`
  / `ArrowRight` (Shift for a coarse step), `Home` / `End` for the bounds, and a
  double-click back to `startSize`. Its value is the start pane's width **as a
  percentage**, so the split survives a resize of the window — a pixel width
  would leave a 320px list looking like a third of a phone.
- **`aria-controls` points at the start pane**, which is what the value
  describes; the pane carries the `id`.
- **The panes are arrangement, not chrome.** `PaneLayout` sets the columns and
  the divider and nothing else: no borders, no background, no scroll container.
  A pane's own overflow belongs to the pane, and an app's borders belong to the
  app — two panes of a mail client and two panes of a file browser do not want
  the same frame.
- **One pane on a narrow viewport.** Below `compactAt` the grid is a single
  column showing `active`; the other pane is `display: none`, so it leaves the
  accessibility tree rather than sitting offscreen. The app switches `active`
  when a record opens and renders its own back affordance — the layout never
  hides content the reader cannot get back to.
- **A fixed split says so.** `resizable={false}` renders no divider control at
  all: nothing in the tab order and nothing to drag, which is the honest
  rendering of "this split does not move".

## Styling hooks

`data-slot` (`pane-layout`, `pane-start`, `pane-resizer`, `pane-end`), plus
`data-resizing` on the frame while a drag is in flight. The split itself is the
`--pane-start` custom property on the frame, so a consumer can drive it from its
own control as well as from the built-in one.
