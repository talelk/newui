---
'@newui/data': minor
---

`@newui/data/table` — the promoted table surface.

```ts
import { DataTable, type DataTableColumn } from '@newui/data/table'
```

The collection→table composition six example pages had converged on, moved out
of the playground: search, sorting, pagination, column visibility, row selection
with a bulk action and an empty state.

TanStack Table is the engine and the reason the surface lives in `@newui/data`
rather than `@newui/ui`: a component package carrying a table engine would make
every `Button` pay for row models. It renders with `@newui/ui` — the single
carve-out from the layer's headless rule, scoped to `packages/data/src/table/**`
in the dependency rules.

`ScrollTable` (the focusable scroll shell for a table wider than its column) has
its own entry, `@newui/data/table/scroll`, so a page that renders a semantic
table of its own does not pull the TanStack composition in: importing both from
one entry added 20 kB to the accounting route, because rollup puts them in one
chunk.

Measured at 37.6 kB gzip on its own entry, budgeted, with a `forbid` list that
proves it drags no dialog, chart or editor with it. `data-slot` is now
`data-table` (it was `example-data-table` while it lived in the playground).
