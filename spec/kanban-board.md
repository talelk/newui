# KanbanBoard

`KanbanBoard` — columns of cards you drag between them, from `@talelk/newui-organisms`.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `columns` | `KanbanColumn<T>[]` | — | controlled; the board never changes them |
| `defaultColumns` | `KanbanColumn<T>[]` | `[]` | uncontrolled; the board owns them |
| `onMove` | `(move: KanbanMove<T>) => void` | — | every accepted move, controlled or not |
| `children` | `(item: T) => JSX.Element` | required | the card *body*; the frame is the block's |
| `renderActions` | `(item: T) => JSX.Element` | — | replaces the built-in move menu |
| `label` | `string` | `'Board'` | accessible name for the region |
| `itemLabel` | `(item: T) => string` | `item.id` | how a card is named in its menu |
| `emptyColumn` | `(column) => JSX.Element` | — | rendered in a column with no cards |
| `loading` | `boolean` | `false` | shared skeleton instead of the board |
| `error` | `JSX.Element` | — | shared error state |
| `onRetry` | `() => void` | — | retry action in the error state |
| `class` | `string` | — | |

The board also renders the shared `DataState` for `loading`, `error` and an
empty column set.

```ts
interface KanbanColumn<T> {
  id: string
  name: string // heading, accessible name, and the move menu's entry — one string
  theme?: 'gray' | 'amber' | 'blue' | 'green' | 'red' | 'violet' // status dot
  items: T[]
  summary?: JSX.Element
  action?: { label: string; icon?: IconProp; onClick?: () => void }
}

interface KanbanMove<T> {
  item: T
  itemId: string
  from: { column: string; index: number }
  to: { column: string; index: number }
  columns: KanbanColumn<T>[] // already moved — the next value when controlled
}
```

## Controlled boards

`move.columns` is the board's view of the move: the right order, with the item in
its new column. **It does not rewrite your records.** If an item carries its own
group — `deal.stage`, `task.list`, `issue.project` — that field is yours to set
from `move.to.column`, or the value you feed back in will say the item is still
where it was. The Deals recipe does exactly that, in one `flatMap`.

## `to.index` counts the *other* items

The index is measured over the column **with the moved item taken out** — the
number a `splice` pair wants, and the number the gesture naturally produces.
Getting this wrong is an off-by-one that only appears when dragging *downwards*,
so it is stated once, in `placeKanbanItem`, and pinned by tests in both
directions.

`placeKanbanItem` is exported: a controlled board that maps its own model needs
the semantics, not just the behaviour. It returns its input unchanged when the
move changes nothing, so a consumer diffing the value does not re-render the
world.

## Behaviour

**The keyboard path is not an afterthought.** Every card carries a menu listing
the other columns, so a card can be moved without a pointer or a drag. The
reference implementation is pointer-only, which puts reordering out of reach
without a mouse; that is a gap to close, not a detail to copy.

**Reordering is previewed, then committed once.** A drag moves a *preview* of the
columns; the drop is reported a single time, at the end. Cancelling — Escape,
`pointercancel`, or releasing where you started — is discarding the preview, so
there is no restore path that can drift out of sync with the data, and a
controlled board never receives a move it did not accept.

**Geometry, per frame.** A mouse lifts after 4px of travel; a touch holds for
250ms and stops being a candidate if it drifts 8px, because a finger that moves
is scrolling. Position, the hit-test and edge auto-scroll all run in one rAF
loop: a held pointer at the edge keeps scrolling the containers under itself,
which moves the slots it is not moving over.

**The insertion index skips the card in flight** (`:not([data-dragging])`), which
is what makes the target self-stabilising — inserting pushes the boundary card
away from the pointer, so the choice cannot oscillate between two neighbours.

**Columns are walked by id, never by object.** A controlled board is handed fresh
column objects whenever its owner re-renders — a keystroke in a filter, a
re-sorted list. Keying the rows on those objects would throw each column's DOM
away and rebuild it: the scroll position resets, the ScrollArea machine remounts,
and a card in flight loses the element the gesture is holding.

## Narrow screens

Below `lg` the board scrolls sideways with column snapping — a column that lands
half off the edge is a column you cannot read — and the reference's own mobile
recipe is the same panner. Wide, it is a drag surface, and snapping under a
pointer mid-drop is just fighting the user.

## Motion

The cards around a moving slot are animated with FLIP (`Element.animate`), 200ms.
The ghost pops on grab and glides onto the slot over 150ms on release. Both are
skipped entirely under `prefers-reduced-motion: reduce` — the Web Animations API
does not honour it on its own.

## Not yet

- No column reordering, no column resizing, no collapsible columns.
- No multi-select drag: one card at a time.
- No drop position *within* a card (fractional indices). A drop lands between two
  cards, which is what every board in the reference set does.

## Focus and touch

- A move from a card's “Move to…” menu restores focus to the moved card's action
  trigger and scrolls the card into view. The trigger is recreated in its
  destination column, so dropping focus to `<body>` is not acceptable.
- Below `lg` the column add control and card action trigger use a 40px hit area
  while keeping the 28px visual glyph; desktop density stays 28px.
- Columns are 288px wide; at `xl` they narrow to 256px so four stages fit a
  1440px application viewport without hiding the last stage. At `2xl` they return
  to 288px.
