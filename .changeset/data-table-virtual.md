---
'@talelk/newui-organisms': minor
'@talelk/newui-molecules': minor
---

Virtualized `DataTable` body per issue #21: `virtual` windows the body rows with `@tanstack/solid-virtual` while the toolbar and search stay sticky outside the scroll region and the header sticky inside it. One item per rendered row — group row, record row or detail panel — so grouping, expansion and detail rows compose without the virtualizer knowing about them; off-window rows are spacer `<tr>`s, keeping table semantics, the sticky header and pinned-column stickiness intact. `pageSize` defaults to the whole result when `virtual` is on (the window bounds the DOM, not the page); server mode keeps its page size. The scroll region is the fixed `24rem` `VirtualList` convention, passed through a new `height` prop on `ScrollTable`, and the surface is inert in card mode below `cardBreakpoint`.
