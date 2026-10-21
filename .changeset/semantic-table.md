---
"@newui/atoms": patch
"@newui/molecules": minor
---

New semantic `Table` molecule: `Table`, `TableHead`, `TableBody`, `TableRow`
(with `selected` ⇒ `data-selected`), `TableColumnHeader` and `TableCell` style
the native elements for known, directly-rendered data. `ScrollTable` composes
the same shared header class from `control-styles`, so the two cannot drift.
`ScrollTable`'s root and head gain `data-slot` hooks.
