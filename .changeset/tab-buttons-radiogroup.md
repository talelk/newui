---
'@talelk/newui-molecules': major
---

`TabButtons` is now a radiogroup. The root is `role="radiogroup"` with a
required `label`, each option is `role="radio"` with `aria-checked`, and the
old `role="tablist"` / `role="tab"` / `aria-selected` semantics are gone. The
`value` / `onValueChange` / `options` API is unchanged; code that queried tab
roles or styled `[role="tab"]` must move to radio roles. `Tabs` remains the
component for choices that own panels.

`TabButtons` also gains `wrap`, which lays options onto multiple rows and
replaces the sliding indicator with a variant-aware active surface.

`ScrollTable` gains `stickyHeader` for long scroll regions.
