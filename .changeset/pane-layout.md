---
'@newui/templates': minor
---

`PaneLayout` — two panes side by side, with a draggable divider.

The shape a workspace reaches for the moment it has a list and a record: mail's
conversations beside the message, a ticket queue beside the ticket, a file tree
beside the preview. Mail was hand-rolling it with a grid, a CSS variable and a
**slider in the toolbar** — plumbing per consumer, and the resize affordance in
the wrong place.

- **The divider is the control.** `role="separator"`, `aria-orientation`,
  `aria-valuenow/min/max` and `aria-controls`. It drags with a pointer, moves
  with the arrow keys (Shift for a coarse step), jumps to the bounds with
  Home/End, and returns to `startSize` on double-click.
- **The value is a percentage.** The split survives a resize of the window; a
  pixel width leaves a 320px list looking like a third of a phone.
- **One pane on a narrow viewport.** Below `compactAt` the grid is a single
  column showing `active`; the other pane leaves the accessibility tree rather
  than sitting offscreen. The app switches `active` when a record opens and
  renders its own back affordance.
- **Arrangement, not chrome.** No borders, no background, no scroll container:
  a pane's overflow belongs to the pane, and an app's borders belong to the app.
  `--pane-start` is on the frame, so a consumer can drive the split from its own
  control too.
- `resizable={false}` renders no control at all — nothing in the tab order and
  nothing to drag, which is the honest rendering of a split that does not move.
