# List

Composes aligned rows and cells for structured content.

## Usage and anatomy

Import `List` from `@talelk/newui-molecules`. The executable example and its copyable
source on `/molecules/list` show the supported composition. Generated prop
tables on that page list every declared property, callback and optional flag.

## Behavior and accessibility

Use List, ListHeader, ListHeaderCell, ListRow, ListCell and ListHeaderCellSort. Column tracks are defined on the list; rows share them. Selection and actions are owned by the caller. Interactive rows need a button or link with keyboard focus.

Table roles belong to the caller: when the list composes a real table, the
caller wraps it with `role="table"`, marks rows `role="row"` and cells
`role="cell"`, and gives sortable headers `role="columnheader"` — which is
also what makes the sort cell's `aria-sort` legal. `ListRow`, `ListCell` and
`ListHeaderCellSort` forward their rest props so those roles can reach them.

## Styling and responsive behavior

Use semantic tokens and data-slot/data-state hooks. Text must remain legible in
both colour schemes and at 200% enlargement. Keep overflow inside an explicitly
scrollable region. Disabled controls must not activate. Do not communicate a
status using colour alone.
