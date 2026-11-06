---
'@talelk/newui-organisms': minor
---

Table superpowers (issue #19): header groups, row grouping, aggregation and
tree/detail rows in `DataTable`.

- **Header groups.** A column definition may carry `columns`, and the header
  stacks into as many rows as the tree is deep. No new prop — the column tree
  is the API. Placeholders keep the grid aligned and are never interactive.
- **Row grouping.** `grouping` (column ids, in order) is controllable through
  `onGroupingChange`; `groupingMode` decides whether a grouped column keeps its
  own column (`reorder`, the default) or leaves the list (`remove`), and
  `groupable: false` opts a column out. A group row is the recessed surface
  spanning the record columns: expander, the column's name, the shared value,
  the count, and the aggregated values. `renderGroupedCell` overrides it. In
  server mode `grouping` is echoed and rows arrive with `subRows` populated —
  server grouping is real rows, not synthetic ones.
- **Aggregation.** A column declares `aggregate` as one of the eleven built-ins
  (`sum`, `count`, `min`, `max`, `extent`, `mean`, `median`, `unique`,
  `uniqueCount`, `first`, `last`) or a function over the group's records.
  `summary: 'page' | 'all'` renders the footer row over the visible page or the
  whole filtered result; `aggregates` carries server-computed totals instead.
- **Tree and detail.** `getSubRows` gives a row children of the same shape,
  `renderDetail` gives any row a panel beneath it, and `onRowExpand` fires the
  moment a row opens — where a server page fetches children it has not sent.
  `filterFromLeafRows` filters a tree from its leaves, so a parent survives on
  a descendant's match.
- **Interactions.** Grouped and detail rows follow the active `density`; below
  the card breakpoint a group becomes a section header and its records stay
  flat cards (cards never nest). `rowSelectable` gates parents, select-all
  skips what is ineligible, and the bulk action receives record ids even for a
  tree row selected under a parent that is not itself selectable.
