---
'@newui/organisms': major
---

Remove the dead `PageToolbarTab` type export. It was exported from
`PageToolbar` but never used by the component (tabs are composed with
`Tabs`/`TabButtons` from `@newui/atoms` beside the toolbar, not through a
toolbar prop) and had no consumers. This is a breaking change only for
code importing the unused type; delete the import.
