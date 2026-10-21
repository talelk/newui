/**
 * The block, the placement helper its controlled consumers need, and the types
 * — not the drag engine.
 *
 * `drag.ts` is the implementation of the gesture: tuning constants and a
 * pointer-state machine. They were reaching consumers through `export *`, which
 * made `EDGE_SPEED` public API and a tuning change a breaking one. The board's
 * tests import that module directly, which is where an internal belongs.
 */
export {
  KanbanBoard,
  type KanbanBoardProps,
  type KanbanColumn,
  type KanbanMove,
  type KanbanTone,
  placeKanbanItem,
} from './KanbanBoard'
