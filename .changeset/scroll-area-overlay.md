---
'@newui/atoms': patch
'@newui/molecules': patch
---

`ScrollArea`'s scrollbar is an overlay, and it knows when to leave.

It used to paint a permanent 8px `bg-surface-gray-2` gutter — a gray strip down
the side of a sidebar, and one between every pair of board columns, on surfaces
with nothing to scroll. Three things were wrong with it:

- **It showed when there was nothing to scroll.** The machine already reports the
  axis (`data-overflow-x` / `data-overflow-y`); the bar now hides itself when it
  is `false`.
- **It reserved space.** The track is transparent and the same width it always
  was, so content reaches the edge instead of stopping short of a gutter.
- **It took clicks.** The track was interactive across its whole 10px, and an
  invisible thumb parked over the top corner. The track is now
  `pointer-events-none`, and only a *visible* thumb accepts a drag.

The thumb fades in on pointer hover, while scrolling, and while dragging, with a
150ms transition either way.
