---
"@talelk/newui-molecules": minor
---

The `List` family forwards rest props: `ListRow`, `ListCell` and
`ListHeaderCellSort` now accept (and type) the full set of div attributes, so
the caller's table contract can reach them — `role="table"` on the wrapper,
`role="row"`/`role="cell"` on rows and cells, and `role="columnheader"` on a
sortable header, which is also what makes its `aria-sort` legal. Previously
that composition was impossible from outside and axe flagged the bare
`aria-sort` div as an `aria-allowed-attr` violation.
