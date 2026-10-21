---
'@newui/organisms': patch
---

`@newui/organisms` stops exporting the Kanban board's drag engine.

`export *` from `KanbanBoard/index.ts` made `createKanbanDrag` and six tuning
constants (`EDGE_SPEED`, `LIFT_DELAY`, `SETTLE_MS`, …) public API, so changing a
threshold was a breaking release. The barrel now exports the block,
`placeKanbanItem` (documented in `spec/kanban-board.md`) and the types consumers
use (`KanbanColumn`, `KanbanMove`, `KanbanTone`, `KanbanBoardProps`). The
board's own tests import the drag module directly, which is where an internal
belongs.

Found by `packages/organisms/src/exports.test.ts`, which pins the composed
layer's surface by name alongside the other atomic package export tests.
