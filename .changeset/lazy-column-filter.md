---
'@talelk/newui-organisms': patch
---

`DataTable` loads its per-column filter popover (and the `NumberInput`,
`Popover` and `Select` it renders) lazily, the first time a filterable header
renders: tables without filterable columns no longer bundle it.
